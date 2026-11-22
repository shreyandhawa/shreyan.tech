import type { Metadata } from "next";
import { LilyScene } from "@/components/lily/LilyScene";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Lily side", description: site.description };

export default function Lily() {
  return <LilyScene />;
}
