import { allow, clientKey } from "@/lib/rate-limit";

// Delivers order requests to Shuhrat's Telegram through a bot.
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; without them the form shows direct contacts instead.
type Order = { name?: string; contact?: string; type?: string; budget?: string; message?: string; website?: string; lang?: string };

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(request: Request) {
  if (!allow(clientKey(request, "order"), 3, 10 * 60_000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Order;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (clip(body.website, 200)) return Response.json({ ok: true });

  const order = {
    name: clip(body.name, 80),
    contact: clip(body.contact, 120),
    type: clip(body.type, 40),
    budget: clip(body.budget, 60),
    message: clip(body.message, 2000),
    lang: clip(body.lang, 4),
  };
  if (!order.name || !order.contact || !order.message) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return Response.json({ error: "not_configured" }, { status: 503 });

  const text = [
    "New project request from the portfolio",
    `Name: ${order.name}`,
    `Contact: ${order.contact}`,
    `Type: ${order.type || "-"}`,
    `Budget: ${order.budget || "-"}`,
    `Language: ${order.lang || "-"}`,
    "",
    order.message,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) return Response.json({ error: "upstream" }, { status: 502 });
  return Response.json({ ok: true });
}
