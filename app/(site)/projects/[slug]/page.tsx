import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ExternalLink } from "@/components/ExternalLink";
import { MediaFrame } from "@/components/MediaFrame";
import { Rich } from "@/components/Rich";
import { SectionHeading } from "@/components/SectionHeading";
import { lastCommit, pypiVersion } from "@/content/badges";
import { getProject, nextProject, projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">, parent: ResolvingMetadata): Promise<Metadata> {
  const p = getProject((await params).slug)!;
  const url = `/projects/${p.slug}/`;
  // `npm run og` writes one per card; without a card, carry the layout's shared image over (a page's openGraph replaces it whole).
  const images = p.card
    ? [{ url: `/og/${p.slug}.png`, width: 1200, height: 630, alt: `${p.name}: ${p.oneLine}` }]
    : (await parent).openGraph?.images;
  return {
    title: p.name,
    description: p.oneLine,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: site.name, images, url, title: `${p.name} — ${site.name}`, description: p.oneLine },
  };
}

function Meta({ label, value, wide, href }: { label: string; value: string; wide?: boolean; href?: string }) {
  return (
    <div className={wide ? "md:col-span-3" : undefined}>
      <dt className="label">{label}</dt>
      <dd className="mt-1.5 text-[14px] leading-[21px] text-ink">
        {href ? (
          <ExternalLink href={href}>{value}</ExternalLink>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = getProject((await params).slug)!;
  const next = nextProject(p.slug);
  const last = p.sections.length - 1;
  const [version, commit] = await Promise.all([pypiVersion(p), lastCommit(p)]);
  const chip = "rounded-sm bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-ink";

  return (
    <article>
      {/* Same name as the Home card: the card media morphs into this hero. */}
      <ViewTransition name={`media-${p.slug}`} share="morph" default="none">
        <MediaFrame media={p.hero} eager />
      </ViewTransition>
      <div className="mx-auto max-w-[640px]">
        {/* Same name as the Next link on the previous project: its name morphs into this title. The enter fade sits on a
            wrapper so it stays out of the morph's snapshot, and w-fit keeps the box the size of the text. */}
        <div className="enter mt-10">
          <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
            <h1 className="w-fit font-serif text-[44px] leading-[48px] tracking-[-0.5px] text-ink md:text-[56px] md:leading-[60px]">
              {p.name}
            </h1>
          </ViewTransition>
        </div>
        <p className="enter mt-4 text-[17px] [--i:1] leading-[27px] text-ink-2">{p.oneLine}</p>

        <dl className="enter mt-10 grid gap-6 md:grid-cols-3 [--i:2]">
          {p.role && <Meta label="Role" value={p.role} />}
          <Meta label="Timeline" value={p.timeline} />
          <Meta label="Status" value={p.status} />
          {p.where && <Meta label="Where" value={p.where} wide />}
          {p.deployed && <Meta label="Deployed" value={p.deployed.label} href={p.deployed.href} wide />}
          {p.stack.length > 0 && <Meta label="Stack" value={p.stack.join(" · ")} wide />}
        </dl>

        <div className="enter [--i:3]">
          {p.stats && (
            <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              {p.stats.map((s) => (
                // Value above its label, but the label reads first; justify-end packs both to the top.
                <div key={s.label} className="flex flex-col-reverse justify-end">
                  <dt className="label mt-1">{s.label}</dt>
                  <dd className="font-serif text-[32px] leading-10 text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {(version || commit) && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {version && <li className={`${chip} tabular-nums`}>PyPI v{version}</li>}
              {commit && (
                <li className={chip}>
                  Last commit{" "}
                  <time dateTime={commit}>
                    {new Date(commit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  </time>
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="enter [--i:4]">
          {p.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="mt-12 scroll-mt-8">
              <SectionHeading id={s.id} title={s.title} />
              {s.paragraphs.map((text, j) => (
                <p key={j} className="mt-3 text-[16px] leading-[26px] text-ink-2">
                  <Rich text={text} />
                </p>
              ))}
              {s.commands && (
                <div className="relative mt-3">
                  <pre className="overflow-x-auto bg-surface py-3 pl-4 pr-20 font-mono text-[13px] leading-6 text-ink">
                    <code>{s.commands.join("\n")}</code>
                  </pre>
                  <CopyButton text={s.commands.join("\n")} />
                </div>
              )}
              {s.figures?.map((f) => (
                <div key={f.src} className="mt-6">
                  <MediaFrame media={f} />
                </div>
              ))}
              {i === last && p.code && (
                <p className="mt-5 text-[14px] text-ink">
                  <ExternalLink href={p.code}>Code: {p.code.replace("https://", "")}</ExternalLink>
                </p>
              )}
              {i === last &&
                p.links?.map((l) => (
                  <p key={l.href} className="mt-2 text-[14px] text-ink">
                    <ExternalLink href={l.href}>{l.label}</ExternalLink>
                  </p>
                ))}
              {i === last && p.deployed && (
                <p className="mt-2 text-[14px] text-ink">
                  <ExternalLink href={p.deployed.href}>Check out the website</ExternalLink>
                </p>
              )}
              {i === last && p.cite && (
                <p className="mt-3">
                  <CopyButton text={p.cite} label="Cite" name="Cite: copy BibTeX" done="BibTeX copied" className="relative bg-surface" />
                </p>
              )}
            </section>
          ))}
        </div>

        <nav aria-label="Next project" className="enter mt-16 [--i:5] border-t border-line pt-6">
          <p className="label">Next</p>
          <Link href={`/projects/${next.slug}/`} className="tap relative mt-2 inline-block font-serif text-[32px] leading-10 text-ink">
            <ViewTransition name={`title-${next.slug}`} share="morph" default="none">
              <span className="inline-block">{next.name}</span>
            </ViewTransition>{" "}
            <span aria-hidden="true" className="nudge">→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
