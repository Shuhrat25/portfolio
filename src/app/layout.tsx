import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Tektur, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"], weight: ["400", "600", "700"] });
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "cyrillic"] });
const cyber = Tektur({ variable: "--font-tektur", subsets: ["latin", "cyrillic"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Shuhrat Abdurahmonov — Full-Stack Engineer",
  description:
    "Portfolio of Shuhrat Abdurahmonov, full-stack engineer (React, Next.js, Node.js, TypeScript, Three.js). Meet Yui, his AI assistant.",
  openGraph: {
    title: "Shuhrat Abdurahmonov — Full-Stack Engineer",
    description: "Meet Yui, the AI assistant who tells you about Shuhrat's work, projects and CARDINAL.",
    type: "website",
  },
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
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
