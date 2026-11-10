import { LANGS, type Lang } from "@/content/profile";
import { after } from "next/server";
import { GeminiError, PRONUNCIATION, synthesize, YUI_VOICE } from "@/lib/gemini";
import { allow, clientKey } from "@/lib/rate-limit";
import { cacheKey, getCached, putCached } from "@/lib/speech-cache";

const MAX_CHARS = 700;

export async function POST(request: Request) {
  // Even a replay costs a store read, so every request counts against this wider limit.
  if (!allow(clientKey(request, "tts-any"), 200, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { text?: string; lang?: string; personal?: boolean };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_CHARS) : "";
  const lang: Lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  if (!text) return Response.json({ error: "bad_request" }, { status: 400 });
  // A clip that addresses the visitor by name is never written to the shared store (the visitor's
  // browser still keeps its own copy).
  const personal = body.personal === true;

  // Already said once: replay it without touching Gemini or the visitor's synthesis limit.
  const key = cacheKey(YUI_VOICE, PRONUNCIATION, lang, text);
  const cached = await getCached("tts", key);
  if (cached) return wav(cached, "hit");

  if (!allow(clientKey(request, "tts"), 40, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const audio = Buffer.from(await synthesize(text, lang, request.signal));
    if (!personal) after(() => putCached("tts", key, audio));
    return wav(audio, "miss");
  } catch (error) {
    const status = error instanceof GeminiError && error.status === 429 ? 429 : 502;
    return Response.json({ error: status === 429 ? "rate_limited" : "upstream" }, { status });
  }
}

function wav(data: Buffer, cache: "hit" | "miss") {
  return new Response(new Uint8Array(data), {
    headers: { "content-type": "audio/wav", "cache-control": "no-store", "x-yui-cache": cache },
  });
}
