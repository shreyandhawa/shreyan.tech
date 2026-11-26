import { existsSync } from "node:fs";
import { join } from "node:path";
import { Footer } from "@/components/Footer";
import { Palette, type PaletteItem } from "@/components/Palette";
import { Rail } from "@/components/Rail";
import { publishedNotes } from "@/content/notes";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

// A hand-made public/resume.pdf wins; otherwise the build prints /cv/ to /cv.pdf (scripts/cv.mjs).
const resume = existsSync(join(process.cwd(), "public", "resume.pdf")) ? "/resume.pdf" : "/cv.pdf";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const palette: PaletteItem[] = [
    ...projects.map((p) => ({ group: "Project", label: p.name, href: `/projects/${p.slug}/` })),
    ...publishedNotes().map((n) => ({ group: "Note", label: n.title, href: `/notes/${n.slug}/` })),
    { group: "Page", label: "Home", href: "/" },
    { group: "Page", label: "Notes", href: "/notes/" },
    { group: "Page", label: "About", href: "/about/" },
    { group: "Action", label: "Copy email", href: `mailto:${site.contact.email}` },
    { group: "Action", label: "Open résumé", href: resume },
    { group: "Action", label: "GitHub", href: site.contact.github.href },
    { group: "Action", label: "LinkedIn", href: site.contact.linkedin.href },
  ];

  return (
    <>
      <a href="#content" className="sr-only z-50 bg-bg px-3 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Rail />
      <div className="px-4 md:pl-[200px] md:pr-[72px] lg:pl-[288px] print:p-0">
        <main id="content" className="max-w-[864px] pt-12 md:pt-[220px] print:pt-0">
          {children}
        </main>
        <Footer resume={resume} />
      </div>
      <Palette items={palette} />
      <div aria-hidden="true" className="grain print:hidden" />
    </>
  );
}
