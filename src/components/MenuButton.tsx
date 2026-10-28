"use client";

import type { PanelId } from "@/content/ui";
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

export function MenuButton({ id, label, side, index, active = false, className = "", onClick }: Props) {
  return (
    <button type="button" className={`cp-btn ${className}`} data-side={side} aria-pressed={active} onClick={onClick}>
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
