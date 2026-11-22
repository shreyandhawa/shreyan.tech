// The lily side's eight fingers and what each opens. Labels and captions are from the build spec (section 8).

import { projects } from "./projects";

export type Hand = "left" | "right";
export type FingerName = "index" | "middle" | "ring" | "little";
export type FingerId = "lumencell" | "arohexis" | "nosolear" | "trustory" | "about" | "research" | "education" | "contact";

export type Finger = { id: FingerId; hand: Hand; finger: FingerName; label: string; caption: string };

const projectName = (slug: string) => projects.find((p) => p.slug === slug)!.name;

export const fingers: Finger[] = [
  { id: "lumencell", hand: "left", finger: "index", label: projectName("lumencell"), caption: "FIG. 2A · DIGITUS II" },
  { id: "arohexis", hand: "left", finger: "middle", label: projectName("arohexis"), caption: "FIG. 2B · DIGITUS III" },
  { id: "nosolear", hand: "left", finger: "ring", label: projectName("nosolear"), caption: "FIG. 2C · DIGITUS IV" },
  { id: "trustory", hand: "left", finger: "little", label: projectName("trustory"), caption: "FIG. 2D · DIGITUS V" },
  { id: "about", hand: "right", finger: "index", label: "About", caption: "FIG. 3A · DIGITUS II" },
  { id: "research", hand: "right", finger: "middle", label: "Research", caption: "FIG. 3B · DIGITUS III" },
  { id: "education", hand: "right", finger: "ring", label: "Education", caption: "FIG. 3C · DIGITUS IV" },
  { id: "contact", hand: "right", finger: "little", label: "Contact", caption: "FIG. 3D · DIGITUS V" },
];

export const lily = {
  plate: "PLATE I — SELECT A FINGER",
  /** Plate line while a finger is selected, e.g. "PLATE I — FIG. 2A SELECTED". */
  plateSelected: (f: Finger) => `PLATE I — ${f.caption.split(" · ")[0]} SELECTED`,
  hands: { left: "SINISTRA — WORK", right: "DEXTRA — PERSON" } satisfies Record<Hand, string>,
  openCaseStudy: "Open case study →",
  release: "Esc · Release",
};

export const isFingerId = (s: string): s is FingerId => fingers.some((f) => f.id === s);
