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
      {/* The illustrated portrait (280x360, right of this text from md up) returns once the art exists: HANDOFF.md. */}
      <div className="enter max-w-[640px]">
        <p className="font-serif text-[26px] leading-[34px] tracking-[-0.3px] text-ink md:text-[32px] md:leading-[42px]">{statement}</p>
        {body.map((p) => (
          <p key={p} className="mt-6 text-[16px] leading-[26px] text-ink-2">
            {p}
          </p>
        ))}
      </div>

      <Rows title="Research" rows={site.research} className="enter mt-16 [--i:1]" />
      <Rows title="Education" rows={site.education} className="enter mt-16 [--i:2]" />

      <section aria-labelledby="contact" className="enter mt-16 [--i:3]">
        <h2 id="contact" className="label">
          Contact
        </h2>
        <CopyEmail email={email} className="mt-3 text-[28px] leading-[34px] md:text-[44px] md:leading-[52px]" />
        <p className="mt-3 text-[14px] text-ink">
          <a href={github.href} target="_blank" rel="noopener noreferrer" className="tap relative underline-offset-4 hover:underline">
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
