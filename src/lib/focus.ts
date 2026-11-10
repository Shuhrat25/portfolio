"use client";

/**
 * Focuses what `find` returns once it can take focus: a panel that has just opened is still hidden
 * by its intro animation for a frame or two, and focusing a hidden element does nothing.
 */
export function focusWhenShown(find: () => HTMLElement | null | undefined, frames = 30) {
  requestAnimationFrame(() => {
    const el = find();
    el?.focus();
    if (el && document.activeElement !== el && frames > 0) focusWhenShown(find, frames - 1);
  });
}

/** A phone or tablet: focusing a text field there raises the on-screen keyboard. */
export const touchScreen = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
