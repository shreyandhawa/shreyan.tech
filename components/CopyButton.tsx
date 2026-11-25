"use client";

import { useState } from "react";

/**
 * "Copy" in the corner of a code block, placed right after its <pre>; `label`, `name`, `done` and `className` reword and move it.
 * If the clipboard refuses, the <pre> before it is selected instead, or with none, the text opens as a plain-text page.
 */
export function CopyButton({
  text,
  label = "Copy",
  name = "Copy commands",
  done = "Commands copied",
  className = "absolute right-2 top-2",
}: {
  text: string;
  /** Visible text before copying. */
  label?: string;
  /** Accessible name; must contain `label`. */
  name?: string;
  /** Screen-reader status once copied. */
  done?: string;
  /** Positioning; `tap` needs it positioned. */
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    const pre = e.currentTarget.previousElementSibling;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (pre instanceof HTMLPreElement) getSelection()?.selectAllChildren(pre);
      else location.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    }
  }

  return (
    <>
      {/* The label style in ink-2, not its muted grey: muted on the surface ground is under 4.5:1. */}
      <button
        type="button"
        onClick={copy}
        aria-label={name}
        className={`tap ${className} rounded-sm px-1.5 py-1 font-mono text-[11px] uppercase leading-4 tracking-[1.5px] text-ink-2 transition-colors duration-150 hover:text-ink`}
      >
        {copied ? "Copied" : label}
      </button>
      <span role="status" className="sr-only">
        {copied ? done : ""}
      </span>
    </>
  );
}
