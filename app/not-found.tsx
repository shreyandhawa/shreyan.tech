import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "./(site)/layout";

export const metadata: Metadata = { title: "Not found" };

/** Unknown URLs (out/404.html on GitHub Pages): the site's own rail and footer around one line and a way back. */
export default function NotFound() {
  return (
    <SiteLayout>
      <h1 className="enter font-serif text-[36px] leading-[42px] tracking-[-0.5px] text-ink md:text-[52px] md:leading-[60px] md:tracking-[-1px]">
        Nothing lives at this address.
      </h1>
      <p className="enter mt-6 text-[14px] leading-5 text-ink [--i:1]">
        <Link href="/" className="tap relative">
          Back to projects <span aria-hidden="true" className="nudge">→</span>
        </Link>
      </p>
    </SiteLayout>
  );
}
