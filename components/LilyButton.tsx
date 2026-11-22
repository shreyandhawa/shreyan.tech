import Link from "next/link";
import { LilyIcon } from "./LilyIcon";

/** Top-right, 32px from the edges, in the same place on both sides. */
export function LilyButton({ side = "light" }: { side?: "light" | "lily" }) {
  const lily = side === "lily";
  return (
    <Link
      // TODO(phase 8): play the takeover / its reverse, and return to the page the visitor came from.
      href={lily ? "/" : "/lily/"}
      aria-label={lily ? "Back to the light side" : "Lily side"}
      data-cursor={lily ? "Return" : "Bloom"}
      data-cursor-accent={lily ? undefined : true}
      className={`absolute right-4 top-4 z-40 grid size-10 place-items-center rounded-full md:fixed md:right-8 md:top-8 ${
        lily ? "text-scarlet ring-1 ring-ink/70" : "bg-white/70 text-accent ring-1 ring-line"
      }`}
    >
      <LilyIcon className="size-5" />
    </Link>
  );
}
