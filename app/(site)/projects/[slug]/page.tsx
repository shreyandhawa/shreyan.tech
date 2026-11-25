import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { MediaFrame } from "@/components/MediaFrame";
import { Rich } from "@/components/Rich";
import { getProject, nextProject, projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">, parent: ResolvingMetadata): Promise<Metadata> {
  const p = getProject((await params).slug)!;
  const url = `/projects/${p.slug}/`;
  // A page's openGraph replaces the layout's whole, so carry the shared image over.
  const images = (await parent).openGraph?.images;
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
          <a href={href} target="_blank" rel="noopener noreferrer" className="tap relative draw">
            {value}
            <span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
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

  return (
    <article>
      {/* Same name as the Home card: the card media morphs into this hero. */}
      <ViewTransition name={`media-${p.slug}`} share="morph" default="none">
        <MediaFrame media={p.hero} eager />
      </ViewTransition>
      <div className="mx-auto max-w-[640px]">
        <h1 className="enter mt-10 font-serif text-[44px] leading-[48px] tracking-[-0.5px] text-ink md:text-[56px] md:leading-[60px]">
          {p.name}
        </h1>
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
          {p.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="mt-12 scroll-mt-8">
              <h2 id={`${s.id}-title`} className="label">
                {s.title}
              </h2>
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
                  <a href={p.code} target="_blank" rel="noopener noreferrer" className="tap relative draw">
                    Code: {p.code.replace("https://", "")}
                    <span aria-hidden="true">&nbsp;↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
              {i === last &&
                p.links?.map((l) => (
                  <p key={l.href} className="mt-2 text-[14px] text-ink">
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="tap relative draw">
                      {l.label}
                      <span aria-hidden="true">&nbsp;↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </p>
                ))}
              {i === last && p.deployed && (
                <p className="mt-2 text-[14px] text-ink">
                  <a href={p.deployed.href} target="_blank" rel="noopener noreferrer" className="tap relative draw">
                    Check out the website
                    <span aria-hidden="true">&nbsp;↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
            </section>
          ))}
        </div>

        <nav aria-label="Next project" className="enter mt-16 [--i:4] border-t border-line pt-6">
          <p className="label">Next</p>
          <Link href={`/projects/${next.slug}/`} className="tap relative mt-2 inline-block font-serif text-[32px] leading-10 text-ink">
            {next.name} <span aria-hidden="true" className="nudge">→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
