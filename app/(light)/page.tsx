import Link from "next/link";
import { ViewTransition } from "react";
import { MediaFrame } from "@/components/MediaFrame";
import { projects, type Project } from "@/content/projects";
import { site } from "@/content/site";

function Card({ project }: { project: Project }) {
  const { name, slug, card, listing } = project;
  return (
    <Link href={`/work/${slug}/`} data-cursor="View project" className="group block">
      <ViewTransition name={`media-${slug}`} share="morph" default="none">
        {/* Lazy: the h1 is the first-screen content at every width, and the cards start below the fold on phones. */}
        <MediaFrame media={card} sizes="(min-width: 900px) 420px, 100vw" hover />
      </ViewTransition>
      <p className="mt-3 text-[14px] leading-5">
        <span className="text-ink">{name}</span>
        <span aria-hidden="true" className="mx-2 text-muted">
          /
        </span>
        <span className="text-muted">
          {listing.status} · {listing.year}
        </span>
      </p>
      <p className="mt-1 text-[14px] leading-5 text-muted">{listing.what}</p>
    </Link>
  );
}

export default function Home() {
  const { headline, intro, currently, previously } = site.home;
  return (
    <>
      <h1 className="enter font-serif text-[36px] leading-[42px] tracking-[-0.5px] text-ink md:text-[52px] md:leading-[60px] md:tracking-[-1px]">
        {headline}
      </h1>
      <p className="enter mt-8 max-w-[640px] [--i:1] text-[17px] leading-[27px] text-ink-2">{intro}</p>
      <div className="enter mt-10 grid gap-8 [--i:2] md:grid-cols-2 md:gap-12">
        <section>
          <h2 className="text-[14px] leading-5 text-muted">Currently</h2>
          <p className="mt-1.5 text-[14px] leading-[22px] text-ink">{currently}</p>
        </section>
        <section>
          <h2 className="text-[14px] leading-5 text-muted">Previously</h2>
          <p className="mt-1.5 text-[14px] leading-[22px] text-ink">{previously}</p>
        </section>
      </div>

      <section aria-labelledby="work" className="enter mt-16 [--i:3]">
        <h2 id="work" className="sr-only">
          Work
        </h2>
        {/* One list in source order, so reading and Tab order match what is on screen at every width. */}
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-x-6">
          {projects.map((p) => (
            <Card key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
