import type { Metadata } from "next";
import Link from "next/link";
import { MediaFrame } from "@/components/MediaFrame";
import { Rich } from "@/components/Rich";
import { getProject, nextProject, projects } from "@/content/projects";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug)!;
  return { title: p.name, description: p.oneLine };
}

function Meta({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-3" : undefined}>
      <dt className="label">{label}</dt>
      <dd className="mt-1.5 text-[14px] leading-[21px] text-ink">{value}</dd>
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const p = getProject((await params).slug)!;
  const next = nextProject(p.slug);
  const last = p.sections.length - 1;

  return (
    <article>
      <MediaFrame media={p.hero} eager />
      <div className="mx-auto max-w-[640px]">
        <h1 className="mt-10 font-serif text-[44px] leading-[48px] tracking-[-0.5px] text-ink md:text-[56px] md:leading-[60px]">
          {p.name}
        </h1>
        <p className="mt-4 text-[17px] leading-[27px] text-ink-2">{p.oneLine}</p>

        <dl className="mt-10 grid gap-6 md:grid-cols-3">
          <Meta label="Role" value={p.role} />
          <Meta label="Timeline" value={p.timeline} />
          <Meta label="Status" value={p.status} />
          {p.where && <Meta label="Where" value={p.where} wide />}
          <Meta label="Stack" value={p.stack.join(" · ")} wide />
        </dl>

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
              <pre className="mt-3 overflow-x-auto bg-surface px-4 py-3 font-mono text-[13px] leading-6 text-ink">
                <code>{s.commands.join("\n")}</code>
              </pre>
            )}
            {s.figures?.map((f) => (
              <div key={f.src} className="mt-6">
                <MediaFrame media={f} />
              </div>
            ))}
            {i === last && p.code && (
              <p className="mt-5 text-[14px] text-ink">
                <a href={p.code} target="_blank" rel="noopener noreferrer" className="underline-offset-4 transition-colors duration-150 hover:underline">
                  Code: {p.code.replace("https://", "")}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </section>
        ))}

        <nav aria-label="Next project" className="mt-16 border-t border-line pt-6">
          <p className="label">Next</p>
          <Link href={`/work/${next.slug}/`} className="mt-2 inline-block font-serif text-[32px] leading-10 text-ink">
            {next.name} <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
