// Thin REST client for the Gemini API. Server-only: reads GEMINI_API_KEY from the environment.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Tried in order; the next model is used when one is overloaded or rate-limited.
const TEXT_MODELS: { model: string; thinking: string }[] = [
  { model: "gemini-3.5-flash", thinking: "minimal" },
  { model: "gemini-3.1-flash-lite", thinking: "minimal" },
  { model: "gemini-3.8-flash", thinking: "low" },
];

const TTS_MODELS = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"];

export const YUI_VOICE = process.env.GEMINI_TTS_VOICE || "Leda";

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

export type ChatTurn = { role: "user" | "model"; text: string };

/** Streams plain text deltas from the first model that accepts the request. */
export async function streamChat(system: string, turns: ChatTurn[], signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const body = (thinking: string) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      generationConfig: { maxOutputTokens: 700, temperature: 0.7, thinkingConfig: { thinkingLevel: thinking } },
    });

  let lastStatus = 0;
  for (const { model, thinking } of TEXT_MODELS) {
    const res = await fetch(`${BASE}/${model}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey(), "content-type": "application/json" },
      body: body(thinking),
      signal,
    });
    if (res.ok && res.body) return sseToText(res.body);
    lastStatus = res.status;
    await res.body?.cancel();
    if (!RETRYABLE.has(res.status)) break;
  }
  throw new GeminiError(lastStatus);
}

function sseToText(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const data = JSON.parse(line.slice(5));
            const parts: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts ?? [];
            const text = parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("");
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ignore partial or keep-alive lines
          }
        }
      },
    }),
  );
}

/**
 * Returns a WAV file (24 kHz mono) for the given text. Only the text itself is sent: the TTS
 * models read a style instruction aloud, so Yui's character comes from the voice alone.
 */
export async function synthesize(text: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  let lastStatus = 0;
  for (const model of TTS_MODELS) {
    const res = await fetch(`${BASE}/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey(), "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: YUI_VOICE } } },
        },
      }),
      signal,
    });
    if (res.ok) {
      const data = await res.json();
      const inline = data.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData;
      if (inline?.data) return toWav(Buffer.from(inline.data, "base64"), inline.mimeType ?? "");
      lastStatus = 502;
      continue;
    }
    lastStatus = res.status;
    await res.body?.cancel();
    if (!RETRYABLE.has(res.status)) break;
  }
  throw new GeminiError(lastStatus);
}

// The API returns WAV today, but older TTS models return raw 16-bit PCM ("audio/L16;rate=24000").
function toWav(bytes: Buffer, mime: string): ArrayBuffer {
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF") {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) as ArrayBuffer;
  }
  const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + bytes.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(bytes.length, 40);
  const out = Buffer.concat([header, bytes]);
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.length) as ArrayBuffer;
}

export class GeminiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Gemini request failed with status ${status}`);
    this.status = status;
  }
}
