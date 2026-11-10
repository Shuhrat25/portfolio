// Shared links straight to a section: /cardinal, /projects?kind=3d, /?open=contacts&lang=ru.
import { LANGS, type Lang, type ProjectKind } from "@/content/profile";
import { PANELS, type PanelId } from "@/content/ui";

export type DeepLink = { panel: PanelId; kind?: ProjectKind; lang?: Lang };

const KINDS: ProjectKind[] = ["3d", "fullstack", "mobile", "contribution"];

export const isPanel = (value: unknown): value is PanelId => PANELS.includes(value as PanelId);

/** The section from the path (`section`) or ?open=, with ?kind= and ?lang= when they are valid. */
export function readDeepLink(section?: PanelId): DeepLink | null {
  const query = new URLSearchParams(window.location.search);
  const panel = section ?? query.get("open");
  if (!isPanel(panel)) return null;
  const kind = query.get("kind") as ProjectKind;
  const lang = query.get("lang") as Lang;
  return {
    panel,
    ...(panel === "projects" && KINDS.includes(kind) ? { kind } : {}),
    ...(LANGS.includes(lang) ? { lang } : {}),
  };
}

/** A shared link without ?lang= opens in Russian, unless the visitor already chose a language here. */
export const LINK_LANG: Lang = "ru";
