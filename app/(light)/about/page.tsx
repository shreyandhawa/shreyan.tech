import type { Metadata } from "next";
import { CopyEmail } from "@/components/CopyEmail";
import { site, type Row } from "@/content/site";

export const metadata: Metadata = { title: "About", description: site.about[0] };

function Rows({ title, rows, className }: { title: string; rows: Row[]; className: string }) {
  return (
    <section aria-labelledby={title} className={`enter mt-16 ${className}`}>
      <h2 id={title} className="label">
        {title}
      </h2>
      <dl className="mt-3">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-line py-4 md:grid-cols-[180px_1fr] md:gap-6">
            <dt className="text-[14px] font-medium leading-[22px] text-ink">{r.label}</dt>
            <dd className="text-[14px] leading-[22px] text-ink-2">
              {r.value.map((v) => (
                <p key={v} className="first-letter:uppercase">
                  {v}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function About() {
  const [statement, ...body] = site.about;
  const { email, github, city, availability } = site.contact;

  return (
    <>
      <h1 className="sr-only">About</h1>
      <div className="enter grid gap-10 md:grid-cols-[1fr_280px] md:gap-12">
        <div>
          <p className="font-serif text-[26px] leading-[34px] tracking-[-0.3px] text-ink md:text-[32px] md:leading-[42px]">{statement}</p>
          {body.map((p) => (
            <p key={p} className="mt-6 text-[16px] leading-[26px] text-ink-2">
              {p}
            </p>
          ))}
        </div>
        {/* Portrait slot for the illustrated character (art supplied later). */}
        <div className="flex h-[360px] w-[280px] items-end bg-surface p-3">
          <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-ink-2">TODO: illustrated character</span>
        </div>
      </div>

      <Rows title="Research" rows={site.research} className="[--i:1]" />
      <Rows title="Education" rows={site.education} className="[--i:2]" />

      <section aria-labelledby="contact" className="enter mt-16 [--i:3]">
        <h2 id="contact" className="label">
          Contact
        </h2>
        <CopyEmail email={email} />
        <p className="mt-3 text-[14px] text-ink">
          <a href={github.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            {github.label}
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="mt-3 text-[14px] leading-[22px] text-ink-2">{city}</p>
        <p className="text-[14px] leading-[22px] text-ink-2">{availability}</p>
      </section>
    </>
  );
}
