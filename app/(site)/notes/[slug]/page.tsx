import type { Metadata, ResolvingMetadata } from "next";
import { formatDate, getNotes } from "@/content/notes";
import { site } from "@/content/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return getNotes().map(({ slug }) => ({ slug }));
}

const getNote = (slug: string) => getNotes().find((n) => n.slug === slug)!;

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">, parent: ResolvingMetadata): Promise<Metadata> {
  const n = getNote((await params).slug);
  const url = `/notes/${n.slug}/`;
  // A page's openGraph replaces the layout's whole, so carry the shared image over.
  const images = (await parent).openGraph?.images;
  return {
    title: n.title,
    description: n.summary,
    alternates: { canonical: url },
    robots: n.draft ? { index: false } : undefined,
    openGraph: { type: "article", publishedTime: n.date, siteName: site.name, images, url, title: `${n.title} — ${site.name}`, description: n.summary },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const n = getNote((await params).slug);
  const { default: Body } = await import(`@/content/notes/${n.slug}.mdx`);

  return (
    // Left-aligned, not centred like a project page, so sidenotes have the right margin from 1200px.
    <article className="max-w-[640px]">
      <h1 className="enter font-serif text-[44px] leading-[48px] tracking-[-0.5px] text-ink md:text-[56px] md:leading-[60px]">{n.title}</h1>
      <p className="enter mt-4 text-[17px] [--i:1] leading-[27px] text-ink-2">{n.summary}</p>
      <p className="enter label mt-6 [--i:1]">
        <time dateTime={n.date}>{formatDate(n.date)}</time>
        {n.draft && " · Draft"}
      </p>
      {/* flow-root keeps a late sidenote inside the article. */}
      <div className="enter mt-10 flow-root [--i:2]">
        <Body />
      </div>
    </article>
  );
}
