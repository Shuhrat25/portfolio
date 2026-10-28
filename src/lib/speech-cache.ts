// Yui remembers what she has already said: synthesized clips and answers to first questions are
// stored and served again instead of calling Gemini (the free TTS tier allows ~10 clips a day).
// Storage: memory + files in .cache/yui (or YUI_CACHE_DIR). On serverless hosts the file layer is
// per-instance /tmp, so a shared store (Vercel Blob, Supabase) can replace `disk` later.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type CacheKind = "tts" | "chat";

const DIR =
  process.env.YUI_CACHE_DIR || (process.env.VERCEL ? join(tmpdir(), "yui-cache") : join(/*turbopackIgnore: true*/ process.cwd(), ".cache", "yui"));
const MEMORY_BUDGET = 48 * 1024 * 1024;

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

// The cache lives outside the bundle, so these paths are excluded from Next's file tracing.
const file = (kind: CacheKind, key: string) => join(/*turbopackIgnore: true*/ DIR, kind, `${key}.${kind === "tts" ? "wav" : "txt"}`);

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

export async function getCached(kind: CacheKind, key: string): Promise<Buffer | null> {
  const id = `${kind}:${key}`;
  const hot = memory.get(id);
  if (hot) {
    remember(id, hot);
    return hot;
  }
  try {
    const data = await readFile(/*turbopackIgnore: true*/ file(kind, key));
    remember(id, data);
    return data;
  } catch {
    return null;
  }
}

export async function putCached(kind: CacheKind, key: string, data: Buffer): Promise<void> {
  remember(`${kind}:${key}`, data);
  try {
    await mkdir(/*turbopackIgnore: true*/ join(DIR, kind), { recursive: true });
    await writeFile(/*turbopackIgnore: true*/ file(kind, key), data);
  } catch {
    // read-only filesystem: memory still helps this instance
  }
}
