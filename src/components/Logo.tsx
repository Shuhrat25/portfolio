// Brand mark "C · S-orbit": an S-shaped orbit (S for Shuhrat) through a glowing core (Yui's sphere), inside a hexagon.
// Master artwork on a 120 grid. app/icon.svg is a bolder cut for 16–32 px tabs; scripts/make-icons.mjs keeps a copy
// of these shapes to rasterise favicon.ico and apple-icon.png, so change both together.

export const MARK = {
  hex: "60,12 101.6,36 101.6,84 60,108 18.4,84 18.4,36",
  orbit: "M76 36 A16 16 0 1 0 60 60 A16 16 0 1 1 44 84",
} as const;

/** The artwork for an `<svg viewBox="0 0 120 120">`. Intrinsic elements only, so next/og can draw it too. */
export function markArt() {
  return (
    <>
      <polygon points={MARK.hex} fill="none" stroke="#3db8ff" strokeWidth={2.5} opacity={0.6} />
      <path d={MARK.orbit} fill="none" stroke="#3ee0ff" strokeWidth={6} strokeLinecap="round" />
      <circle cx={60} cy={60} r={7} fill="#e8f7ff" />
      <circle cx={76} cy={36} r={5} fill="#3ee0ff" />
      <circle cx={44} cy={84} r={5.5} fill="#ff2e88" />
    </>
  );
}

type Props = { size?: number; className?: string; title?: string };

/** The mark with a soft neon glow. Decorative unless a title is given. */
export function LogoMark({ size = 28, className, title }: Props) {
  const glow = `drop-shadow(0 0 ${(size * 0.05).toFixed(1)}px rgba(62, 224, 255, 0.6)) drop-shadow(0 0 ${(size * 0.18).toFixed(1)}px rgba(61, 184, 255, 0.35))`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={{ filter: glow }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {markArt()}
    </svg>
  );
}
