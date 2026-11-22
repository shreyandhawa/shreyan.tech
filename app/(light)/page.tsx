import Link from "next/link";
import { ViewTransition } from "react";
import { MediaFrame } from "@/components/MediaFrame";
import { projects, type Project } from "@/content/projects";
import { site } from "@/content/site";

function Card({ project, order }: { project: Project; order: number }) {
  const { name, slug, card, listing } = project;
  return (
    <Link href={`/work/${slug}/`} data-cursor="View project" className="group block" style={{ order }}>
      <ViewTransition name={`media-${slug}`} share="morph" default="none">
        <MediaFrame media={card} eager={order < 2} hover />
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
  // Masonry: even indexes in the left column, odd in the right; one column in source order on small screens.
  const column = (side: 0 | 1) =>
    projects.map((p, i) => i % 2 === side && <Card key={p.slug} project={p} order={i} />);

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
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-6">
          <div className="contents md:flex md:flex-1 md:flex-col md:gap-10">{column(0)}</div>
          <div className="contents md:flex md:flex-1 md:flex-col md:gap-10">{column(1)}</div>
        </div>
      </section>
    </>
  );
}
