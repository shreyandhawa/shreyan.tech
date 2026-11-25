import type { Metadata, ResolvingMetadata } from "next";
import { Rows } from "@/components/Rows";
import { formatDate, publishedNotes } from "@/content/notes";
import { site } from "@/content/site";

const description = `Research notes by ${site.name}.`;

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const url = "/notes/";
  // A page's openGraph replaces the layout's whole, so carry the shared image over.
  const images = (await parent).openGraph?.images;
  return {
    title: "Notes",
    description,
    alternates: { canonical: url, types: { "application/rss+xml": "/notes/feed.xml" } },
    openGraph: { type: "website", siteName: site.name, images, url, title: `Notes — ${site.name}`, description },
  };
}

export default function Notes() {
  const notes = publishedNotes();
  return (
    <div className="enter">
      <h1 className="label mb-3">Notes</h1>
      {notes.length ? (
        <Rows rows={notes.map((n) => ({ label: n.title, href: `/notes/${n.slug}/`, value: [formatDate(n.date), n.summary] }))} />
      ) : (
        <p className="text-[14px] leading-[22px] text-ink-2">Nothing published yet.</p>
      )}
    </div>
  );
}
