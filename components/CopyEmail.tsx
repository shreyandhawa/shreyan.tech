"use client";

import { useState } from "react";

/** The contact email in large serif. Clicking copies it; falls back to mailto: if the clipboard is unavailable. */
export function CopyEmail({ email, className }: { email: string; className: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${email}`;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy email ${email}`}
        data-cursor={copied ? "Copied" : "Copy email"}
        className={`text-left font-serif text-ink ${className}`}
      >
        {email} <span aria-hidden="true">→</span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email copied" : ""}
      </span>
    </>
  );
}
