// One rule shared by the DOM and the 3D scene, so the core, the radial menu and the
// subtitles stay centred in the free area when a panel or the bottom dock takes space.
export const WIDE = 1024;
export const MOBILE = 768;

export type Insets = { top: number; right: number; bottom: number; sheet: boolean };

/** Top bar height kept clear while live. */
const TOP = 60;
/** The bottom dock: suggested questions, the chat input and the AI notice; phones add the menu chips. */
const DOCK = 140;
const DOCK_PHONE = 198;

export function stageInsets(w: number, h: number, panelOpen: boolean, live: boolean): Insets {
  const top = live ? TOP : 0;
  if (w >= WIDE) return { top, right: panelOpen ? Math.min(640, w * 0.44) + 32 : 0, bottom: live ? DOCK : 0, sheet: false };
  if (panelOpen) return { top, right: 0, bottom: Math.round(h * 0.62), sheet: true };
  return { top, right: 0, bottom: live ? (w >= MOBILE ? DOCK : DOCK_PHONE) : 0, sheet: false };
}

/** Distance at which the core plus its HUD rings fit the screen (fov 42°). */
export function cameraDistance(aspect: number): number {
  const k = 2 * Math.tan((42 / 2) * (Math.PI / 180));
  return Math.max(6.6 / k, 4.8 / (k * aspect));
}
