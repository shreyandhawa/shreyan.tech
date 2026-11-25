"use client";

import { useState } from "react";

/**
 * A project section's label heading, linking to its own section. A "#" shows on hover; clicking copies the URL with the hash
 * and shows a "Link copied" toast. If the clipboard refuses, the link just jumps to the section.
 */
export function SectionHeading({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(e.currentTarget.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.hash = id;
    }
  }

  return (
    <>
      <h2 id={`${id}-title`} className="label">
        <a
          href={`#${id}`}
          onClick={copy}
          data-cursor={copied ? "Copied" : "Copy link"}
          className="group/h tap relative transition-colors duration-150 hover:text-ink"
        >
          {title}
          <span aria-hidden="true" className="ml-1.5 opacity-0 group-hover/h:opacity-100 group-focus-visible/h:opacity-100">
            #
          </span>
        </a>
      </h2>
      <p role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
        {copied && (
          <span className="rounded-sm bg-ink px-2.5 py-1 text-[14px] leading-[22px] text-bg motion-safe:animate-[enter_var(--dur-fast)_ease-out]">
            Link copied
          </span>
        )}
      </p>
    </>
  );
}
