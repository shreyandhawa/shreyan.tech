"use client";

import { useState } from "react";

/** "Copy" in the corner of a code block, placed right after its <pre>. If the clipboard refuses, the block is selected instead. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    const pre = e.currentTarget.previousElementSibling;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (pre) getSelection()?.selectAllChildren(pre);
    }
  }

  return (
    <>
      {/* The label style in ink-2, not its muted grey: muted on the surface ground is under 4.5:1. */}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy commands"
        className="tap absolute right-2 top-2 rounded-sm px-1.5 py-1 font-mono text-[11px] uppercase leading-4 tracking-[1.5px] text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Commands copied" : ""}
      </span>
    </>
  );
}
