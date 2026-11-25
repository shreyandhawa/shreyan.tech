import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getNotes } from "./notes";
import { SMALL, nextProject, projects, type Media } from "./projects";
import { site } from "./site";

const publicFile = (src: string) => join(import.meta.dirname, "..", "public", src);

function expectMedia(m: Media) {
  expect(m.alt.length, `alt for ${m.src}`).toBeGreaterThan(10);
  expect(m.width).toBeGreaterThan(0);
  expect(m.height).toBeGreaterThan(0);
  if (m.video) expect(existsSync(publicFile(m.video)), m.video).toBe(true);
  for (const ext of [".avif", ".webp"]) {
    expect(existsSync(publicFile(m.src + ext)), m.src + ext).toBe(true);
    if (m.width > SMALL) expect(existsSync(publicFile(`${m.src}-${SMALL}${ext}`)), `${m.src}-${SMALL}${ext}: run npm run media`).toBe(true);
  }
}

describe("projects", () => {
  it("lists the four projects in grid order with unique slugs", () => {
    expect(projects.map((p) => p.slug)).toEqual(["lumencell", "trustory", "arohexis", "nosolear"]);
  });

  it.each(projects)("$name has every field its page needs", (p) => {
    for (const field of [p.name, p.oneLine, p.timeline, p.status, ...Object.values(p.listing)]) {
      expect(field.trim()).not.toBe("");
    }
    if (p.role !== undefined) expect(p.role.trim()).not.toBe("");
    // Missing facts are left out (their rows hide), never shipped as placeholders.
    expect(JSON.stringify(p)).not.toMatch(/TODO/);
    expect(p.sections[0]?.title).toBe("Overview");
    for (const s of p.sections) expect(s.paragraphs.length + (s.commands?.length ?? 0)).toBeGreaterThan(0);
    if (p.deployed) expect(p.deployed.href).toMatch(/^https:\/\//);
    if (p.code) expect(p.code).toMatch(/^https:\/\/github\.com\/shreyandhawa\//);
    for (const l of p.links ?? []) {
      expect(l.label.trim()).not.toBe("");
      expect(l.href).toMatch(/^https:\/\//);
    }
    for (const m of [p.card, p.hero, ...p.sections.flatMap((s) => s.figures ?? [])]) if (m) expectMedia(m);
    if (p.card) expect(existsSync(publicFile(`og/${p.slug}.png`)), "share image: run npm run build && npm run og").toBe(true);
    if (p.stats) {
      expect(p.stats.length).toBeGreaterThanOrEqual(2);
      expect(p.stats.length).toBeLessThanOrEqual(4);
      for (const s of p.stats) {
        expect(s.value).toMatch(/\d/);
        expect(s.label.trim()).not.toBe("");
      }
    }
    if (p.cite) {
      expect(p.cite).toMatch(/^@\w+\{\w+,\n[\s\S]*\n\}$/);
      expect(p.cite.split("{").length).toBe(p.cite.split("}").length);
    }
  });

  it("lumenCell alone has stats and a citation, both from its copy", () => {
    const [lumencell, ...rest] = projects;
    // Each figure appears in the page copy, the research row or the figure alt text: nothing invented.
    const copy = JSON.stringify({ lumencell, site }).replace(/three/g, "3").replace(/four/g, "4");
    expect(lumencell.stats?.map((s) => s.value)).toEqual(["21,762", "3", "4", "0.67–0.95"]);
    for (const s of lumencell.stats!) expect(copy).toContain(s.value);
    expect(lumencell.cite).toContain(`url = {${lumencell.code}}`);
    for (const p of rest) expect([p.stats, p.cite]).toEqual([undefined, undefined]);
  });

  it("lumenCell has Overview, Validation and Try it; TruStory has a Where row and no code link", () => {
    expect(projects[0].sections.map((s) => s.title)).toEqual(["Overview", "Validation", "Try it"]);
    const trustory = projects.find((p) => p.slug === "trustory")!;
    expect(trustory.where).toBeTruthy();
    expect(trustory.code).toBeUndefined();
  });

  it("next project wraps around", () => {
    expect(nextProject("lumencell").slug).toBe("trustory");
    expect(nextProject("nosolear").slug).toBe("lumencell");
  });
});

describe("site", () => {
  it("has the About, Research, Education and Contact content", () => {
    expect(site.about).toHaveLength(4);
    expect(site.research.map((r) => r.label)).toEqual(["Clonal trajectory research"]);
    for (const r of site.research) expect(r.href).toMatch(/^https:\/\//);
    expect(site.education).toHaveLength(2);
    expect(site.contact.email).toMatch(/@/);
  });
});

describe("notes", () => {
  it.each(getNotes())("$slug has complete frontmatter", (n) => {
    expect(n.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const field of [n.title, n.summary]) expect(typeof field === "string" && field.trim(), `${n.slug}: title and summary`).toBeTruthy();
    expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(n.date).toISOString().slice(0, 10)).toBe(n.date);
    expect(n.draft === undefined || typeof n.draft === "boolean").toBe(true);
    expect(JSON.stringify(n)).not.toMatch(/TODO/);
  });
});
