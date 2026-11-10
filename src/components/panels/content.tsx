"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  cardinal,
  contacts,
  education,
  experience,
  person,
  projects,
  skills,
  spokenLanguages,
  type CardinalItem,
  type L,
  type Lang,
  type Project,
  type ProjectKind,
} from "@/content/profile";
import { ui } from "@/content/ui";
import { cancelListening } from "@/lib/listen";
import { sfx } from "@/lib/sfx";
import { store, useStore } from "@/lib/store";
import { stopSpeaking, tellCardinal, tellProject } from "@/lib/yui";
import { MenuIcon } from "../icons";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Yui tells the story behind a card or section; pressed while she is telling it, she stops. */
function TellMore({ id, onTell }: { id: string; onTell: () => void }) {
  const lang = useStore((s) => s.lang);
  const active = useStore((s) => s.telling === id && s.busy !== "idle");
  return (
    <button
      type="button"
      className="btn-tell"
      aria-pressed={active}
      onClick={() => {
        sfx.click();
        if (active) return stopSpeaking();
        // The microphone must not hear Yui's story as a question.
        cancelListening();
        onTell();
      }}
    >
      <MenuIcon id="tell" size={14} />
      {active ? ui.stop[lang] : ui.tellMore[lang]}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="panel-reveal mt-6 first:mt-0">
      <h3 className="hud-label mb-2.5 flex items-center gap-2">
        <span className="h-px w-4 bg-core/70" />
        {label}
      </h3>
      {children}
    </section>
  );
}

export function About() {
  const lang = useStore((s) => s.lang);
  return (
    <div>
      <div className="panel-reveal">
        <p className="font-display text-2xl font-semibold leading-tight">{person.name[lang]}</p>
        <p className="mt-1 text-ice">{person.role[lang]}</p>
        <p className="chip mt-3 !border-core/50 !text-frost">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          {person.status[lang]}
        </p>
      </div>
      <p className="panel-reveal mt-5 leading-relaxed text-frost/90">{person.summary[lang]}</p>
      <Section label={ui.location[lang]}>
        <p className="text-frost/90">{person.location[lang]}</p>
      </Section>
      <Section label={ui.education[lang]}>
        <p className="text-frost">{education.school[lang]}</p>
        <p className="text-sm text-dim">{education.program[lang]}</p>
      </Section>
      <Section label={ui.languages[lang]}>
        <p className="text-frost/90">{spokenLanguages[lang]}</p>
      </Section>
      <Section label="Stack">
        <p className="font-mono text-sm text-ice">{person.stackLine}</p>
      </Section>
    </div>
  );
}

export function ExperiencePanel() {
  const lang = useStore((s) => s.lang);
  return (
    <ol className="relative ml-1.5 border-l border-[var(--line)]">
      {experience.map((e) => (
        <li key={e.id} className="panel-reveal relative mb-7 pl-6 last:mb-0">
          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rotate-45 border border-core bg-void" />
          <p className="hud-label">{e.period[lang]}</p>
          <p className="mt-1 font-display text-base font-semibold">{e.role[lang]}</p>
          <p className="text-sm text-ice">
            {e.link ? (
              <a href={e.link} {...ext} className="underline decoration-core/40 underline-offset-4 hover:decoration-core">
                {e.company}
              </a>
            ) : (
              e.company
            )}{" "}
            · <span className="text-dim">{e.place[lang]}</span>
          </p>
          <ul className="mt-2.5 space-y-1.5 text-[0.93rem] leading-relaxed text-frost/85">
            {e.points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-core/70" />
                {p[lang]}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

const FILTERS: (ProjectKind | "all")[] = ["all", "3d", "fullstack", "mobile", "contribution"];

const shotAlt: L = { en: "screenshot of the live demo", ru: "скриншот демо", uz: "demo skrinshoti" };
const liveTag: L = { en: "Live preview", ru: "Живое превью", uz: "Jonli ko‘rinish" };

const HOVER = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

// Cut top-right and bottom-left corners, like the menu plates. The inner face is cut 0.6px less so
// the 1px neon edge keeps its width along the diagonals too.
const CUT = 14;
const cut = (c: number) => `polygon(0 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% 100%, ${c}px 100%, 0 calc(100% - ${c}px))`;
const EDGE = { clipPath: cut(CUT) };
const FACE = { clipPath: cut(CUT - 0.6) };
const SCANLINES = {
  background:
    "repeating-linear-gradient(to bottom, rgba(2, 5, 11, 0.26) 0 1px, transparent 1px 3px), linear-gradient(to top, rgba(2, 5, 11, 0.6), transparent 42%)",
};
const TILE = {
  background:
    "radial-gradient(ellipse at 50% 60%, rgba(61, 184, 255, 0.16), transparent 65%), linear-gradient(rgba(62, 224, 255, 0.06) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgba(62, 224, 255, 0.06) 1px, transparent 1px) 0 0 / 22px 22px, #030a16",
};

// Starts or pauses a card's loop. The file is attached on the first play, so nothing downloads
// until a desktop visitor hovers or focuses a 3D card; touch screens and reduced motion keep the poster.
function setLoop(video: HTMLVideoElement | null, on: boolean) {
  if (!video) return;
  if (!on) return video.pause();
  if (!window.matchMedia(HOVER).matches || window.matchMedia(REDUCED).matches) return;
  if (!video.getAttribute("src") && video.dataset.src) video.src = video.dataset.src;
  video.play().catch(() => {});
}

/** "Video Player" → VP, "TalentPulse" → TP, "Metafora" → ME. */
function initials(title: string) {
  const words = title.split(/\s+/).filter(Boolean);
  const caps = words.length > 1 ? words.map((w) => w[0]) : (title.match(/\p{Lu}/gu) ?? []);
  return (caps.length > 1 ? caps.join("") : title.slice(0, 2)).slice(0, 3).toUpperCase();
}

function Placeholder({ p, lang }: { p: Project; lang: Lang }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={TILE}>
      <span className="absolute left-0 top-3 h-7 w-[3px] bg-pink shadow-[0_0_10px_var(--color-pink)]" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-neon/50" />
      <span aria-hidden="true" className="font-cyber text-4xl font-bold tracking-[0.2em] text-neon [text-shadow:0_0_18px_rgba(62,224,255,0.45)]">
        {initials(p.title)}
      </span>
      {p.kind === "mobile" && <span className="hud-label !text-[0.6rem]">{ui.noPreview[lang]}</span>}
    </div>
  );
}

function ProjectCard({ p, lang }: { p: Project; lang: Lang }) {
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const loop = p.preview?.video;
  // Cards without a loop have no video, so these are no-ops there.
  const play = () => setLoop(video.current, true);
  const stop = () => setLoop(video.current, false);
  return (
    <article
      onPointerEnter={play}
      onPointerLeave={stop}
      onFocus={play}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && stop()}
      className="panel-reveal group border border-[var(--line)] bg-abyss/60 p-4 transition-colors focus-within:border-core/60 hover:border-core/60"
    >
      <div className="mb-3.5 transition-[filter] duration-300 group-focus-within:drop-shadow-[0_0_8px_rgba(62,224,255,0.35)] group-hover:drop-shadow-[0_0_8px_rgba(62,224,255,0.35)]">
        <div className="bg-neon/25 p-px transition-colors duration-300 group-focus-within:bg-neon/80 group-hover:bg-neon/80" style={EDGE}>
          <div className={`relative overflow-hidden bg-void ${p.preview ? "aspect-[16/10]" : "aspect-[16/7]"}`} style={FACE}>
            {p.preview ? (
              <>
                <Image
                  src={p.preview.image}
                  alt={`${p.title} — ${shotAlt[lang]}`}
                  width={960}
                  height={600}
                  sizes="(max-width: 1023px) 100vw, 580px"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                />
                {loop && (
                  <video
                    ref={video}
                    data-src={loop}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    onPlaying={() => setLive(true)}
                    onPause={() => setLive(false)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${live ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </>
            ) : (
              <Placeholder p={p} lang={lang} />
            )}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={SCANLINES} />
            {loop && (
              <span
                aria-hidden="true"
                className={`hud-label pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-1.5 !text-[0.58rem] !text-ice transition-opacity duration-300 pointer-coarse:hidden motion-reduce:hidden ${live ? "opacity-0" : "opacity-100"}`}
              >
                <span className="text-pink">▶</span>
                {liveTag[lang]}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-[0.98rem] font-semibold">{p.title}</h4>
        <span className="hud-label shrink-0 !text-[0.6rem]">
          {ui.filters[p.kind][lang]}
          {p.badge ? ` · ${p.badge[lang]}` : ""}
        </span>
      </div>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-frost/80">{p.summary[lang]}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="chip !text-[0.62rem]">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        {p.story && <TellMore id={p.id} onTell={() => tellProject(p)} />}
        {p.demo && (
          <a href={p.demo} {...ext} className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-core hover:text-frost">
            ↗ {p.kind === "contribution" ? ui.site[lang] : ui.demo[lang]}
          </a>
        )}
        {p.code && (
          <a href={p.code} {...ext} className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-dim hover:text-frost">
            {"</>"} {ui.code[lang]}
          </a>
        )}
      </div>
    </article>
  );
}

export function Projects() {
  const lang = useStore((s) => s.lang);
  const filter = useStore((s) => s.projectFilter);
  const list = projects.filter((p) => filter === "all" || p.kind === filter);
  return (
    <div>
      <div className="panel-reveal mb-5 flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => store.set({ projectFilter: f })}
            className={`chip !py-1 transition-colors ${filter === f ? "!border-core !bg-core/20 !text-frost" : "hover:!text-frost"}`}
          >
            {ui.filters[f][lang]}
            <span className="text-dim">{f === "all" ? projects.length : projects.filter((p) => p.kind === f).length}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {list.map((p) => (
          <ProjectCard key={p.id} p={p} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const lang = useStore((s) => s.lang);
  return (
    <div>
      {skills.map((g) => (
        <Section key={g.id} label={g.group[lang]}>
          <div className="flex flex-wrap gap-2">
            {g.items.map((item) => (
              <span key={item} className="chip !px-2.5 !py-1 !text-[0.75rem]">
                {item}
              </span>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

const capital = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** Bulleted facts; a label ("Cost and speed") leads its line in the accent colour. */
function Items({ items, lang }: { items: CardinalItem[]; lang: Lang }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2.5 space-y-1.5 text-[0.9rem] leading-relaxed text-frost/85">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-core/70" />
          <span>
            {it.label && <span className="text-ice">{it.label[lang]}: </span>}
            {it.text[lang]}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The four stages as numbered tiles. */
function Stages({ items, lang }: { items: CardinalItem[]; lang: Lang }) {
  return (
    <ol className="mt-3 grid grid-cols-2 gap-2">
      {items.map((s, i) => (
        <li key={i} className="border border-[var(--line)] bg-abyss/60 p-3">
          <p className="font-mono text-[0.7rem] text-core">0{i + 1}</p>
          {s.label && <p className="mt-1 text-sm font-semibold">{s.label[lang]}</p>}
          <p className="mt-1 text-[0.82rem] leading-snug text-frost/75">{capital(s.text[lang])}</p>
        </li>
      ))}
    </ol>
  );
}

/** Quarter-by-quarter plan on a vertical line, like the experience timeline. */
function Roadmap({ items, lang }: { items: CardinalItem[]; lang: Lang }) {
  return (
    <ol className="relative ml-1.5 mt-3 border-l border-[var(--line)]">
      {items.map((s, i) => (
        <li key={i} className="relative mb-3.5 pl-5 last:mb-0">
          <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rotate-45 border border-core bg-void" />
          {s.label && <p className="hud-label !text-core">{s.label[lang]}</p>}
          <p className="mt-0.5 text-[0.9rem] leading-relaxed text-frost/85">{capital(s.text[lang])}</p>
        </li>
      ))}
    </ol>
  );
}

const ITEM_VIEW: Record<string, typeof Items> = { pipeline: Stages, roadmap: Roadmap };

export function Cardinal() {
  const lang = useStore((s) => s.lang);
  const { ask, team } = cardinal;
  return (
    <div>
      <div className="panel-reveal">
        <p className="font-display text-2xl font-bold tracking-[0.12em]">CARDINAL</p>
        <p className="mt-1 text-ice">{cardinal.tagline[lang]}</p>
      </div>
      <p className="panel-reveal mt-4 leading-relaxed text-frost/90">{cardinal.intro[lang]}</p>
      <dl className="panel-reveal mt-4 grid gap-1.5 text-[0.86rem]">
        {cardinal.facts.map((f, i) => (
          <div key={i} className="flex gap-3 border-l border-core/40 pl-3">
            <dt className="hud-label w-24 shrink-0 pt-0.5">{f.label?.[lang]}</dt>
            <dd className="text-frost/85">{capital(f.text[lang])}</dd>
          </div>
        ))}
      </dl>
      <div className="panel-reveal mt-5 flex flex-wrap items-center gap-2.5">
        <TellMore id="cardinal" onTell={tellCardinal} />
        <a href="/cardinal/CARDINAL_One_Pager.pdf" download className="btn-tell" onClick={() => sfx.click()}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
          </svg>
          {ui.onePager[lang]}
        </a>
      </div>
      {cardinal.sections.map((s) => {
        const View = ITEM_VIEW[s.id] ?? Items;
        return (
          <Section key={s.id} label={s.title[lang]}>
            <p className="text-[0.93rem] leading-relaxed text-frost/85">{s.body[lang]}</p>
            <View items={s.items} lang={lang} />
          </Section>
        );
      })}
      <Section label={ask.title[lang]}>
        <p className="border-l-2 border-core bg-core/5 py-2 pl-3 text-[0.93rem] leading-relaxed text-frost">{ask.body[lang]}</p>
        <ul className="mt-3.5 space-y-2.5">
          {ask.funds.map((f, i) => (
            <li key={i}>
              <div className="flex items-baseline justify-between gap-3 text-[0.85rem]">
                <span className="text-frost/85">{capital(f.text[lang])}</span>
                <span className="font-mono text-core">{f.share}%</span>
              </div>
              <div className="mt-1 h-1 bg-[var(--line)]">
                <div className="h-1 bg-core shadow-[0_0_8px_#3db8ff]" style={{ width: `${f.share}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <Items items={ask.notes} lang={lang} />
      </Section>
      <Section label={team.title[lang]}>
        <p className="text-[0.93rem] leading-relaxed text-frost/85">{team.body[lang]}</p>
        <Items items={team.items} lang={lang} />
        <p className="mt-3 text-xs text-dim">{cardinal.status[lang]}</p>
      </Section>
    </div>
  );
}

export function Cv() {
  const lang = useStore((s) => s.lang);
  const files = [
    { label: ui.cvEn[lang], code: "EN", href: "/cv/Shuhrat_Abdurahmonov_CV_EN.pdf" },
    { label: ui.cvRu[lang], code: "RU", href: "/cv/Shuhrat_Abdurahmonov_CV_RU.pdf" },
  ];
  return (
    <div>
      <p className="panel-reveal text-frost/85">{ui.cvTitle[lang]}</p>
      <div className="mt-4 grid gap-3">
        {files.map((f) => (
          <a
            key={f.code}
            href={f.href}
            download
            className="panel-reveal group flex items-center justify-between border border-[var(--line)] bg-abyss/60 p-4 transition-colors hover:border-core"
          >
            <span>
              <span className="block font-display text-base font-semibold">{person.name[lang]}</span>
              <span className="text-sm text-dim">
                {f.label} · PDF
              </span>
            </span>
            <span className="font-mono text-xl text-core transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Contacts() {
  const lang = useStore((s) => s.lang);
  return (
    <div className="grid gap-2.5">
      {contacts.map((c) => (
        <a
          key={c.id}
          href={c.href}
          {...(c.id === "email" ? {} : ext)}
          className="panel-reveal group flex items-center justify-between gap-3 border border-[var(--line)] bg-abyss/60 px-4 py-3.5 transition-colors hover:border-core"
        >
          <span className="min-w-0">
            <span className="hud-label block">{c.label}</span>
            <span className="mt-0.5 block truncate text-frost">{c.handle}</span>
          </span>
          <span className="font-mono text-core transition-transform group-hover:translate-x-0.5">↗</span>
        </a>
      ))}
      <p className="panel-reveal mt-2 text-sm text-dim">{person.status[lang]}</p>
    </div>
  );
}
