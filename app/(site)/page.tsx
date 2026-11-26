import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { Field } from "@/components/field/Field";
import { MediaFrame } from "@/components/MediaFrame";
import { projects, type Project } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Lets search engines tie this site to the same person's GitHub and LinkedIn.
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  description: site.description,
  sameAs: [site.contact.github.href, site.contact.linkedin.href],
  affiliation: { "@type": "CollegeOrUniversity", name: "University of Southern Mississippi" },
};

// The first project spans both columns as the lead piece.
function Card({ project, featured }: { project: Project; featured?: boolean }) {
  const { name, slug, card, listing } = project;
  return (
    <Link href={`/projects/${slug}/`} data-cursor="View project" className={`group block ${featured ? "md:col-span-2" : ""}`}>
      <ViewTransition name={`media-${slug}`} share="morph" default="none">
        {/* Lazy: the h1 is the first-screen content at every width, and the cards start below the fold on phones. */}
        <MediaFrame media={card} sizes={featured ? "(min-width: 900px) 864px, 100vw" : "(min-width: 900px) 420px, 100vw"} hover />
      </ViewTransition>
      <p className="mt-3 text-[14px] leading-5">
        <span className="text-ink">{name}</span>
        <span aria-hidden="true" className="mx-2 text-muted">
          /
        </span>
        <span className="text-muted tabular-nums">
          {listing.status} · {listing.year}
        </span>
      </p>
      <p className="mt-1 text-[14px] leading-5 text-muted">{listing.what}</p>
    </Link>
  );
}

export default function Home() {
  const { headline, currently } = site.home;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      {/* The field fills the headline's box plus margins, short of the rail and the muted "Currently" label.
          Phones have no room above the headline, so it sits behind the text at half strength. */}
      <div className="relative isolate">
        <Field className="absolute -inset-x-4 -top-10 -bottom-6 -z-10 opacity-50 mask-b-from-80% md:-left-12 md:-right-[72px] md:-top-48 md:-bottom-8 md:opacity-100" />
        <h1 className="enter font-serif text-[36px] leading-[42px] tracking-[-0.5px] text-ink md:text-[52px] md:leading-[60px] md:tracking-[-1px]">
          {headline}
        </h1>
      </div>
      <section className="enter mt-10 max-w-[640px] [--i:1]">
        <h2 className="label">Currently</h2>
        <p className="mt-1.5 text-[14px] leading-[22px] text-ink">{currently}</p>
      </section>

      <section aria-labelledby="projects" className="enter mt-16 [--i:2]">
        <h2 id="projects" className="sr-only">
          Projects
        </h2>
        {/* One list in source order, so reading and Tab order match what is on screen at every width. */}
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-x-6">
          {projects.map((p, i) => (
            <Card key={p.slug} project={p} featured={i === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
