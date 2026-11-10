// Pre-generates Yui's scripted lines with Gemini TTS into public/voice/<lang>/*.mp3.
// Usage: node scripts/generate-voice.mjs [--force] [--only=ru]
// Needs GEMINI_API_KEY in .env.local and ffmpeg on PATH. Re-run with --force after changing
// the texts in src/content/narration.ts or the voice in src/lib/gemini.ts.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { synthesize, GeminiError } = await import("../src/lib/gemini.ts");
const { narration, sectionLines } = await import("../src/content/narration.ts");
const { greeting } = await import("../src/content/ui.ts");
const { cardinal, projects } = await import("../src/content/profile.ts");
const { faq } = await import("../src/content/faq.ts");

const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const langs = only ? [only] : ["en", "ru", "uz"];

const jobs = [];
for (const lang of langs) {
  jobs.push({ lang, file: "greeting", text: greeting(lang, "", "name", false) });
  for (const [panel, text] of Object.entries(sectionLines)) jobs.push({ lang, file: `section-${panel}`, text: text[lang] });
  narration.forEach((step, i) => jobs.push({ lang, file: `narration-${i}`, text: step.text[lang] }));
  // Suggested questions first (the most tapped), then the "Tell me more" stories, CARDINAL first.
  for (const item of faq) jobs.push({ lang, file: `faq-${item.id}`, text: item.a[lang] });
  cardinal.story.forEach((step, i) => jobs.push({ lang, file: `cardinal-${i}`, text: step[lang] }));
  for (const p of projects) if (p.story) jobs.push({ lang, file: `project-${p.id}`, text: p.story[lang] });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let made = 0;
let exhausted = false;
for (const job of jobs) {
  if (exhausted) break;
  const dir = join(root, "public", "voice", job.lang);
  const mp3 = join(dir, `${job.file}.mp3`);
  if (existsSync(mp3) && !force) continue;
  mkdirSync(dir, { recursive: true });
  for (let attempt = 1; ; attempt++) {
    try {
      const wav = Buffer.from(await synthesize(job.text, job.lang));
      const tmp = join(dir, `${job.file}.wav`);
      writeFileSync(tmp, wav);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-b:a", "64k", mp3]);
      rmSync(tmp);
      made++;
      console.log(`✓ ${job.lang}/${job.file}.mp3`);
      break;
    } catch (error) {
      const status = error instanceof GeminiError ? error.status : 0;
      if (attempt >= 5) {
        console.error(`✗ ${job.lang}/${job.file}: ${error.message}`);
        // Still rate-limited after every retry: the daily TTS quota is used up, so stop here and
        // re-run tomorrow (finished files are skipped).
        exhausted = status === 429;
        break;
      }
      const wait = status === 429 ? 30_000 * attempt : 4_000 * attempt;
      console.log(`… ${job.lang}/${job.file} failed (${status || error.message}), retry in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
  await sleep(1200);
}
console.log(`done: ${made} new file(s), ${jobs.length} total${exhausted ? "; stopped: daily TTS quota used up, run again tomorrow" : ""}`);
