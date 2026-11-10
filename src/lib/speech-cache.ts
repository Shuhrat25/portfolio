// Yui remembers what she has already said: synthesized clips and answers to first questions are
// stored and served again instead of calling Gemini (the free TTS tier allows ~10 clips a day).
// Layers: memory → Vercel Blob (private store, when BLOB_READ_WRITE_TOKEN is set — shared by
// every serverless instance) → otherwise files in .cache/yui (local development).
import { get, put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
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
