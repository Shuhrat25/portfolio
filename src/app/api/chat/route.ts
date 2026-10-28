import { LANGS, type Lang } from "@/content/profile";
import { address, type Honorific } from "@/content/ui";
import { GeminiError, streamChat, type ChatTurn } from "@/lib/gemini";
import { systemPrompt } from "@/lib/knowledge";
import { allow, clientKey } from "@/lib/rate-limit";
import { after } from "next/server";
import { cacheKey, getCached, logQuestion, normalizeQuestion, putCached } from "@/lib/speech-cache";

const MAX_TURNS = 12;
const MAX_CHARS = 600;
const HONORIFICS: Honorific[] = ["male", "female", "name"];

type Body = {
  lang?: string;
  name?: string;
  honorific?: string;
  messages?: { role?: string; text?: string }[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const lang: Lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const honorific: Honorific = HONORIFICS.includes(body.honorific as Honorific) ? (body.honorific as Honorific) : "name";
  const name = typeof body.name === "string" ? body.name.slice(0, 40) : "";

  const turns: ChatTurn[] = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-MAX_TURNS)
    .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role as ChatTurn["role"], text: m.text!.slice(0, MAX_CHARS) }));

  if (turns.length === 0 || turns.at(-1)!.role !== "user") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // A first question does not depend on earlier turns, so its answer is generic (no visitor
  // name) and can be reused for everyone who asks the same thing. The prompt is part of the key,
  // so editing profile.ts invalidates old answers.
  const firstQuestion = turns.length === 1;
  const system = systemPrompt(lang, firstQuestion ? "" : address(lang, name, honorific));
  const key = firstQuestion ? cacheKey(system, lang, normalizeQuestion(turns[0].text)) : null;
  const question = turns.at(-1)!.text;
  if (key) {
    const cached = await getCached("chat", key);
    if (cached) {
      after(() => logQuestion(lang, question, true));
      return text(new Response(new Uint8Array(cached)).body!, "hit");
    }
  }

  if (!allow(clientKey(request, "chat"), 20, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  after(() => logQuestion(lang, question, false));

  try {
    const stream = await streamChat(system, turns, request.signal);
    return text(key ? remember(stream, key) : stream, "miss");
  } catch (error) {
    const status = error instanceof GeminiError && error.status === 429 ? 429 : 502;
    return Response.json({ error: status === 429 ? "rate_limited" : "upstream" }, { status });
  }
}

/** Passes the stream through and stores the full answer once it completed normally. */
function remember(stream: ReadableStream<Uint8Array>, key: string) {
  const chunks: Uint8Array[] = [];
  return stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        chunks.push(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        const answer = Buffer.concat(chunks);
        if (answer.length > 0) await putCached("chat", key, answer);
      },
    }),
  );
}

function text(body: ReadableStream<Uint8Array>, cache: "hit" | "miss") {
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-yui-cache": cache },
  });
}
