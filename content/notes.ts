// Notes are MDX files in content/notes/; the file name is the slug. Server-only (reads the disk).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Note = { slug: string; title: string; date: string; summary: string; draft?: boolean };

const dir = join(process.cwd(), "content", "notes");

// shortcut: flat `key: value` lines only (double-quoted strings, true/false); switch to the `yaml` package if notes need lists or nesting.
function frontmatter(file: string): Record<string, unknown> {
  const block = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!block) throw new Error(`${file}: no frontmatter`);
  return Object.fromEntries(
    block.split(/\r?\n/).map((line) => {
      const [, key, raw] = line.match(/^(\w+):\s*(.*)$/) ?? [];
      if (!key) throw new Error(`${file}: can't read frontmatter line "${line}"`);
      return [key, raw.startsWith('"') ? JSON.parse(raw) : raw === "true" ? true : raw === "false" ? false : raw];
    }),
  );
}

/** Every note, drafts included, newest first. */
export function getNotes(): Note[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ ...frontmatter(f), slug: f.slice(0, -4) }) as Note)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** What the index, the feed and the sitemap list. Drafts still build at their URL, marked noindex. */
export const publishedNotes = () => getNotes().filter((n) => !n.draft);

/** "2026-11-25" → "November 25, 2026", in UTC so the day never shifts. */
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
