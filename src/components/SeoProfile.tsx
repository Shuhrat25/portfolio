import { cardinal, contacts, education, experience, person, projects, skills, spokenLanguages, type ProjectKind } from "@/content/profile";

// Canonical origin, no trailing slash. NEXT_PUBLIC_SITE_URL overrides it (custom domain); a bare host gets https://.
const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const SITE_URL = (
  envUrl ? (/^https?:\/\//.test(envUrl) ? envUrl : `https://${envUrl}`) : "https://shuhrat-portfolio-ruby.vercel.app"
).replace(/\/+$/, "");

const KIND: Record<ProjectKind, string> = {
  "3d": "3D web",
  fullstack: "Full-stack",
  mobile: "Mobile (Android)",
  contribution: "Contribution",
};

const CV = [
  { label: "CV (English, PDF)", href: "/cv/Shuhrat_Abdurahmonov_CV_EN.pdf" },
  { label: "CV (Russian, PDF)", href: "/cv/Shuhrat_Abdurahmonov_CV_RU.pdf" },
];

// Profiles that are his own accounts: sameAs in JSON-LD, rel="me" on the links.
const PROFILES = ["github", "linkedin", "telegram"];
const employer = experience.find((e) => e.id === "neovex");

// schema.org Person for search engines. Only facts from profile.ts; he is still studying, hence affiliation, not alumniOf.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: person.name.en,
  alternateName: person.name.ru,
  jobTitle: person.role.en,
  description: person.summary.en,
  url: SITE_URL,
  sameAs: contacts.filter((c) => PROFILES.includes(c.id)).map((c) => c.href),
  ...(employer && { worksFor: { "@type": "Organization", name: employer.company, url: employer.link } }),
  affiliation: { "@type": "CollegeOrUniversity", name: education.school.en, alternateName: education.school.ru },
  knowsAbout: person.stackLine.split(" · "),
  knowsLanguage: ["uz", "ru", "en"],
};

// "<" is escaped so a string in the data can never close the script tag (see the Next.js JSON-LD guide).
const ld = JSON.stringify(personLd).replace(/</g, "\\u003c");

/**
 * The whole profile as plain English HTML for crawlers, link unfurlers and CV parsers: the visible site is a
 * WebGL scene that only renders on the client. Visually hidden but kept in the accessibility tree, so screen
 * readers get a text version too. Links are out of the Tab order: a sighted keyboard user would land on
 * invisible focus. They stay reachable through a screen reader's virtual cursor and links list.
 */
export default function SeoProfile() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      {/* English text, so screen readers must not read it with the page's ru/uz voice. */}
      <section lang="en" aria-label="Profile, text version" className="sr-only">
        <header>
          <h1>{person.name.en}</h1>
          <p>{`${person.role.en} · ${person.stackLine}`}</p>
          <p>{`${person.location.en}. ${person.status.en}.`}</p>
        </header>
        <p>{person.summary.en}</p>

        <h2>Experience</h2>
        <ol>
          {experience.map((e) => (
            <li key={e.id}>
              <h3>
                {`${e.role.en} — `}
                {e.link ? (
                  <a href={e.link} tabIndex={-1}>
                    {e.company}
                  </a>
                ) : (
                  e.company
                )}
              </h3>
              <p>{`${e.period.en} · ${e.place.en}`}</p>
              <ul>
                {e.points.map((p, i) => (
                  <li key={i}>{p.en}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <h2>{`CARDINAL — ${cardinal.tagline.en}`}</h2>
        <p>{cardinal.intro.en}</p>
        {[...cardinal.sections, cardinal.team].map((s) => (
          <section key={s.id}>
            <h3>{s.title.en}</h3>
            <p>{s.body.en}</p>
            <ul>
              {s.items.map((it) => (
                <li key={it.text.en}>{it.label ? `${it.label.en}: ${it.text.en}` : it.text.en}</li>
              ))}
            </ul>
          </section>
        ))}
        <h3>{cardinal.ask.title.en}</h3>
        <p>{cardinal.ask.body.en}</p>
        <ul>
          {cardinal.ask.funds.map((f) => (
            <li key={f.share}>{`${f.share}% — ${f.text.en}`}</li>
          ))}
        </ul>
        <p>{cardinal.status.en}</p>

        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <h3>{p.badge ? `${p.title} (${p.badge.en})` : p.title}</h3>
              <p>{`${KIND[p.kind]} · ${p.stack.join(", ")}`}</p>
              <p>{p.summary.en}</p>
              {p.demo && (
                <a href={p.demo} tabIndex={-1}>
                  {`${p.title}: live demo`}
                </a>
              )}
              {p.code && (
                <a href={p.code} tabIndex={-1}>
                  {`${p.title}: source code`}
                </a>
              )}
            </li>
          ))}
        </ul>

        <h2>Skills</h2>
        <dl>
          {skills.map((s) => (
            <div key={s.id}>
              <dt>{s.group.en}</dt>
              <dd>{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>

        <h2>Education</h2>
        <p>{education.school.en}</p>
        <p>{education.program.en}</p>

        <h2>Languages</h2>
        <p>{spokenLanguages.en}</p>

        <h2>Contacts</h2>
        <ul>
          {/* The phone number stays out of the crawlable HTML (spam scrapers); it is in the CV and the contacts panel. */}
          {contacts.filter((c) => c.id !== "whatsapp").map((c) => (
            <li key={c.id}>
              {`${c.label}: `}
              <a href={c.href} rel={PROFILES.includes(c.id) ? "me" : undefined} tabIndex={-1}>
                {c.handle}
              </a>
            </li>
          ))}
          {CV.map((c) => (
            <li key={c.href}>
              <a href={c.href} tabIndex={-1}>
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
