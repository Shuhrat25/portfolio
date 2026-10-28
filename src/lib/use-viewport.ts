"use client";

import { useSyncExternalStore } from "react";

let size = { w: 1280, h: 800 };

function subscribe(onChange: () => void) {
  const handler = () => {
    size = { w: window.innerWidth, h: window.innerHeight };
    onChange();
  };
  handler();
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}

export function useViewport() {
  return useSyncExternalStore(
    subscribe,
    () => size,
    () => size,
  );
}
