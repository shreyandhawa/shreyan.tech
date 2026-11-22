import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { nextProject, projects, type Media } from "./projects";
import { site } from "./site";

const publicFile = (src: string) => join(import.meta.dirname, "..", "public", src);

function expectMedia(m: Media) {
  expect(m.alt.length, `alt for ${m.src}`).toBeGreaterThan(10);
  expect(m.width).toBeGreaterThan(0);
  expect(m.height).toBeGreaterThan(0);
  if (m.src.endsWith(".webm")) {
    expect(existsSync(publicFile(m.src)), m.src).toBe(true);
  } else {
    for (const ext of [".avif", ".webp"]) expect(existsSync(publicFile(m.src + ext)), m.src + ext).toBe(true);
  }
  if (m.poster) expectMedia(m.poster);
}

describe("projects", () => {
  it("lists the five projects in grid order with unique slugs", () => {
    expect(projects.map((p) => p.slug)).toEqual(["lumencell", "arohexis", "nosolear", "trustory", "resauce"]);
  });

  it.each(projects)("$name has every field its page needs", (p) => {
    for (const field of [p.name, p.oneLine, p.role, p.timeline, p.status, ...Object.values(p.listing)]) {
      expect(field.trim()).not.toBe("");
    }
    expect(p.stack.length).toBeGreaterThan(0);
    expect(p.sections[0]?.title).toBe("Overview");
    for (const s of p.sections) expect(s.paragraphs.length + (s.commands?.length ?? 0)).toBeGreaterThan(0);
    if (p.code) expect(p.code).toMatch(/^https:\/\/github\.com\/shreyandhawa\//);
    for (const m of [p.card, p.hero, ...p.sections.flatMap((s) => s.figures ?? [])]) if (m) expectMedia(m);
  });

  it("lumenCell has Overview, Validation and Try it; TruStory has a Where row and no code link", () => {
    expect(projects[0].sections.map((s) => s.title)).toEqual(["Overview", "Validation", "Try it"]);
    const trustory = projects.find((p) => p.slug === "trustory")!;
    expect(trustory.where).toBeTruthy();
    expect(trustory.code).toBeUndefined();
  });

  it("next project wraps around", () => {
    expect(nextProject("lumencell").slug).toBe("arohexis");
    expect(nextProject("resauce").slug).toBe("lumencell");
  });
});

describe("site", () => {
  it("has the About, Research, Education and Contact content", () => {
    expect(site.about).toHaveLength(3);
    expect(site.research.map((r) => r.label)).toEqual([
      "lumenCell",
      "Interests",
      "Looking for",
      "Stack I actually work in",
      "Learning now",
    ]);
    expect(site.education).toHaveLength(3);
    expect(site.contact.email).toMatch(/@/);
  });
});
