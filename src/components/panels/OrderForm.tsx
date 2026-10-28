"use client";

import { useState } from "react";
import { contacts } from "@/content/profile";
import { ui } from "@/content/ui";
import { useStore } from "@/lib/store";

type Status = "idle" | "sending" | "sent" | "failed";
const TYPES = ["site", "app", "3d", "other"] as const;

export function OrderForm() {
  const lang = useStore((s) => s.lang);
  const visitor = useStore((s) => s.name);
  const t = ui.order;
  const [status, setStatus] = useState<Status>("idle");
  const [type, setType] = useState<(typeof TYPES)[number]>("site");

  const submit = async (form: HTMLFormElement) => {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, type: t.types[type].en, lang }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return <p className="panel-reveal border-l-2 border-core bg-core/5 py-3 pl-3 text-frost">{t.sent[lang]}</p>;
  }

  const telegram = contacts.find((c) => c.id === "telegram")!;
  const email = contacts.find((c) => c.id === "email")!;

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
    >
      <p className="panel-reveal text-frost/85">{t.intro[lang]}</p>
      <label className="panel-reveal grid gap-1.5">
        <span className="hud-label">{t.name[lang]}</span>
        <input name="name" required maxLength={80} defaultValue={visitor} className="field" autoComplete="name" />
      </label>
      <label className="panel-reveal grid gap-1.5">
        <span className="hud-label">{t.contact[lang]}</span>
        <input name="contact" required maxLength={120} className="field" />
      </label>
      <fieldset className="panel-reveal grid gap-1.5">
        <legend className="hud-label mb-1.5">{t.type[lang]}</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={type === k}
              onClick={() => setType(k)}
              className={`border px-2 py-2 text-sm transition-colors ${type === k ? "border-core bg-core/15 text-frost" : "border-[var(--line)] text-dim hover:text-ice"}`}
            >
              {t.types[k][lang]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="panel-reveal grid gap-1.5">
        <span className="hud-label">{t.budget[lang]}</span>
        <input name="budget" maxLength={60} className="field" />
      </label>
      <label className="panel-reveal grid gap-1.5">
        <span className="hud-label">{t.message[lang]}</span>
        <textarea name="message" required maxLength={2000} rows={4} className="field resize-y" />
      </label>
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" className="panel-reveal btn-core mt-1" disabled={status === "sending"}>
        {status === "sending" ? t.sending[lang] : t.submit[lang]}
      </button>
      {status === "failed" && (
        <p className="text-sm text-ice">
          {t.failed[lang]}{" "}
          <a href={telegram.href} target="_blank" rel="noopener noreferrer" className="text-core underline underline-offset-4">
            Telegram
          </a>{" "}
          ·{" "}
          <a href={email.href} className="text-core underline underline-offset-4">
            {email.handle}
          </a>
        </p>
      )}
    </form>
  );
}
