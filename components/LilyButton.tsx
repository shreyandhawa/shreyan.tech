import Link from "next/link";
import { LilyIcon } from "./LilyIcon";

export function LilyButton() {
  return (
    <Link
      href="/lily/"
      aria-label="Lily side"
      data-cursor="Bloom"
      data-cursor-accent
      className="absolute right-4 top-4 z-40 grid size-10 place-items-center rounded-full bg-white/70 text-accent ring-1 ring-line md:fixed md:right-8 md:top-8"
    >
      <LilyIcon className="size-5" />
    </Link>
  );
}
