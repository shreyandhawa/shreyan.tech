import { publishedNotes } from "@/content/notes";
import { site } from "@/content/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function GET() {
  const items = publishedNotes().map((n) => {
    const url = `${site.url}/notes/${n.slug}/`;
    return `<item><title>${esc(n.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(n.date).toUTCString()}</pubDate><description>${esc(n.summary)}</description></item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Notes — ${esc(site.name)}</title><link>${site.url}/notes/</link><description>Research notes by ${esc(site.name)}.</description><language>en</language><atom:link href="${site.url}/notes/feed.xml" rel="self" type="application/rss+xml"/>${items.join("")}</channel></rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
