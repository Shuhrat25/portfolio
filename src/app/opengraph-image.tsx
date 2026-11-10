import { ImageResponse } from "next/og";
import { SITE_URL } from "@/components/SeoProfile";
import { person } from "@/content/profile";

// Link-preview card (Telegram, LinkedIn, X, Slack...). Static data only, so it is prerendered at build time.
// Font: ImageResponse's built-in default (Geist Regular, Latin), which is why every string here is Latin.

export const alt = `${person.name.en} — ${person.role.en}. Meet Yui, his AI assistant.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NEON = "#3ee0ff";
const PINK = "#ff2e88";
const CORE = "#3db8ff";
const FROST = "#eef7ff";
const ICE = "#bfe8ff";
const DIM = "#6f8fb3";

// Sphere of particles: a Fibonacci lattice, tilted, projected flat. Back-facing points are dimmer and smaller.
const R = 170;
const CX = 930;
const CY = 315;
const COUNT = 220;
const DOTS = Array.from({ length: COUNT }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / COUNT;
  const ring = Math.sqrt(1 - y * y);
  const a = i * 2.399963;
  const x = Math.cos(a) * ring;
  const z = Math.sin(a) * ring;
  // Tilt towards the viewer around the X axis.
  const t = 0.42;
  const py = y * Math.cos(t) - z * Math.sin(t);
  const pz = y * Math.sin(t) + z * Math.cos(t);
  const front = (pz + 1) / 2;
  const d = 2 + front * 2.6;
  return { left: CX + x * R - d / 2, top: CY - py * R - d / 2, d, o: 0.18 + front * 0.75 };
});

// Wireframe: meridians (tall ellipses) and parallels (flat ellipses) of the same sphere.
const MERIDIANS = [0.72, 0.38];
const PARALLELS = [-0.62, -0.3, 0, 0.3, 0.62];

const abs = { position: "absolute" as const, display: "flex" };

function Bracket({ x, y }: { x: "left" | "right"; y: "top" | "bottom" }) {
  const line = `3px solid ${NEON}`;
  return (
    <div
      style={{
        ...abs,
        [x]: 36,
        [y]: 36,
        width: 44,
        height: 44,
        [x === "left" ? "borderLeft" : "borderRight"]: line,
        [y === "top" ? "borderTop" : "borderBottom"]: line,
        opacity: 0.8,
      }}
    />
  );
}

export default async function Image() {
  const [first, ...rest] = person.name.en.split(" ");
  const stack = person.stackLine.split(" · ");
  const host = new URL(SITE_URL).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#02050b",
          backgroundImage: [
            `radial-gradient(circle at ${CX}px ${CY}px, rgba(11, 74, 153, 0.55) 0%, rgba(5, 13, 28, 0.6) 32%, rgba(2, 5, 11, 0) 60%)`,
            "linear-gradient(rgba(61, 184, 255, 0.06) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(61, 184, 255, 0.06) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "100% 100%, 56px 56px, 56px 56px",
          color: FROST,
        }}
      >
        <Bracket x="left" y="top" />
        <Bracket x="right" y="top" />
        <Bracket x="left" y="bottom" />
        <Bracket x="right" y="bottom" />

        {/* Halo behind the core, pink on one side like the HUD accents. */}
        <div
          style={{
            ...abs,
            left: CX - 300,
            top: CY - 300,
            width: 600,
            height: 600,
            borderRadius: "50%",
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(61, 184, 255, 0.4) 0%, rgba(62, 224, 255, 0.12) 34%, rgba(2, 5, 11, 0) 66%)`,
          }}
        />
        <div
          style={{
            ...abs,
            left: CX - 120,
            top: CY - 40,
            width: 360,
            height: 360,
            borderRadius: "50%",
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 46, 136, 0.28) 0%, rgba(255, 46, 136, 0) 62%)`,
          }}
        />

        {/* Glass body of the sphere with a bright core. */}
        <div
          style={{
            ...abs,
            left: CX - R,
            top: CY - R,
            width: R * 2,
            height: R * 2,
            borderRadius: "50%",
            border: `2px solid rgba(62, 224, 255, 0.75)`,
            backgroundImage: `radial-gradient(circle at 42% 38%, rgba(238, 247, 255, 0.95) 0%, rgba(62, 224, 255, 0.7) 9%, rgba(61, 184, 255, 0.35) 30%, rgba(11, 74, 153, 0.35) 58%, rgba(5, 13, 28, 0.7) 100%)`,
            boxShadow: `0 0 70px rgba(61, 184, 255, 0.55), 0 0 160px rgba(62, 224, 255, 0.25)`,
          }}
        />

        {/* Wireframe, tilted like the particles. */}
        <div style={{ ...abs, left: CX - R, top: CY - R, width: R * 2, height: R * 2, transform: "rotate(-18deg)" }}>
          {MERIDIANS.map((k) => (
            <div
              key={`m${k}`}
              style={{
                ...abs,
                left: R - R * k,
                top: 0,
                width: R * 2 * k,
                height: R * 2,
                borderRadius: "50%",
                border: "1.5px solid rgba(62, 224, 255, 0.42)",
              }}
            />
          ))}
          {PARALLELS.map((p) => {
            const w = R * 2 * Math.sqrt(1 - p * p);
            const h = w * 0.26;
            return (
              <div
                key={`p${p}`}
                style={{
                  ...abs,
                  left: R - w / 2,
                  top: R + p * R - h / 2,
                  width: w,
                  height: h,
                  borderRadius: "50%",
                  border: `1.5px solid rgba(62, 224, 255, ${p === 0 ? 0.6 : 0.36})`,
                }}
              />
            );
          })}
        </div>

        {DOTS.map((p, i) => (
          <div
            key={i}
            style={{
              ...abs,
              left: p.left,
              top: p.top,
              width: p.d,
              height: p.d,
              borderRadius: "50%",
              background: i % 9 === 0 ? PINK : NEON,
              opacity: p.o,
            }}
          />
        ))}

        {/* Orbit ring with a pink satellite on its upper right arc. */}
        <div
          style={{
            ...abs,
            left: CX - 260,
            top: CY - 70,
            width: 520,
            height: 140,
            borderRadius: "50%",
            border: `2px solid rgba(255, 46, 136, 0.6)`,
            transform: "rotate(-16deg)",
          }}
        >
          <div
            style={{
              ...abs,
              left: 460,
              top: 17,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: PINK,
              boxShadow: `0 0 18px ${PINK}, 0 0 40px rgba(255, 46, 136, 0.6)`,
            }}
          />
        </div>

        {/* Text column. */}
        <div style={{ ...abs, left: 92, top: 60, width: 640, flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, letterSpacing: 6, color: DIM }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: NEON, boxShadow: `0 0 12px ${NEON}` }} />
            <div style={{ display: "flex" }}>{"PORTFOLIO  //  YUI ONLINE"}</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              fontSize: 84,
              lineHeight: 1,
              letterSpacing: -2,
              textShadow: `0 0 28px rgba(61, 184, 255, 0.5)`,
            }}
          >
            <div style={{ display: "flex" }}>{first}</div>
            <div style={{ display: "flex" }}>{rest.join(" ")}</div>
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 36, color: NEON, textShadow: `0 0 18px rgba(62, 224, 255, 0.55)` }}>
            {person.role.en}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24, maxWidth: 600 }}>
            {stack.map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  fontSize: 20,
                  letterSpacing: 1,
                  color: ICE,
                  border: `1px solid rgba(61, 184, 255, 0.45)`,
                  background: "rgba(61, 184, 255, 0.08)",
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 38,
              alignSelf: "flex-start",
              padding: "14px 24px",
              fontSize: 28,
              color: FROST,
              border: `2px solid ${PINK}`,
              background: "rgba(255, 46, 136, 0.12)",
              boxShadow: `0 0 26px rgba(255, 46, 136, 0.35)`,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: PINK, boxShadow: `0 0 12px ${PINK}` }} />
            <div style={{ display: "flex" }}>{"Meet Yui — AI assistant"}</div>
          </div>
        </div>

        <div style={{ ...abs, right: 92, top: 62, fontSize: 20, letterSpacing: 6, color: CORE }}>{"EN · RU · UZ"}</div>
        <div style={{ ...abs, right: 92, bottom: 50, fontSize: 18, letterSpacing: 3, color: DIM }}>{host}</div>
      </div>
    ),
    { ...size },
  );
}
