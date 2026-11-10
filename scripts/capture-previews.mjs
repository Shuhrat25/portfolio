// Captures project previews from the live demos into public/projects/: a poster <id>.webp for every
// project with a *.vercel.app demo, plus a short muted loop <id>.mp4 for the 3D ones.
// Usage: node scripts/capture-previews.mjs [--only=solar-system,hologram-house] [--wait=12000] [--no-warm]
// Needs Microsoft Edge (or EDGE_PATH) and ffmpeg on PATH. Drives a muted headless Edge over the
// DevTools Protocol with Node's built-in fetch and WebSocket, so no extra packages.
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { projects } = await import("../src/content/profile.ts");

const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const VIEW = { width: 1280, height: 800 };
const CLIP_MS = 4000;
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const only = arg("only")?.split(",");
const settle = Number(arg("wait") ?? 8000);

// Clicks the first button or label whose text starts with `text` (the 3D demos are Russian-only).
const click = (text) =>
  `[...document.querySelectorAll("button,label,[role=button]")].find((el) => el.innerText.trim().startsWith(${JSON.stringify(text)}))?.click()`;

// Per-project tweaks. wait: settle time before the poster; clipDelay: extra wait between poster
// and clip; prepare: steps run right before the clip (strings are page scripts, numbers are pauses).
const TUNE = {
  // Poster on the intro title; the clip starts the autopilot to Saturn once the intro is over.
  "solar-system": { wait: 13000, clipDelay: 9000, prepare: [click("Сатурн")] },
  "restorers-bench": { wait: 10000, prepare: [click("Автовращение")] },
  // The first hologram switch compiles its shaders and stalls a frame or two: warm it up, go back,
  // then switch again on camera so the clip shows the re-materialisation.
  "hologram-house": {
    wait: 10000,
    prepare: [click("Голограмма"), 3500, click("Реальный вид"), 1500, click("Голограмма")],
  },
};

// Demos whose backend was down at the last capture (TalentPulse: Supabase tenant gone; Video
// Player: /api/titles 502). A placeholder is shown instead; name them in --only to re-capture.
const HOLD = ["talentpulse", "video-player"];

const jobs = projects.filter(
  (p) =>
    p.demo &&
    new URL(p.demo).hostname.endsWith(".vercel.app") &&
    (only ? only.includes(p.id) : !HOLD.includes(p.id)),
);
if (!jobs.length) {
  console.log("Nothing to capture.");
  process.exit(0);
}

const out = join(root, "public", "projects");
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "previews-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer().listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

// Minimal CDP client over one browser-level socket; page commands go through flat sessions.
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.calls = new Map();
    this.listeners = new Set();
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.calls.has(msg.id)) {
        const { resolve, reject } = this.calls.get(msg.id);
        this.calls.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error("CDP socket failed")), { once: true });
    });
    return new Cdp(ws);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.calls.set(id, { resolve, reject }));
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  waitFor(method, sessionId, ms) {
    return new Promise((resolve) => {
      const off = this.on((msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          off();
          clearTimeout(timer);
          resolve(true);
        }
      });
      const timer = setTimeout(() => {
        off();
        resolve(false);
      }, ms);
    });
  }
}

async function openPage(cdp, url, userAgent) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const s = (method, params) => cdp.send(method, params, sessionId);
  await s("Page.enable");
  await s("Emulation.setDeviceMetricsOverride", { ...VIEW, deviceScaleFactor: 1, mobile: false });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  // English where a demo has a choice: the portfolio's default language.
  await s("Emulation.setLocaleOverride", { locale: "en-US" }).catch(() => {});
  await s("Network.setUserAgentOverride", { userAgent, acceptLanguage: "en-US,en" });
  const loaded = cdp.waitFor("Page.loadEventFired", sessionId, 45_000);
  await s("Page.navigate", { url });
  return { targetId, sessionId, s, loaded };
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
}

async function poster(page, id) {
  const { data } = await page.s("Page.captureScreenshot", { format: "png" });
  const png = join(work, `${id}.png`);
  writeFileSync(png, Buffer.from(data, "base64"));
  const file = join(out, `${id}.webp`);
  ffmpeg(["-i", png, "-vf", "scale=960:600:flags=lanczos", "-c:v", "libwebp", "-quality", "70", "-compression_level", "6", file]);
  return file;
}

// Records CLIP_MS of screencast frames into a temp folder.
async function record(cdp, page, id, take) {
  const dir = join(work, `${id}-${take}`);
  mkdirSync(dir, { recursive: true });
  const frames = [];
  const off = cdp.on((msg) => {
    if (msg.method !== "Page.screencastFrame" || msg.sessionId !== page.sessionId) return;
    const { data, metadata, sessionId } = msg.params;
    const name = `f${String(frames.length).padStart(4, "0")}.jpg`;
    writeFileSync(join(dir, name), Buffer.from(data, "base64"));
    frames.push({ name, t: metadata.timestamp });
    page.s("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  // Frames at the output size: headless Edge delivers small frames noticeably faster.
  await page.s("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 640, maxHeight: 400 });
  await sleep(CLIP_MS + 300);
  await page.s("Page.stopScreencast");
  off();
  return { dir, frames, fps: frames.length / (CLIP_MS / 1000) };
}

// Encodes a take at a steady 30 fps using each frame's real timestamp, so a slow headless GPU
// does not speed the loop up.
function encode({ dir, frames, fps }, id) {
  if (frames.length < 10) throw new Error(`only ${frames.length} frames`);
  const lines = [];
  frames.forEach((f, i) => {
    lines.push(`file '${f.name}'`);
    const next = frames[i + 1];
    lines.push(`duration ${next ? Math.max(next.t - f.t, 0.001).toFixed(4) : "0.0333"}`);
  });
  lines.push(`file '${frames.at(-1).name}'`);
  writeFileSync(join(dir, "list.txt"), lines.join("\n"));

  // Heavy scenes come through at under 20 fps: blend neighbouring frames so slow motion stays smooth.
  const rate = fps < 20 ? "minterpolate=fps=30:mi_mode=blend" : "fps=30";
  const file = join(out, `${id}.mp4`);
  ffmpeg([
    "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
    "-vf", `${rate},scale=640:400:flags=lanczos:out_range=tv,format=yuv420p`,
    "-t", String(CLIP_MS / 1000), "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-maxrate", "1100k", "-bufsize", "2200k",
    "-movflags", "+faststart", file,
  ]);
  return { file, fps: fps.toFixed(0) };
}

const kb = (file) => `${Math.round(statSync(file).size / 1024)} KB`;

const port = await freePort();
const profileDir = join(work, "profile");
const edge = spawn(
  EDGE,
  [
    "--headless=new",
    "--mute-audio",
    "--use-angle=d3d11",
    `--window-size=${VIEW.width},${VIEW.height}`,
    "--lang=en-US",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-sync",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let cdp;
try {
  let info;
  for (let i = 0; i < 50 && !info; i++) {
    await sleep(200);
    info = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json()).catch(() => null);
  }
  if (!info) throw new Error("Edge did not start");
  cdp = await Cdp.connect(info.webSocketDebuggerUrl);
  console.log(`${info.Browser} on :${port}`);
  const userAgent = info["User-Agent"].replace(/Headless/g, "");

  // Open the full-stack demos at once so their free Render backends are awake when their turn comes.
  const backends = jobs.filter((p) => p.kind !== "3d");
  if (backends.length && !process.argv.includes("--no-warm")) {
    const warm = await Promise.all(backends.map((p) => cdp.send("Target.createTarget", { url: p.demo, background: true })));
    await sleep(15_000);
    await Promise.all(warm.map((t) => cdp.send("Target.closeTarget", { targetId: t.targetId }).catch(() => {})));
  }

  for (const p of jobs) {
    try {
      const tune = TUNE[p.id] ?? {};
      const page = await openPage(cdp, p.demo, userAgent);
      // Background targets get throttled timers and rAF, so the page being shot must be in front.
      await cdp.send("Target.activateTarget", { targetId: page.targetId });
      const loaded = await page.loaded;
      await sleep(tune.wait ?? settle);
      let img = await poster(page, p.id);
      // A near-empty frame (blank page or a lone "loading…") compresses to almost nothing: the
      // backend is still waking up, so give it more time.
      for (let retry = 0; retry < 3 && statSync(img).size < 2500; retry++) {
        await sleep(15_000);
        img = await poster(page, p.id);
      }
      let line = `✓ ${p.id}.webp ${kb(img)}${loaded ? "" : " (no load event)"}`;
      if (p.kind === "3d") {
        if (tune.clipDelay) await sleep(tune.clipDelay);
        for (const step of tune.prepare ?? []) {
          if (typeof step === "number") await sleep(step);
          else await page.s("Runtime.evaluate", { expression: step });
        }
        // The capture rate of a heavy scene swings from take to take: re-record a choppy one and
        // keep the smoothest. Scripted clips (a click that starts a flight) can only be taken once.
        let best = await record(cdp, page, p.id, 0);
        for (let take = 1; take < 3 && best.fps < 12 && !tune.prepare; take++) {
          const next = await record(cdp, page, p.id, take);
          if (next.fps > best.fps) best = next;
        }
        const v = encode(best, p.id);
        line += ` · ${p.id}.mp4 ${kb(v.file)} (${v.fps} fps captured)`;
      }
      console.log(line);
      await cdp.send("Target.closeTarget", { targetId: page.targetId });
    } catch (error) {
      console.error(`✗ ${p.id}: ${error.message}`);
    }
  }
} finally {
  await cdp?.send("Browser.close").catch(() => {});
  await Promise.race([new Promise((r) => edge.once("exit", r)), sleep(5000)]);
  if (edge.exitCode === null) edge.kill();
  for (let i = 0; i < 5; i++) {
    try {
      rmSync(work, { recursive: true, force: true });
      break;
    } catch {
      await sleep(500);
    }
  }
}
