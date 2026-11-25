import type { Metadata, ResolvingMetadata } from "next";
import { CopyEmail } from "@/components/CopyEmail";
import { Rows } from "@/components/Rows";
import { site } from "@/content/site";

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const url = "/about/";
  // A page's openGraph replaces the layout's whole, so carry the shared image over.
  const images = (await parent).openGraph?.images;
  return {
    title: "About",
    description: site.about[0],
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: site.name, images, url, title: `About — ${site.name}`, description: site.about[0] },
  };
}

export default function About() {
  const { email, github, linkedin } = site.contact;

  return (
    <>
      <h1 className="sr-only">About</h1>
      <div className="enter max-w-[640px]">
        {site.about.map((p, i) => (
          <p key={p} className={`${i ? "mt-6" : ""} text-[16px] leading-[26px] text-ink-2`}>
            {p}
          </p>
        ))}
      </div>

      <Rows title="Independent research" rows={site.research} className="enter mt-16 [--i:1]" />
      <Rows title="Education" rows={site.education} className="enter mt-16 [--i:2]" />

      <section aria-labelledby="contact" className="enter mt-16 [--i:3]">
        <h2 id="contact" className="label">
          Contact
        </h2>
        <CopyEmail email={email} className="mt-3 text-[28px] leading-[34px] md:text-[44px] md:leading-[52px]" />
        {[github, linkedin].map((l) => (
          <p key={l.href} className="mt-3 text-[14px] text-ink">
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="tap relative draw">
              {l.label}
              <span aria-hidden="true">&nbsp;↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ))}
      </section>
    </>
  );
}
