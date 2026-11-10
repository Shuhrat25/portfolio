"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { faq, type Faq } from "@/content/faq";
import { focusWhenShown } from "@/lib/focus";
import { PANELS, ui, type PanelId } from "@/content/ui";
import { MOBILE, stageInsets } from "@/lib/layout";
import { cancelListening, lendMic, startListening, stopListening, useCanListen } from "@/lib/listen";
import { MENU_ANGLES } from "@/lib/menu-layout";
import { sfx } from "@/lib/sfx";
import { useStore } from "@/lib/store";
import { useViewport } from "@/lib/use-viewport";
import { voice } from "@/lib/voice";
import { ask, askFaq, narrate, stopSpeaking, visitSection } from "@/lib/yui";
import { MenuButton } from "./MenuButton";
import { NameCard } from "./NameCard";

gsap.registerPlugin(useGSAP);

const ANGLES = MENU_ANGLES;

/** Radius of the ring of menu modules in a free area of w × h. */
const menuRadius = (w: number, h: number) => Math.max(190, Math.min(w * 0.42, h * 0.46, 360));
/** The spokes run from this share of the ring radius out to the modules. */
const SPOKE_FROM = 0.62;

// The subtitle block at its tallest, in px: two question lines, the full text box and the bottom
// margin. Half a module's height and the air kept between a module and the text.
const SUBTITLE_BLOCK = 170;
const MODULE_HALF = 26;
const MODULE_AIR = 16;

/**
 * Widest the subtitles may be with the menu up in a free area of w × h: wherever their block
 * reaches the height of a module, they stay between the modules' inner edges (each module points
 * at the core, so its edge nearest the centre sits on its anchor).
 */
function subtitleWidth(w: number, h: number): number | undefined {
  const r = menuRadius(w, h);
  const top = h / 2 - SUBTITLE_BLOCK; // the block's top edge, from the core centre, y down
  let half = Infinity;
  for (const id of PANELS) {
    const a = (ANGLES[id] * Math.PI) / 180;
    if (-Math.sin(a) * r + MODULE_HALF < top) continue; // the module is above the block
    half = Math.min(half, Math.abs(Math.cos(a)) * r - MODULE_AIR);
  }
  return Number.isFinite(half) ? Math.round(2 * half) : undefined;
}

function useInsets() {
  const { w, h } = useViewport();
  const panel = useStore((s) => s.panel);
  const phase = useStore((s) => s.phase);
  return { w, h, ...stageInsets(w, h, panel !== null, phase === "live") };
}

/** The free area around the core; everything in it is centred on the sphere. */
export function Stage() {
  const { w, h, top, right, bottom, sheet } = useInsets();
  const menuVisible = useStore((s) => s.menuVisible);
  // With a panel open the ring of labels no longer fits; the panel header has its own switcher.
  const panelOpen = useStore((s) => s.panel !== null);
  const micAvailable = useCanListen();
  const menuUp = menuVisible && w >= MOBILE && !panelOpen;
  // Pixels per core radius, as the camera frames it (see cameraDistance) and as the CSS core sizes it.
  const radius = Math.min(h / 6.6, w / 4.8) * (panelOpen ? 0.78 : 1);
  return (
    <div
      className="pointer-events-none fixed left-0 z-20 transition-[right,bottom] duration-700 ease-out-expo"
      style={{ top, right, bottom }}
    >
      {menuUp && <RadialMenu w={w - right} h={h - bottom - top} />}
      {/* Only where a click on the core works: the Dock is on screen to lend its mic. */}
      {micAvailable && !sheet && <CoreHint radius={radius} spokes={menuUp ? menuRadius(w - right, h - bottom - top) * SPOKE_FROM : null} />}
      <Subtitles maxWidth={menuUp ? subtitleWidth(w - right, h - bottom - top) : undefined} />
    </div>
  );
}

const HINT_KEY = "yui.coreHint";

function hintSeen() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberHint() {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {}
}

type HintStep = "wait" | "show" | "fade" | "gone";

// The spokes nearest the top, either side of "tell": at a height y above the core they are
// y · tan(gap) to the side, so the hint must stay narrower than that.
const TOP_GAP = Math.min(...PANELS.map((id) => Math.abs(ANGLES[id] - 90)));
const SPREAD = Math.tan((TOP_GAP * Math.PI) / 180);
// The hint plate in px: 0.6rem JetBrains Mono at 0.14em tracking is 7.1 a character, plus the
// dot, padding and border; one line is 24 tall, two are 39.
const HINT_CHAR = 7.1;
const HINT_EXTRA = 40;
const HINT_LINE = 24;
const HINT_TWO_LINES = 39;

/**
 * Once per visitor, a quiet line just above the sphere: it can be clicked (tapped) to ask by voice.
 * Shown on the first hover over the core or a few seconds after going live, never while the mic
 * is on. Above the sphere it is clear of the subtitles; with the menu up it also stays inside
 * the circle where the spokes start (`spokes`, px) and between the two nearest the top.
 */
function CoreHint({ radius, spokes }: { radius: number; spokes: number | null }) {
  const lang = useStore((s) => s.lang);
  const hover = useStore((s) => s.coreHover);
  const listening = useStore((s) => s.listening);
  // Only the CSS core is a button that keyboards and screen readers reach; over the 3D canvas
  // the hint is for the pointer alone and stays out of the accessibility tree.
  const reachable = useStore((s) => s.quality === "none");
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [step, setStep] = useState<HintStep>(() => (hintSeen() ? "gone" : "wait"));
  // Hover only brings the hint forward: once it is up, the pointer crossing the sphere's edge
  // must not restart its fade.
  const hoverToShow = step === "wait" && hover;

  useEffect(() => {
    if (step === "gone" || (step === "wait" && listening)) return;
    if (step === "show") rememberHint();
    // Asking by voice while it is up means it did its job.
    const [next, ms]: [HintStep, number] =
      step === "wait" ? ["show", hoverToShow ? 0 : 4000] : step === "show" ? ["fade", listening ? 0 : 5500] : ["gone", 900];
    const id = setTimeout(() => setStep(next), ms);
    return () => clearTimeout(id);
  }, [step, hoverToShow, listening]);

  if (step === "gone") return null;
  const text = (touch ? ui.mic.hintTap : ui.mic.hintClick)[lang];
  // A small dark plate, readable over the lit lattice, resting on the sphere. With the menu up its
  // top edge stays under where the spokes start, and it keeps between the two nearest the top:
  // on two balanced lines when one is too wide for that gap (short windows, longer languages).
  const rest = radius * 1.1 + 6;
  let transform = `translate(-50%, calc(-100% - ${Math.round(rest)}px))`;
  let maxWidth: number | undefined;
  let wrap = false;
  if (spokes !== null) {
    const top = Math.min(rest + HINT_LINE, spokes - 4);
    const room = (bottom: number) => Math.floor(2 * (bottom * SPREAD - 8));
    wrap = text.length * HINT_CHAR + HINT_EXTRA > room(top - HINT_LINE);
    maxWidth = room(top - (wrap ? HINT_TWO_LINES : HINT_LINE));
    transform = `translate(-50%, ${-Math.round(top)}px)`;
  }
  return (
    <p
      role={reachable ? "status" : undefined}
      aria-hidden={!reachable || undefined}
      className={`hud-label pointer-events-none absolute left-1/2 top-1/2 w-max max-w-[calc(100vw-2rem)] border border-l-2 border-[var(--line)] border-l-pink bg-void/80 px-2.5 py-1 text-center !text-[0.6rem] !tracking-[0.14em] !text-ice transition-[opacity,translate] duration-700 ease-out-expo motion-reduce:translate-y-0 ${
        wrap ? "text-balance" : ""
      } ${step === "show" ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
      style={{ transform, maxWidth }}
    >
      {step !== "wait" && (
        <>
          <span aria-hidden className="mr-2 text-pink">
            ◉
          </span>
          {text}
        </>
      )}
    </p>
  );
}

function RadialMenu({ w, h }: { w: number; h: number }) {
  const lang = useStore((s) => s.lang);
  const panel = useStore((s) => s.panel);
  const busy = useStore((s) => s.busy);
  const root = useRef<HTMLDivElement>(null);
  const radius = menuRadius(w, h);

  useGSAP(
    () => {
      gsap.from(".node", { autoAlpha: 0, scale: 0.6, duration: 0.9, stagger: 0.06, ease: "expo.out", clearProps: "transform" });
      gsap.from(".spoke", { strokeDashoffset: 200, duration: 1.1, stagger: 0.06, ease: "expo.out" });
    },
    { scope: root },
  );

  const items: (PanelId | "tell")[] = ["tell", ...PANELS];
  return (
    <div ref={root} className="absolute left-1/2 top-1/2 h-0 w-0">
      <svg className="pointer-events-none absolute -left-[400px] -top-[400px] h-[800px] w-[800px] overflow-visible" viewBox="-400 -400 800 800" aria-hidden>
        {items.map((id) => {
          const a = (ANGLES[id] * Math.PI) / 180;
          const r0 = radius * SPOKE_FROM;
          const r1 = radius - 1; // ends at the module's arrow tip
          return (
            <line
              key={id}
              className="spoke"
              x1={Math.cos(a) * r0}
              y1={-Math.sin(a) * r0}
              x2={Math.cos(a) * r1}
              y2={-Math.sin(a) * r1}
              stroke={panel === id ? "rgba(61,184,255,0.8)" : "rgba(61,184,255,0.25)"}
              strokeWidth={1}
              strokeDasharray="200"
            />
          );
        })}
      </svg>
      {items.map((id, i) => {
        const a = (ANGLES[id] * Math.PI) / 180;
        const x = Math.cos(a) * radius;
        const y = -Math.sin(a) * radius;
        // Modules left of the core point right at it (right edge on the anchor) and vice versa.
        const side = id === "tell" ? "top" : Math.cos(a) < 0 ? "left" : "right";
        const place = side === "left" ? "right-0 -translate-y-1/2" : side === "right" ? "left-0 -translate-y-1/2" : "-translate-x-1/2 -translate-y-full";
        const narrating = busy === "narrating";
        return (
          <div key={id} className="absolute" style={{ left: x, top: y }}>
            <div className={`node pointer-events-auto absolute ${place}`}>
              {id === "tell" ? (
                <MenuButton
                  id="tell"
                  side="top"
                  label={narrating ? ui.stop[lang] : ui.menu.tell[lang]}
                  active={narrating}
                  onClick={() => (narrating ? stopSpeaking() : narrate())}
                />
              ) : (
                <MenuButton id={id} side={side} index={`0${i}`} label={ui.menu[id][lang]} active={panel === id} onClick={() => visitSection(id)} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** `maxWidth` keeps a long answer clear of the menu modules beside it. */
function Subtitles({ maxWidth }: { maxWidth?: number }) {
  const lang = useStore((s) => s.lang);
  const text = useStore((s) => s.subtitle);
  const mode = useStore((s) => s.subtitleMode);
  const startedAt = useStore((s) => s.subtitleStartedAt);
  const question = useStore((s) => s.question);
  const busy = useStore((s) => s.busy);
  const compact = useStore((s) => s.panel !== null);
  const [shown, setShown] = useState(0);
  const box = useRef<HTMLParagraphElement>(null);

  // Keep the line being spoken in view when the text is taller than the box.
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    if (mode === "stream") return;
    let raf = 0;
    const tick = () => {
      const p = mode === "audio" ? voice.progress() : (performance.now() - startedAt) / Math.max(800, text.length * 38);
      setShown(Math.ceil(Math.min(1, p) * text.length));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, mode, startedAt]);

  const visible = mode === "stream" ? text : text.slice(0, shown);
  const typing = busy !== "idle" && (mode === "stream" || shown < text.length);
  if (!visible && !question && busy !== "thinking") return null;

  return (
    <div className="absolute inset-x-0 bottom-3 flex justify-center px-4" aria-live="polite">
      <div className="w-full max-w-2xl text-center" style={{ maxWidth }}>
        {question && <p className="mb-2 line-clamp-2 font-mono text-[0.72rem] tracking-wide text-dim [overflow-wrap:anywhere] [text-shadow:0_1px_10px_rgba(2,5,11,0.95)]">› {question}</p>}
        {busy === "thinking" && !visible ? (
          <p className="hud-label caret !text-ice">{ui.thinking[lang]}</p>
        ) : (
          <p
            ref={box}
            // Long addresses and handles wrap anywhere, or a narrow block would scroll sideways.
            className={`scroll-thin mx-auto overflow-y-auto leading-relaxed text-frost [overflow-wrap:anywhere] [text-shadow:0_1px_12px_rgba(2,5,11,0.95)] ${
              compact ? "max-h-[4.6rem] text-[0.9rem]" : "max-h-[6.9rem] text-[0.98rem] sm:text-[1.05rem]"
            } ${typing ? "caret" : ""}`}
          >
            {visible}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Suggested questions above the chat input, in a row that scrolls sideways. A tapped one leaves
 * the row; its answer is checked and recorded ahead. The row keeps its height when it is empty,
 * so the core never jumps.
 */
function Suggestions() {
  const lang = useStore((s) => s.lang);
  const asked = useStore((s) => s.faqAsked);
  const row = useRef<HTMLDivElement>(null);
  const lastAsked = useRef(-Infinity);
  const next = faq.filter((f) => !asked.includes(f.id));

  const choose = (f: Faq, index: number, clicks: number, at: number) => {
    // The second click of a double-click, a double Enter or a held key would land on the chip that
    // slides into this one's place and ask it unheard.
    if (clicks > 1 || at - lastAsked.current < 600) return;
    lastAsked.current = at;
    const hadFocus = row.current?.contains(document.activeElement) ?? false;
    sfx.click();
    // The mic must not hear the answer as a new question.
    cancelListening();
    askFaq(f);
    if (!hadFocus) return;
    // The chip leaves the row: keep focus nearby instead of dropping it to the page. The next chip,
    // else the chat input (only from the keyboard: on a tablet it would raise the on-screen
    // keyboard), else the panel's ✕ on a phone, where the panel replaces the dock.
    const keyboard = clicks === 0;
    focusWhenShown(() => {
      const chips = row.current?.querySelectorAll("button");
      return (
        chips?.[Math.min(index, chips.length - 1)] ??
        (keyboard ? document.querySelector<HTMLElement>('input[maxlength="600"]') : null) ??
        document.querySelector<HTMLElement>(`aside button[aria-label="${ui.close[lang]}"]`)
      );
    });
  };

  return (
    <div ref={row} data-suggestions className="scroll-thin mx-auto flex h-8 w-full max-w-2xl shrink-0 gap-1.5 overflow-x-auto" role="group" aria-label={ui.suggestions[lang]}>
      {next.map((f, i) => (
        <button
          key={f.id}
          type="button"
          className="chip shrink-0 whitespace-nowrap !py-1 transition-colors hover:!border-neon hover:!text-frost focus-visible:!border-neon focus-visible:outline-none"
          onClick={(e) => choose(f, i, e.detail, e.timeStamp)}
          // A held Enter repeats; each repeat would ask the chip that just took focus.
          onKeyDown={(e) => e.repeat && e.preventDefault()}
        >
          <span className="text-core">›</span>
          {f.q[lang]}
        </button>
      ))}
    </div>
  );
}

/** Bottom dock: suggested questions and the chat input, plus menu chips on phones. */
export function Dock() {
  const { w, right, bottom, sheet } = useInsets();
  const lang = useStore((s) => s.lang);
  const menuVisible = useStore((s) => s.menuVisible);
  const busy = useStore((s) => s.busy);
  const panel = useStore((s) => s.panel);
  const listening = useStore((s) => s.listening);
  const nameAsk = useStore((s) => s.nameAsk);
  const micAvailable = useCanListen();
  const [value, setValue] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => gsap.from(root.current, { autoAlpha: 0, y: 24, duration: 0.9, delay: 0.6, ease: "expo.out" }), { scope: root });
  // A voice session never outlives the Dock (restart) or carries on under a section and its line.
  useEffect(() => cancelListening, []);
  useEffect(() => {
    if (panel) cancelListening();
  }, [panel]);
  // Narration can start without a panel change (its first section already open), and the mic
  // must not hear Yui's own voice as a question.
  useEffect(() => {
    if (busy === "narrating") cancelListening();
  }, [busy]);

  const send = () => {
    // Enter while listening ends the recording; what was heard is sent from there.
    if (listening) return stopListening();
    const q = value.trim();
    if (!q) return;
    setValue("");
    // A recorded question may still be transcribing; the typed one wins, or its transcript would
    // arrive later and replace this answer.
    cancelListening();
    void ask(q);
  };
  // Interim words replace the input; if nothing is sent, what was typed before comes back.
  // Text typed while a recording is being transcribed is the visitor's and is left alone.
  const toggleMic = () => {
    if (listening) return stopListening();
    const typed = value;
    let heard = typed;
    startListening(lang, {
      onInterim: (text) => {
        heard = text;
        setValue(text);
      },
      onEnd: (sent) => setValue((v) => (v === heard || v === typed ? (sent ? "" : typed) : v)),
    });
  };
  // A click on the core presses the mic button below, with this render's input and handlers.
  const pressMic = useEffectEvent(() => toggleMic());
  useEffect(() => {
    if (sheet || !micAvailable) return;
    return lendMic(() => pressMic());
  }, [sheet, micAvailable]);

  if (sheet) return null;
  return (
    <div ref={root} className="fixed bottom-0 left-0 z-30 flex flex-col justify-end gap-2 px-3 pb-3 sm:px-6 sm:pb-4" style={{ right, height: bottom }}>
      {w < MOBILE && menuVisible && (
        <div className="scroll-thin -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1">
          <MenuButton
            id="tell"
            side="chip"
            className="shrink-0"
            label={busy === "narrating" ? ui.stop[lang] : ui.menu.tell[lang]}
            active={busy === "narrating"}
            onClick={() => (busy === "narrating" ? stopSpeaking() : narrate())}
          />
          {PANELS.map((id) => (
            <MenuButton key={id} id={id} side="chip" className="shrink-0" label={ui.menu[id][lang]} active={panel === id} onClick={() => visitSection(id)} />
          ))}
        </div>
      )}
      {/* The name card takes the suggestions' row while it is up, so nothing else moves. */}
      {nameAsk ? <NameCard /> : <Suggestions />}
      <form
        className="holo mx-auto flex w-full max-w-2xl items-center gap-2 py-1.5 pl-4 pr-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <span className="font-mono text-sm text-core">›</span>
        <input
          className="min-w-0 flex-1 bg-transparent py-2 text-[0.95rem] text-frost placeholder:text-dim/80 focus:outline-none"
          value={value}
          maxLength={600}
          readOnly={listening}
          placeholder={listening ? ui.mic.listening[lang] : ui.chatPlaceholder[lang]}
          aria-label={ui.chatPlaceholder[lang]}
          onChange={(e) => setValue(e.target.value)}
        />
        {busy !== "idle" && (
          <button type="button" className="btn-ghost px-2" onClick={stopSpeaking}>
            {ui.stop[lang]}
          </button>
        )}
        {micAvailable && (
          <button
            type="button"
            className={`relative grid size-9 shrink-0 place-items-center rounded-full border transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/60 ${
              listening
                ? "border-pink bg-pink/15 text-pink shadow-[0_0_14px_rgba(255,46,136,0.45)]"
                : "border-neon/40 bg-neon/5 text-neon hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_16px_rgba(62,224,255,0.45)] focus-visible:border-neon"
            }`}
            aria-label={listening ? ui.mic.stop[lang] : ui.mic.start[lang]}
            aria-pressed={listening}
            title={listening ? ui.mic.stop[lang] : ui.mic.start[lang]}
            onClick={toggleMic}
          >
            {/* Slow breathing halo while recording (2 s opacity swell); still with reduced motion. */}
            {listening && (
              <span
                className="pointer-events-none absolute -inset-1 animate-pulse rounded-full shadow-[0_0_18px_3px_rgba(255,46,136,0.45)] motion-reduce:animate-none"
                aria-hidden
              />
            )}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
            </svg>
          </button>
        )}
        {/* Enabled while listening even with an empty input, so Enter and Send end the recording. */}
        <button type="submit" className="btn-core !px-4 !py-2" disabled={!listening && !value.trim()}>
          {ui.send[lang]}
        </button>
      </form>
      <p className="text-center font-mono text-[0.6rem] tracking-wider text-dim/70">{ui.aiNotice[lang]}</p>
    </div>
  );
}
