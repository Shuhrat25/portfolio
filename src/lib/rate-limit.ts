// Sliding-window limiter kept in memory. Good enough for a portfolio: each serverless instance
// keeps its own window, which still stops one visitor from draining the Gemini quota.
// Each bucket remembers its own window, so pruning for a 10-minute caller never drops a
// 24-hour bucket that is still counting.
const buckets = new Map<string, { hits: number[]; windowMs: number }>();

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key)?.hits ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, { hits, windowMs });
    return false;
  }
  hits.push(now);
  buckets.set(key, { hits, windowMs });
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (!b.hits.some((t) => now - t < b.windowMs)) buckets.delete(k);
  }
  return true;
}
