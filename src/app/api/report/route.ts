import { createHash, timingSafeEqual } from "node:crypto";
import { buildReport, buildStorageErrorReport } from "@/lib/report";
import { claimReport, listQuestions } from "@/lib/speech-cache";

// Weekly digest of visitors' questions to Yui, sent to Shuhrat's Telegram. Called by the Vercel
// cron in vercel.json (Mondays 04:00 UTC = 09:00 Tashkent). The report quotes visitors' own text,
// so nobody else may read it or set it off at will:
//   only "Authorization: Bearer <CRON_SECRET>" is accepted (Vercel sends it to the cron by itself).
//   A user agent proves nothing, so without CRON_SECRET the route sends nothing (503).
//   ?dry=1 returns the text instead of sending it: with the secret, or in development without one.
// Vercel may deliver one cron event twice: a cron run first claims its day in the store, and a
// repeat is skipped. Manual runs (with the secret and any other user agent) always send.

export const maxDuration = 60;

const HOUR_MS = 60 * 60_000;
const WEEK_MS = 7 * 24 * HOUR_MS;
// The store is read no longer than this, leaving the Telegram call (15 s) time within maxDuration.
const STORE_BUDGET_MS = 35_000;
const NO_STORE = { "cache-control": "no-store" };

const deny = () => Response.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
const notConfigured = () => Response.json({ error: "not_configured" }, { status: 503, headers: NO_STORE });

/** Constant-time comparison of two strings of any length. */
function same(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export async function GET(request: Request) {
  // Request data first: it also keeps this handler out of build-time prerendering.
  const auth = request.headers.get("authorization") ?? "";
  const agent = request.headers.get("user-agent") ?? "";
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const started = Date.now();

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (!dry || process.env.NODE_ENV !== "development") return notConfigured();
  } else if (!same(auth, `Bearer ${secret}`)) {
    return deny();
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!dry && (!token || !chatId)) return notConfigured();

  // Hobby crons start at any minute of the scheduled hour. The week ends on the hour, so every run
  // within 04:xx covers the same Monday 09:00 — Monday 09:00 (Tashkent): no gaps, no overlaps.
  const to = Math.floor(started / HOUR_MS) * HOUR_MS;
  const period = { from: to - WEEK_MS, to };

  if (!dry && agent.startsWith("vercel-cron") && !(await claimReport(started))) {
    return Response.json({ ok: true, skipped: true }, { headers: NO_STORE });
  }

  let text: string;
  try {
    const { entries, total } = await listQuestions(period.from, period.to, { until: started + STORE_BUDGET_MS });
    text = buildReport(entries, { ...period, total });
  } catch {
    if (dry) return Response.json({ error: "storage" }, { status: 502, headers: NO_STORE });
    text = buildStorageErrorReport(period);
  }

  if (dry) {
    return new Response(text, { headers: { ...NO_STORE, "content-type": "text/plain; charset=utf-8" } });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!res?.ok) return Response.json({ error: "upstream" }, { status: 502, headers: NO_STORE });

  return Response.json({ ok: true }, { headers: NO_STORE });
}
