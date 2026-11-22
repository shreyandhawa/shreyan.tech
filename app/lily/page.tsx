import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Lily side" };

// Placeholder until the lily scene lands (phase 6).
export default function Lily() {
  return (
    <main data-side="lily" className="fixed inset-0 grid place-items-center bg-bg text-ink">
      <div className="text-center">
        <h1 className="font-serif text-[46px]">Lily side</h1>
        <Link href="/" className="mt-4 inline-block text-muted hover:text-ink">
          Back to the light side
        </Link>
      </div>
    </main>
  );
}
