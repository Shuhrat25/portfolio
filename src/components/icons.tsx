import type { PanelId } from "@/content/ui";

// 24px line icons for the menu, drawn in the current text colour.
const paths: Record<PanelId | "tell", React.ReactNode> = {
  tell: (
    <>
      <path className="wave wave-1" d="M4 10v4" />
      <path className="wave wave-2" d="M8 7v10" />
      <path className="wave wave-3" d="M12 4v16" />
      <path className="wave wave-4" d="M16 7v10" />
      <path className="wave wave-5" d="M20 10v4" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.4-3.4 3.9-5 7-5s5.6 1.6 7 5" />
    </>
  ),
  experience: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M9 7V4.5h6V7M3 12.5h18" />
    </>
  ),
  projects: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5" />,
  skills: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  cardinal: <path d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z" />,
  cv: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  contacts: (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </>
  ),
  order: <path d="M21 3 3 10.5l7 2.6L12.5 20zM10 13.1 21 3" />,
};

export function MenuIcon({ id, size = 18 }: { id: PanelId | "tell"; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[id]}
    </svg>
  );
}
