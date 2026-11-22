"use client";

import Link from "next/link";
import { bloom, centreOf, returnPath, unbloom } from "./takeover/controller";
import { LilyIcon } from "./LilyIcon";

/**
 * Top-right, 32px from the edges, in the same place on both sides. On the light side it plays the takeover to
 * /lily; on the lily side it plays it backwards and returns to the page the visitor came from (or /).
 * Modified clicks (new tab, etc.) and no-JS fall through to the plain link.
 */
export function LilyButton({ side = "light" }: { side?: "light" | "lily" }) {
  const lily = side === "lily";
  return (
    <Link
      href={lily ? "/" : "/lily/"}
      data-lily-button
      aria-label={lily ? "Back to the light side" : "Lily side"}
      data-cursor={lily ? "Return" : "Bloom"}
      data-cursor-accent={lily ? undefined : true}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const origin = centreOf(e.currentTarget);
        if (lily ? unbloom(origin, returnPath()) : bloom(origin)) e.preventDefault();
      }}
      className={`absolute right-4 top-4 tap z-40 grid size-10 place-items-center rounded-full md:fixed md:right-8 md:top-8 ${
        lily ? "text-scarlet ring-1 ring-ink/70" : "bg-white/70 text-accent ring-1 ring-line"
      }`}
    >
      <LilyIcon className="size-5" />
    </Link>
  );
}
