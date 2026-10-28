import type { PanelId } from "@/content/ui";

/** Angle (degrees, 0 = right, counter-clockwise) of each menu button around the core. */
export const MENU_ANGLES: Record<PanelId | "tell", number> = {
  tell: 90,
  about: 142,
  experience: 168,
  projects: 194,
  skills: 220,
  cardinal: 38,
  cv: 12,
  contacts: -14,
  order: -40,
};
