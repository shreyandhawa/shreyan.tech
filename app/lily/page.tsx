import type { Metadata, Viewport } from "next";
import { LilyScene } from "@/components/lily/LilyScene";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Lily side", description: site.description };
// Lily side --bg (globals.css).
export const viewport: Viewport = { themeColor: "#0b0a0c" };

export default function Lily() {
  return <LilyScene />;
}
