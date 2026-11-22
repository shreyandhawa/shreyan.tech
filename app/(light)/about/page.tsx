import type { Metadata } from "next";
import { CopyEmail } from "@/components/CopyEmail";
import { Rows } from "@/components/Rows";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About", description: site.about[0] };

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

      <Rows title="Research" rows={site.research} className="enter mt-16 [--i:1]" />
      <Rows title="Education" rows={site.education} className="enter mt-16 [--i:2]" />

      <section aria-labelledby="contact" className="enter mt-16 [--i:3]">
        <h2 id="contact" className="label">
          Contact
        </h2>
        <CopyEmail email={email} className="mt-3 text-[28px] leading-[34px] md:text-[44px] md:leading-[52px]" />
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
