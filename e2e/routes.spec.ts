import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getNotes } from "../content/notes";

const slugs = ["lumencell", "arohexis", "nosolear", "trustory"];
const routes = [
  "/",
  "/about/",
  ...slugs.map((s) => `/projects/${s}/`),
  "/notes/",
  // Drafts too: they build at their URL, just unlisted.
  ...getNotes().map((n) => `/notes/${n.slug}/`),
  // GitHub Pages serves this for unknown URLs; the test server only serves it by name.
  "/404.html",
];

test("a project page shares its own title and URL", async ({ page }) => {
  await page.goto("/projects/lumencell/");
  const og = (p: string) => page.locator(`meta[property="og:${p}"]`);
  await expect(og("title")).toHaveAttribute("content", "lumenCell — Shreyan Dhawa");
  await expect(og("url")).toHaveAttribute("content", /\/projects\/lumencell\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/projects\/lumencell\/$/);
});

for (const slug of slugs)
  test(`/projects/${slug}/ shares its own image`, async ({ page, request }) => {
    await page.goto(`/projects/${slug}/`);
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(image).toMatch(new RegExp(`/og/${slug}\\.png$`));
    const res = await request.get(new URL(image!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  });

test("drafts stay off the notes index, the feed and the sitemap", async ({ page, request }) => {
  const drafts = getNotes().filter((n) => n.draft).map((n) => `/notes/${n.slug}/`);
  await page.goto("/notes/");
  const index = await page.content();
  const feed = await request.get("/notes/feed.xml");
  expect(feed.status()).toBe(200);
  const listed = [index, await feed.text(), await (await request.get("/sitemap.xml")).text()].join();
  for (const d of drafts) expect(listed).not.toContain(d);
  for (const d of drafts) {
    await page.goto(d);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

for (const [size, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const)
  test.describe(size, () => {
    test.use({ viewport });
    for (const route of routes) {
      test(`${route} renders and passes axe`, async ({ page }) => {
        const res = await page.goto(route);
        expect(res?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        // Check contrast on the settled page, not mid-way through the page-enter fade. Scroll-driven animations (the
        // scrub figure) never finish while the page sits still, so only time-based ones are awaited.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.timeline === document.timeline).map((a) => a.finished)));
        const { violations } = await new AxeBuilder({ page }).analyze();
        const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      });
    }
  });
