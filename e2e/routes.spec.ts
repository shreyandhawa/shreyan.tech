import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getNotes } from "../content/notes";

const slugs = ["lumencell", "arohexis", "nosolear", "trustory"];
const routes = [
  "/",
  "/about/",
  "/cv/",
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

test("analytics stay off without UMAMI_WEBSITE_ID, and the tracked controls carry their event names", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator('script[src*="umami"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Copy email/ })).toHaveAttribute("data-umami-event", "Copy email");
  await page.goto("/projects/arohexis/");
  const code = page.getByRole("link", { name: /^Code:/ });
  await expect(code).toHaveAttribute("data-umami-event", "Code link");
  await expect(code).toHaveAttribute("data-umami-event-project", "arohexis");
});

for (const width of [1440, 1024, 768, 390, 320])
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const route of routes) {
      test(`${route} renders, fits and passes axe`, async ({ page }) => {
        const res = await page.goto(route);
        expect(res?.status()).toBe(200);
        // One h1 first, and no level skipped on the way down.
        const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((hs) => hs.map((h) => +h.tagName[1]));
        expect(levels.filter((l) => l === 1)).toHaveLength(1);
        expect(levels[0]).toBe(1);
        levels.forEach((l, i) => i && expect(l, `h${levels[i - 1]} → h${l}`).toBeLessThanOrEqual(levels[i - 1] + 1));
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
        // Check contrast on the settled page, not mid-way through the page-enter fade. Scroll-driven animations (the
        // scrub figure) never finish while the page sits still, so only time-based ones are awaited.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.timeline === document.timeline).map((a) => a.finished)));
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      });
    }
  });

// A phone, and an iPad in landscape: wide enough for the rail, but a finger. Links inside running text are exempt (WCAG 2.5.5).
for (const [size, width] of [
  ["phone", 390],
  ["tablet", 1024],
] as const)
  test.describe(`${size} touch targets`, () => {
    test.use({ viewport: { width, height: 900 }, hasTouch: true });
    for (const route of routes) {
      test(`${route}: 44px each, none overlapping`, async ({ page }) => {
        await page.goto(route);
        const problems = await page.evaluate(() => {
          const boxes = [...document.querySelectorAll<HTMLElement>("a[href], button, input")].flatMap((el) => {
            const b = el.getBoundingClientRect();
            const text = el.parentElement?.closest("p, li, dd")?.textContent?.trim() ?? "";
            const inText = getComputedStyle(el).display === "inline" && text.length > (el.textContent?.trim().length ?? 0) + 3;
            if (!b.width || el.closest(".sr-only, [aria-hidden='true']") || inText) return [];
            // The tap utility's ::before grows the area around the centre.
            const tap = getComputedStyle(el, "::before");
            const w = Math.max(b.width, tap.content === "none" ? 0 : parseFloat(tap.width));
            const h = Math.max(b.height, tap.content === "none" ? 0 : parseFloat(tap.height));
            const x = b.left + b.width / 2 - w / 2;
            const y = b.top + b.height / 2 - h / 2;
            return [{ el, name: el.getAttribute("aria-label") ?? el.textContent!.trim().slice(0, 30), x, y, w, h }];
          });
          const out = boxes.filter((b) => b.w < 43.5 || b.h < 43.5).map((b) => `${b.name}: ${Math.round(b.w)}×${Math.round(b.h)}`);
          for (const a of boxes)
            for (const b of boxes)
              if (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING && !a.el.contains(b.el))
                if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1)
                  out.push(`${a.name} overlaps ${b.name}`);
          return out;
        });
        expect(problems).toEqual([]);
      });
    }
  });
