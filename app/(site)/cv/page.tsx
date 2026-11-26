import type { Metadata, ResolvingMetadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { Rows } from "@/components/Rows";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

const description = `CV of ${site.name}: education, research and projects.`;

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const url = "/cv/";
  // A page's openGraph replaces the layout's whole, so carry the shared image over.
  const images = (await parent).openGraph?.images;
  return {
    title: "CV",
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: site.name, images, url, title: `CV — ${site.name}`, description },
  };
}

/** Printed to /cv.pdf at build time (scripts/cv.mjs); the print styles are in app/globals.css. */
export default function CV() {
  const { email, github, linkedin } = site.contact;

  return (
    // Print writes the site's address before internal links, which only carry their path.
    <div style={{ "--site": JSON.stringify(site.url) } as React.CSSProperties}>
      <h1 className="enter font-serif text-[36px] leading-[42px] tracking-[-0.5px] text-ink md:text-[52px] md:leading-[60px] md:tracking-[-1px]">
        {site.name}
      </h1>
      {/* The link text is already the address, so print adds nothing after it. Wrapped on a phone, touch:gap-y-6 keeps
          the rows' 44px touch areas apart. */}
      <ul className="enter mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] leading-[22px] text-ink touch:gap-y-6 [--i:1]">
        <li>
          <a href={`mailto:${email}`} className="tap relative draw">
            {email}
          </a>
        </li>
        {[github, linkedin].map((l) => (
          <li key={l.href}>
            <ExternalLink href={l.href} className="draw print:after:content-none">
              {l.label}
            </ExternalLink>
          </li>
        ))}
      </ul>

      <Rows title="Education" rows={site.education} className="enter mt-12 [--i:2]" />
      <Rows title="Independent research" rows={site.research} className="enter mt-12 [--i:3]" />
      <Rows
        title="Projects"
        rows={projects.map((p) => ({ label: p.name, href: `/projects/${p.slug}/`, value: [p.oneLine, p.stack.join(" · "), p.timeline] }))}
        className="enter mt-12 [--i:4]"
      />
    </div>
  );
}
