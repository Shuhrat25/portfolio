// Yui remembers what she has already said: synthesized clips and answers to first questions are
// stored and served again instead of calling Gemini (the free TTS tier allows ~10 clips a day).
// Layers: memory → Vercel Blob (private store, when BLOB_READ_WRITE_TOKEN is set — shared by
// every serverless instance) → otherwise files in .cache/yui (local development).
import { BlobError, get, list, put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, open, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { allow } from "@/lib/rate-limit";

export type CacheKind = "tts" | "chat";

const BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DIR = process.env.YUI_CACHE_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".cache", "yui");
const MEMORY_BUDGET = 48 * 1024 * 1024;
// A slow store must not hold a request: past these limits a read is a miss and a write is dropped.
const READ_TIMEOUT_MS = 2500;
const WRITE_TIMEOUT_MS = 5000;
// Question log writes per instance per day, whatever the visitor's IP.
const LOG_PER_DAY = 300;

/**
 * Aborts after `ms`. A plain abort (AbortError) makes @vercel/blob give up at once; the
 * TimeoutError of AbortSignal.timeout() is retried by put() with backoff for many minutes.
 */
function deadline(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

const memory = new Map<string, Buffer>();
let memoryBytes = 0;

export function cacheKey(...parts: string[]): string {
  return createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 40);
}

/** Lowercase, unify ё/е, drop punctuation: "Какие проекты?" and "какие проекты" are one question. */
export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[’‘`ʻʼ]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Only plain sentences get a shared answer: all that normalizeQuestion drops from them is visible
 * punctuation and spaces. Invisible or format characters (zero-width, bidi, Unicode tags,
 * variation selectors), symbols ("C++", "C#") and emoji would vanish from the key while the model
 * still reads them, so such questions are answered but not cached.
 */
export function cacheableQuestion(text: string): boolean {
  return /^[\p{L}\p{N} .,!?;:'"«»„“”‘’`()…\-–—]+$/u.test(text);
}

const ext = (kind: CacheKind) => (kind === "tts" ? "wav" : "txt");
const pathname = (kind: CacheKind, key: string) => `${kind}/${key}.${ext(kind)}`;
// The cache lives outside the bundle, so these paths are excluded from Next's file tracing.
const file = (kind: CacheKind, key: string) => join(/*turbopackIgnore: true*/ DIR, kind, `${key}.${ext(kind)}`);

function remember(id: string, data: Buffer) {
  if (data.length > MEMORY_BUDGET / 4) return;
  const old = memory.get(id);
  if (old) memoryBytes -= old.length;
  memory.delete(id);
  memory.set(id, data);
  memoryBytes += data.length;
  // Map keeps insertion order, so the first entries are the least recently used.
  for (const [k, v] of memory) {
    if (memoryBytes <= MEMORY_BUDGET) break;
    memory.delete(k);
    memoryBytes -= v.length;
  }
}

async function readBlob(path: string): Promise<Buffer | null> {
  // The same signal also bounds reading the body.
  const found = await get(path, { access: "private", abortSignal: deadline(READ_TIMEOUT_MS) });
  if (!found) return null;
  return Buffer.from(await new Response(found.stream).arrayBuffer());
}

export async function getCached(kind: CacheKind, key: string): Promise<Buffer | null> {
  const id = `${kind}:${key}`;
  const hot = memory.get(id);
  if (hot) {
    remember(id, hot);
    return hot;
  }
  try {
    const data = BLOB ? await readBlob(pathname(kind, key)) : await readFile(/*turbopackIgnore: true*/ file(kind, key));
    if (data) remember(id, data);
    return data;
  } catch {
    return null; // a missing file or an unreachable store is just a cache miss
  }
}

export async function putCached(kind: CacheKind, key: string, data: Buffer): Promise<void> {
  remember(`${kind}:${key}`, data);
  try {
    if (BLOB) {
      await put(pathname(kind, key), data, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: kind === "tts" ? "audio/wav" : "text/plain; charset=utf-8",
        abortSignal: deadline(WRITE_TIMEOUT_MS),
      });
    } else {
      await mkdir(/*turbopackIgnore: true*/ join(DIR, kind), { recursive: true });
      await writeFile(/*turbopackIgnore: true*/ file(kind, key), data);
    }
  } catch {
    // storage unavailable: memory still helps this instance
  }
}

/**
 * Anonymous question log for improving Yui's knowledge: text, language and time only — no IP,
 * no visitor name. Browse it in Vercel → Storage → yui-memory → questions/.
 */
export async function logQuestion(lang: string, question: string, cached: boolean): Promise<void> {
  if (!allow("log:all", LOG_PER_DAY, 24 * 60 * 60_000)) return;
  const at = new Date();
  const entry = JSON.stringify({ at: at.toISOString(), lang, q: question.slice(0, 600), cached });
  try {
    if (BLOB) {
      const day = at.toISOString().slice(0, 10);
      await put(`questions/${day}/${at.getTime()}-${randomUUID().slice(0, 8)}.json`, entry, {
        access: "private",
        addRandomSuffix: false,
        contentType: "application/json",
        abortSignal: deadline(WRITE_TIMEOUT_MS),
      });
    } else {
      await mkdir(/*turbopackIgnore: true*/ DIR, { recursive: true });
      await appendFile(/*turbopackIgnore: true*/ join(DIR, "questions.jsonl"), entry + "\n");
    }
  } catch {
    // logging must never break the chat
  }
}

/** One logged visitor question, as logQuestion stores it. */
export type QuestionEntry = { at: string; lang: string; q: string; cached: boolean };

const DAY_MS = 24 * 60 * 60_000;
const LIST_TIMEOUT_MS = 10_000;
// Pages of 1000 names per day folder; LOG_PER_DAY per instance stays far below this.
const LIST_PAGES_PER_DAY = 5;
const READS_AT_ONCE = 8;

function toEntry(raw: unknown): QuestionEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const { at, lang, q, cached } = raw as Record<string, unknown>;
  if (typeof at !== "string" || typeof q !== "string" || Number.isNaN(Date.parse(at))) return null;
  return { at, lang: typeof lang === "string" ? lang : "", q, cached: cached === true };
}

const byTime = (a: QuestionEntry, b: QuestionEntry) => Date.parse(a.at) - Date.parse(b.at);

/** Runs `fn` over `items` with at most `limit` calls in flight; results keep the input order. */
async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function listQuestionsBlob(fromMs: number, toMs: number, max: number, until: number) {
  const left = () => until - Date.now();
  const found: { pathname: string; ms: number }[] = [];
  // logQuestion files questions by UTC day, so only the folders of the period are listed.
  for (let day = Math.floor(fromMs / DAY_MS) * DAY_MS; day < toMs; day += DAY_MS) {
    const prefix = `questions/${new Date(day).toISOString().slice(0, 10)}/`;
    let cursor: string | undefined;
    for (let page = 0; page < LIST_PAGES_PER_DAY; page++) {
      if (left() <= 0) throw new Error("question listing ran out of time");
      const res = await list({ prefix, cursor, limit: 1000, abortSignal: deadline(Math.min(LIST_TIMEOUT_MS, left())) });
      for (const blob of res.blobs) {
        // Names start with the logging time in ms, so a file is placed without reading it.
        const stamp = /^(\d{10,})-/.exec(blob.pathname.slice(prefix.length));
        const ms = stamp ? Number(stamp[1]) : blob.uploadedAt.getTime();
        if (ms >= fromMs && ms < toMs) found.push({ pathname: blob.pathname, ms });
      }
      if (!res.hasMore || !res.cursor) break;
      cursor = res.cursor;
    }
  }
  found.sort((a, b) => b.ms - a.ms);
  const read = await mapLimited(found.slice(0, max), READS_AT_ONCE, async ({ pathname }) => {
    if (left() <= 0) return null; // out of time: the newest questions read so far make the report
    try {
      const data = await readBlob(pathname);
      return data ? toEntry(JSON.parse(data.toString("utf8"))) : null;
    } catch {
      return null; // one unreadable file must not sink the whole listing
    }
  });
  return { entries: read.filter((e): e is QuestionEntry => e !== null).sort(byTime), total: found.length };
}

async function listQuestionsLocal(fromMs: number, toMs: number, max: number) {
  const handle = await open(/*turbopackIgnore: true*/ join(DIR, "questions.jsonl")).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (!handle) return { entries: [], total: 0 };
  const kept: QuestionEntry[] = [];
  let total = 0;
  try {
    for await (const line of handle.readLines()) {
      let entry: QuestionEntry | null = null;
      try {
        entry = toEntry(JSON.parse(line));
      } catch {
        // a torn or foreign line is skipped
      }
      if (!entry) continue;
      const ms = Date.parse(entry.at);
      if (ms < fromMs || ms >= toMs) continue;
      total++;
      kept.push(entry);
      // Lines are appended in time order: keep only the newest `max`, in bounded memory.
      if (kept.length >= max * 2) kept.splice(0, kept.length - max);
    }
  } finally {
    await handle.close().catch(() => {});
  }
  return { entries: kept.slice(Math.max(0, kept.length - max)).sort(byTime), total };
}

/**
 * Questions logged in [fromMs, toMs): the newest `max` of them, oldest first, and how many the
 * period holds in all. Bounded work: one listing per day of the period and at most `max` reads.
 * With `until` (a time in ms) the Blob store is read no later than that: a listing it cannot finish
 * throws, and reads not started by then are left out (`total` still counts them).
 * Throws when the store cannot be listed.
 */
export async function listQuestions(
  fromMs: number,
  toMs: number,
  { max = 300, until = Infinity }: { max?: number; until?: number } = {},
): Promise<{ entries: QuestionEntry[]; total: number }> {
  const cap = Math.max(0, Math.floor(max));
  return BLOB ? listQuestionsBlob(fromMs, toMs, cap, until) : listQuestionsLocal(fromMs, toMs, cap);
}

/**
 * Claims the weekly report for the UTC day of `ms`: true the first time, false when that day is
 * already claimed. The claim is only created if absent, so two deliveries of one cron event cannot
 * both pass, even at the same moment. A store that cannot be reached does not hold the report back.
 */
export async function claimReport(ms: number): Promise<boolean> {
  const name = `${new Date(ms).toISOString().slice(0, 10)}.json`;
  const data = JSON.stringify({ at: new Date(ms).toISOString() });
  try {
    if (BLOB) {
      await put(`reports/${name}`, data, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
        abortSignal: deadline(WRITE_TIMEOUT_MS),
      });
    } else {
      await mkdir(/*turbopackIgnore: true*/ join(DIR, "reports"), { recursive: true });
      await writeFile(/*turbopackIgnore: true*/ join(DIR, "reports", name), data, { flag: "wx" });
    }
    return true;
  } catch (error) {
    const taken = BLOB
      ? error instanceof BlobError && /already exists/i.test(error.message)
      : (error as NodeJS.ErrnoException).code === "EEXIST";
    return !taken;
  }
}
