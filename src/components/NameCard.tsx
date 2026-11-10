"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { ui } from "@/content/ui";
import { focusWhenShown, touchScreen } from "@/lib/focus";
import { cancelListening } from "@/lib/listen";
import { sfx } from "@/lib/sfx";
import { useStore } from "@/lib/store";
import { useViewport } from "@/lib/use-viewport";
import { carryNameFocus, declineName, giveName, nameCardFocus, setNameDraft, takeNameFocus } from "@/lib/yui";

gsap.registerPlugin(useGSAP);

/**
 * "How should I address you?" for a new visitor who came by a shared link and so skipped the name
 * step. A name is remembered (the next visit says "Welcome back"); ✕ or Esc makes them a guest for
 * this visit only; left alone it leaves after a while (yui.ts keeps that timer and the draft, so
 * both survive the card moving). It takes the suggested questions' row above the chat input, and
 * when a phone's panel hides that dock, the foot of the panel header: it covers nothing.
 */
export function NameCard({ inSheet = false }: { inSheet?: boolean }) {
  const lang = useStore((s) => s.lang);
  const value = useStore((s) => s.nameDraft);
  const { w } = useViewport();
  const root = useRef<HTMLFormElement>(null);
  useGSAP(() => gsap.from(root.current, { autoAlpha: 0, y: inSheet ? -6 : 10, duration: 0.7, ease: "expo.out" }), { scope: root });

  // Moving between the dock and the panel sheet remounts the card: the focus moves with it.
  useLayoutEffect(() => {
    const form = root.current;
    if (takeNameFocus()) focusWhenShown(() => form?.querySelector("input"));
    return () => {
      if (form?.contains(document.activeElement)) carryNameFocus();
      nameCardFocus(false);
    };
  }, []);

  /** Answers the card; focus that was in it goes to the chat input (or the panel's ✕ on a phone). */
  const answer = (act: () => void) => {
    const hadFocus = root.current?.contains(document.activeElement) ?? false;
    sfx.click();
    // An open mic must not hear Yui's reply (with their name in it) as a question.
    cancelListening();
    act();
    if (!hadFocus) return;
    focusWhenShown(
      () =>
        (touchScreen() ? null : document.querySelector<HTMLElement>('input[maxlength="600"]')) ??
        document.querySelector<HTMLElement>(`aside button[aria-label="${ui.close[lang]}"]`),
    );
  };

  // Side by side with the field there is room for the question on wider screens; otherwise the
  // question sits above the field (panel sheet) or in it as the placeholder (a narrow dock).
  const inlineLabel = !inSheet && w >= 640;
  const question = (
    <span className={`shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-neon ${inSheet ? "block pb-1.5" : ""}`} aria-hidden>
      {ui.askName[lang]}
    </span>
  );

  return (
    <form
      ref={root}
      aria-label={ui.askName[lang]}
      className={`w-full shrink-0 border border-dashed border-neon/60 bg-[rgba(62,224,255,0.07)] ${
        inSheet ? "mt-3 px-2.5 pb-1.5 pt-2" : "mx-auto flex h-8 max-w-2xl items-center gap-2 pl-2.5 pr-1"
      }`}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) answer(() => giveName(value));
      }}
      onFocus={() => nameCardFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) nameCardFocus(false);
      }}
      onKeyDown={(e) => {
        // Esc answers the card (stay a guest) instead of closing the panel behind it.
        if (e.key === "Escape") {
          e.stopPropagation();
          answer(declineName);
        }
      }}
    >
      {inSheet && question}
      <div className={`flex items-center gap-1.5 ${inSheet ? "" : "min-w-0 flex-1"}`}>
        {inlineLabel && question}
        <input
          // 16px on touch screens: smaller text makes iOS zoom the page when the field is tapped.
          className="min-w-0 flex-1 bg-transparent font-sans text-[0.85rem] text-frost outline-none placeholder:text-dim [@media(pointer:coarse)]:text-base"
          value={value}
          maxLength={40}
          autoComplete="given-name"
          enterKeyHint="done"
          aria-label={ui.askName[lang]}
          placeholder={inSheet || inlineLabel ? ui.namePlaceholder[lang] : ui.askName[lang]}
          onChange={(e) => setNameDraft(e.target.value)}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="shrink-0 border border-[var(--line-strong)] px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.14em] text-frost transition-colors hover:border-neon focus-visible:border-neon focus-visible:outline-none disabled:opacity-40"
        >
          {ui.nameCard.ok[lang]}
        </button>
        <button
          type="button"
          onClick={() => answer(declineName)}
          aria-label={ui.nameCard.decline[lang]}
          title={ui.nameCard.decline[lang]}
          className="shrink-0 px-2.5 py-1 text-dim transition-colors hover:text-ice focus-visible:text-ice focus-visible:outline-none"
        >
          ✕
        </button>
      </div>
    </form>
  );
}
