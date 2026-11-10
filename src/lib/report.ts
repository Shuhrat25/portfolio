// Weekly digest of what visitors asked Yui, sent to Shuhrat's Telegram by /api/report.
// Pure functions only: the route lists the questions and sends the text.
import { normalizeQuestion, type QuestionEntry } from "@/lib/speech-cache";

/** Telegram allows 4096 characters; the rest is headroom. Measured in UTF-16 units, which never undercounts. */
export const REPORT_LIMIT = 3900;
const TOP = 10;
const QUESTION_CHARS = 140;
const KNOWN_LANGS = ["en", "ru", "uz"];

export type ReportPeriod = { from: number; to: number };
export type ReportOptions = ReportPeriod & {
  /** How many questions the period holds when `entries` is only the newest part of them. */
  total?: number;
  /** Length budget, REPORT_LIMIT by default. */
  limit?: number;
};

const TASHKENT = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Tashkent",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "03.11.2026 09:00" in Tashkent time. */
export function tashkentTime(ms: number): string {
  const p: Record<string, string> = {};
  for (const part of TASHKENT.formatToParts(new Date(ms))) p[part.type] = part.value;
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
}

function heading({ from, to }: ReportPeriod): string[] {
  return ["Юи: что спрашивали посетители за неделю", `${tashkentTime(from)} — ${tashkentTime(to)} (Ташкент)`];
}

/**
 * One line of visitor text: line breaks and control characters become spaces, invisible format
 * characters (bidi overrides, zero-width, tags) are dropped except the joiner inside emoji, and
 * the result is cut to `max` code points so a surrogate pair is never split.
 */
export function clipQuestion(text: string, max = QUESTION_CHARS): string {
  const flat = text
    .replace(/[\p{Cf}]/gu, (c) => (c === "‍" ? c : ""))
    .replace(/[\p{Cc}\p{Z}\s]+/gu, " ")
    .trim();
  const chars = Array.from(flat);
  return chars.length > max ? `${chars.slice(0, max - 1).join("").trimEnd()}…` : flat;
}

function langLabel(lang: string): string {
  const code = lang.toLowerCase();
  return KNOWN_LANGS.includes(code) ? code.toUpperCase() : "??";
}

export type Group = { count: number; last: number; langs: Set<string>; variants: Map<string, number>; text: string };

/** Questions that normalise to the same text are one group; its face is its most frequent wording. */
export function groupQuestions(entries: QuestionEntry[]): Group[] {
  const groups = new Map<string, Group>();
  for (const entry of entries) {
    const text = clipQuestion(entry.q);
    if (!text) continue;
    // Symbol-only questions normalise to "": keep them apart instead of lumping them together.
    const key = normalizeQuestion(entry.q) || `\u0000${text}`;
    const at = Date.parse(entry.at) || 0;
    const group = groups.get(key) ?? { count: 0, last: 0, langs: new Set(), variants: new Map(), text };
    group.count++;
    group.last = Math.max(group.last, at);
    group.langs.add(langLabel(entry.lang));
    group.variants.set(text, (group.variants.get(text) ?? 0) + 1);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    let best = 0;
    for (const [text, n] of group.variants) {
      if (n > best) [best, group.text] = [n, text];
    }
  }
  return [...groups.values()];
}

const LABEL_ORDER = [...KNOWN_LANGS.map((code) => code.toUpperCase()), "??"];
const langs = (group: Group) => LABEL_ORDER.filter((label) => group.langs.has(label)).join("/");

/** Plain text (no parse_mode) under `limit` characters. */
export function buildReport(entries: QuestionEntry[], options: ReportOptions): string {
  const limit = options.limit ?? REPORT_LIMIT;
  const total = Math.max(options.total ?? entries.length, entries.length);
  const lines = heading(options);
  lines.push("");

  if (total === 0) {
    lines.push("За неделю вопросов не было.");
    return fit(lines.join("\n"), limit);
  }
  if (entries.length === 0) {
    lines.push(`Вопросов за неделю: ${total}, но прочитать их не удалось.`);
    return fit(lines.join("\n"), limit);
  }

  const counts = new Map<string, number>();
  for (const entry of entries) {
    const label = langLabel(entry.lang);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const byLang = KNOWN_LANGS.map((code) => `${code.toUpperCase()} ${counts.get(code.toUpperCase()) ?? 0}`);
  if (counts.get("??")) byLang.push(`другие ${counts.get("??")}`);

  lines.push(
    total > entries.length ? `Всего вопросов: ${total} (ниже — последние ${entries.length})` : `Всего вопросов: ${total}`,
    `Ответы из общего кэша: ${entries.filter((e) => e.cached).length}`,
    `По языкам: ${byLang.join(" · ")}`,
  );

  // Asked more than once, most asked first (among equals, the most recent); then the rest, newest first.
  const groups = groupQuestions(entries).sort((a, b) => b.count - a.count || b.last - a.last);
  const top = groups.filter((g) => g.count > 1).slice(0, TOP);
  const rest = groups.slice(top.length).sort((a, b) => b.last - a.last);
  const topTitle = `\n\nЧаще всего спрашивали (топ-${TOP}):`;
  const restTitle = `\n\n${top.length ? "Остальные вопросы" : "Вопросы"} (новые сверху):`;
  const items = [
    ...top.map((g, i) => ({ title: topTitle, line: `\n${i + 1}. ${g.text} — ${g.count}× (${langs(g)})` })),
    ...rest.map((g) => ({ title: restTitle, line: `\n• ${langs(g)}: ${g.text}${g.count > 1 ? ` — ${g.count}×` : ""}` })),
  ];

  // Lines go in while they fit together with the "…и ещё N" that would follow them.
  const more = (n: number) => (n > 0 ? `\n…и ещё ${n}` : "");
  let text = lines.join("\n");
  let section = "";
  let shown = 0;
  for (const item of items) {
    const add = (item.title === section ? "" : item.title) + item.line;
    if (text.length + add.length + more(items.length - shown - 1).length > limit) break;
    text += add;
    section = item.title;
    shown++;
  }
  return fit(text + more(items.length - shown), limit);
}

/** Sent instead of the digest when the question log cannot be read. */
export function buildStorageErrorReport(period: ReportPeriod): string {
  return [...heading(period), "", "Отчёт не собран: хранилище вопросов недоступно."].join("\n");
}

/** Last resort, never expected to cut: the sections above already respect the budget. */
function fit(text: string, limit: number): string {
  if (text.length <= limit) return text;
  let cut = text.slice(0, limit - 1);
  if (/[\ud800-\udbff]$/.test(cut)) cut = cut.slice(0, -1);
  return `${cut}…`;
}
