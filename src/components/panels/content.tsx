"use client";

import { cardinal, contacts, education, experience, person, projects, skills, spokenLanguages, type ProjectKind } from "@/content/profile";
import { ui } from "@/content/ui";
import { store, useStore } from "@/lib/store";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

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
          <article key={p.id} className="panel-reveal group border border-[var(--line)] bg-abyss/60 p-4 transition-colors hover:border-core/60">
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
            <div className="mt-3.5 flex gap-4">
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

export function Cardinal() {
  const lang = useStore((s) => s.lang);
  return (
    <div>
      <div className="panel-reveal">
        <p className="font-display text-2xl font-bold tracking-[0.12em]">CARDINAL</p>
        <p className="mt-1 text-ice">{cardinal.tagline[lang]}</p>
      </div>
      <p className="panel-reveal mt-4 leading-relaxed text-frost/90">{cardinal.intro[lang]}</p>
      <Section label={ui.cardinalPipeline[lang]}>
        <ol className="grid grid-cols-2 gap-2">
          {cardinal.pipeline.map((s, i) => (
            <li key={i} className="border border-[var(--line)] bg-abyss/60 p-3">
              <p className="font-mono text-[0.7rem] text-core">0{i + 1}</p>
              <p className="mt-1 text-sm font-semibold">{s.title[lang]}</p>
              <p className="mt-1 text-[0.82rem] leading-snug text-frost/75">{s.text[lang]}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section label="Architecture">
        <p className="text-[0.93rem] leading-relaxed text-frost/85">{cardinal.architecture[lang]}</p>
      </Section>
      <Section label={ui.cardinalModel[lang]}>
        <p className="text-[0.93rem] leading-relaxed text-frost/85">{cardinal.model[lang]}</p>
      </Section>
      <Section label={ui.cardinalAsk[lang]}>
        <p className="border-l-2 border-core bg-core/5 py-2 pl-3 text-[0.93rem] leading-relaxed text-frost">{cardinal.ask[lang]}</p>
        <p className="mt-2 text-xs text-dim">{cardinal.status[lang]}</p>
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
