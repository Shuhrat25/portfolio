import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Tektur, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/components/SeoProfile";
import { person } from "@/content/profile";
import "./globals.css";

const display = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"], weight: ["400", "600", "700"] });
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "cyrillic"] });
const cyber = Tektur({ variable: "--font-tektur", subsets: ["latin", "cyrillic"], weight: ["500", "700"] });

const title = `${person.name.en} — ${person.role.en}`;
const description =
  "Full-stack software engineer in Tashkent: React, Next.js, Node.js, TypeScript, PostgreSQL, Three.js. Ask Yui, his AI assistant, about his projects and work.";
const shareDescription = "Meet Yui, the AI assistant who tells you about Shuhrat's work, projects and CARDINAL.";

// The share image comes from app/opengraph-image.tsx; twitter:image falls back to it, so neither block lists images.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s · ${person.name.en}` },
  description,
  applicationName: `${person.name.en} · Portfolio`,
  keywords: [
    person.name.en,
    person.name.ru,
    "full-stack developer",
    "full-stack engineer",
    "React developer",
    "Next.js developer",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "Three.js",
    "React Three Fiber",
    "WebGL",
    "AI assistant",
    "CARDINAL",
    "Tashkent",
    "Uzbekistan",
    person.role.ru,
    person.role.uz,
  ],
  authors: [{ name: person.name.en, url: SITE_URL }],
  creator: person.name.en,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${person.name.en} · Portfolio`,
    title,
    description: shareDescription,
    locale: "en_US",
    alternateLocale: ["ru_RU", "uz_UZ"],
  },
  twitter: { card: "summary_large_image", title, description: shareDescription },
};

export const viewport: Viewport = {
  themeColor: "#02050b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${cyber.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
