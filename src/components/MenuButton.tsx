"use client";

import { useEffect } from "react";
import type { PanelId } from "@/content/ui";
import { sfx } from "@/lib/sfx";
import { store } from "@/lib/store";
import { MenuIcon } from "./icons";

type Props = {
  id: PanelId | "tell";
  label: string;
  /** Where the button sits: left/right of the core, top (primary) or chip (compact row). */
  side: "left" | "right" | "top" | "chip";
  index?: string;
  active?: boolean;
  className?: string;
  onClick: () => void;
};

/** Only clears our own hover: the pointer may already be on another module. */
function clearHover(id: Props["id"]) {
  if (store.get().hover === id) store.set({ hover: null });
}

export function MenuButton({ id, label, side, index, active = false, className = "", onClick }: Props) {
  const enter = () => store.set({ hover: id });
  const leave = () => clearHover(id);

  // The radial ring unmounts under the pointer when a panel opens; don't leave the core leaning.
  useEffect(() => () => clearHover(id), [id]);

  return (
    <button
      type="button"
      className={`cp-btn ${className}`}
      data-side={side}
      aria-pressed={active}
      onPointerEnter={(e) => {
        // A tap also fires pointerenter but never a matching leave, so touch must not set hover:
        // the core would keep leaning towards the tapped button.
        if (e.pointerType === "touch") return;
        enter();
        if (e.pointerType === "mouse") sfx.hover();
      }}
      onPointerLeave={leave}
      onFocus={(e) => {
        // Taps and mouse presses focus the button too; only keyboard focus leans and blips.
        if (!e.currentTarget.matches(":focus-visible")) return;
        enter();
        sfx.hover();
      }}
      onBlur={leave}
      onClick={() => {
        sfx.click();
        onClick();
      }}
    >
      <span className="cp-btn__deco" aria-hidden />
      <span className="cp-btn__icon">
        <MenuIcon id={id} />
      </span>
      {index && <span className="cp-btn__index">{index}</span>}
      <span className="cp-btn__label" data-text={label}>
        {label}
      </span>
    </button>
  );
}
