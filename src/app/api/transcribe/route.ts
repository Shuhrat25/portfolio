import { LANGS, type Lang } from "@/content/profile";
import { GeminiError } from "@/lib/gemini";
import { allow, clientKey } from "@/lib/rate-limit";

// Speech-to-text for browsers without a working Web Speech API. The recording goes to Gemini as
// inline audio and is dropped with the request: it is never logged or stored.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Text models, tried in order. Not gemini-3.5-transcribe: its free tier allows 25 requests a day.
const MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"];
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 2 * 1024 * 1024;
const MIN_BYTES = 256;
const MAX_CHARS = 600;

const startsWith = (b: Uint8Array, at: number, text: string) => [...text].every((c, i) => b[at + i] === c.charCodeAt(0));

// Accepted containers and their magic bytes: the declared type has to match the data.
// The client sends 16 kHz WAV when it can re-encode, otherwise its MediaRecorder output.
const FORMATS = new Map<string, (b: Uint8Array) => boolean>([
  ["audio/wav", (b) => startsWith(b, 0, "RIFF") && startsWith(b, 8, "WAVE")],
  ["audio/webm", (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3],
  ["audio/ogg", (b) => startsWith(b, 0, "OggS")],
  ["audio/mp4", (b) => startsWith(b, 4, "ftyp")],
]);

const SPOKEN: Record<Lang, string> = {
  en: "The speaker talks English.",
  ru: "The speaker talks Russian: write it in Cyrillic.",
  uz: "The speaker talks Uzbek: write it in the Uzbek Latin alphabet (oʻ, gʻ, sh, ch), never in Cyrillic.",
};

function instruction(lang: Lang) {
  return [
    "Transcribe the speech in this recording verbatim.",
    SPOKEN[lang],
    "It is a visitor's question to Yui, the AI assistant on the portfolio of the developer Shuhrat Abdurahmonov (Шухрат Абдурахмонов).",
    "Keep names and technical terms in their usual spelling (React, Next.js, Three.js, CARDINAL).",
    "Output only the transcript: no quotes, labels, translation or comments. If there is no intelligible speech, output nothing.",
  ].join(" ");
}

export async function POST(request: Request) {
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const matches = FORMATS.get(type);
  if (!matches) return Response.json({ error: "unsupported_type" }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }
  const param = new URL(request.url).searchParams.get("lang");
  const lang: Lang = LANGS.includes(param as Lang) ? (param as Lang) : "en";

  if (!allow(clientKey(request, "transcribe"), 10, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let audio: Uint8Array | null;
  try {
    audio = await readBody(request, MAX_BYTES);
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!audio) return Response.json({ error: "too_large" }, { status: 413 });
  if (audio.length < MIN_BYTES || !matches(audio)) return Response.json({ error: "bad_audio" }, { status: 400 });

  try {
    const text = await transcribe(audio, type, lang, request.signal);
    return Response.json({ text }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof GeminiError && error.status === 429 ? 429 : 502;
    return Response.json({ error: status === 429 ? "rate_limited" : "upstream" }, { status });
  }
}

/** Reads the body up to `max` bytes; null when it is larger (Content-Length can be absent or wrong). */
async function readBody(request: Request, max: number): Promise<Uint8Array | null> {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

type Reply = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };

async function transcribe(audio: Uint8Array, type: string, lang: Lang, signal: AbortSignal): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError(503);
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: type, data: Buffer.from(audio).toString("base64") } }, { text: instruction(lang) }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 400, thinkingConfig: { thinkingLevel: "minimal" } },
  });

  let lastStatus = 0;
  for (const model of MODELS) {
    const res = await postWithin(
      `${BASE}/${model}:generateContent`,
      { method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body },
      TIMEOUT_MS,
      signal,
    );
    if (res.data) {
      const parts = res.data.candidates?.[0]?.content?.parts ?? [];
      return clean(parts.filter((p) => !p.thought).map((p) => p.text ?? "").join(""));
    }
    lastStatus = res.status;
    if (!RETRYABLE.has(res.status)) break;
  }
  throw new GeminiError(lastStatus);
}

/**
 * POST that gives up after `ms`, reply included. A timeout or an unreadable reply counts as a
 * 504 so the next model is tried; an abort from the visitor still throws.
 */
async function postWithin(url: string, init: RequestInit, ms: number, signal: AbortSignal): Promise<{ status: number; data?: Reply }> {
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal.reason);
  signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("Gemini timeout", "TimeoutError")), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      await res.body?.cancel();
      return { status: res.status };
    }
    return { status: res.status, data: (await res.json()) as Reply };
  } catch (error) {
    if (signal.aborted) throw error;
    return { status: 504 };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

// One line, without the quotes models sometimes wrap a transcript in.
function clean(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["«“„]\s*([\s\S]*?)\s*["»”]$/, "$1")
    .slice(0, MAX_CHARS);
}
