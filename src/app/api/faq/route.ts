import { after } from "next/server";
import { faq } from "@/content/faq";
import { LANGS, type Lang } from "@/content/profile";
import { allow, clientKey } from "@/lib/rate-limit";
import { logFaqTap } from "@/lib/speech-cache";

// Counts a tap on one of the suggested questions under the chat for the weekly report: which
// suggestion and in which language, nothing about the visitor. Sent with navigator.sendBeacon.

const NO_STORE = { "cache-control": "no-store" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400, headers: NO_STORE });
  }
  // `null`, a number or an array parse fine but are not a tap.
  const { id, lang: rawLang } = body && typeof body === "object" ? (body as { id?: unknown; lang?: unknown }) : {};
  const item = faq.find((f) => f.id === id);
  const lang = LANGS.find((l): l is Lang => l === rawLang);
  if (!item || !lang) return Response.json({ error: "bad_request" }, { status: 400, headers: NO_STORE });
  // One visitor has ten suggestions (twenty after a restart); more than that is not a person reading.
  if (!allow(clientKey(request, "faq"), 20, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: NO_STORE });
  }
  after(() => logFaqTap(item.id, lang));
  return new Response(null, { status: 204, headers: NO_STORE });
}
