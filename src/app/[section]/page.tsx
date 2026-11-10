import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import SeoProfile from "@/components/SeoProfile";
import { sectionLines } from "@/content/narration";
import { person } from "@/content/profile";
import { PANELS, ui } from "@/content/ui";
import { isPanel } from "@/lib/deep-link";
import { alt, contentType, size } from "../opengraph-image";

// /cardinal, /projects, /contacts…: the same site, opened straight on that section (see deep-link.ts).
type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return PANELS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  if (!isPanel(section)) return {};
  const name = ui.menu[section].en;
  const description = sectionLines[section].en;
  const title = `${name} · ${person.name.en}`;
  // A segment's own openGraph replaces the root one, share image included, so it is named again.
  const image = { url: "/opengraph-image", ...size, type: contentType, alt };
  return {
    title: name,
    description,
    alternates: { canonical: `/${section}` },
    openGraph: {
      type: "website",
      url: `/${section}`,
      siteName: `${person.name.en} · Portfolio`,
      title,
      description,
      locale: "en_US",
      alternateLocale: ["ru_RU", "uz_UZ"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  if (!isPanel(section)) notFound();
  return (
    <>
      <Experience section={section} />
      <SeoProfile />
    </>
  );
}
