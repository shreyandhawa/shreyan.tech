import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/about/",
  ...["lumencell", "arohexis", "nosolear", "trustory"].map((s) => `/projects/${s}/`),
  // GitHub Pages serves this for unknown URLs; the test server only serves it by name.
  "/404.html",
];

test("a project page shares its own title and URL", async ({ page }) => {
  await page.goto("/projects/lumencell/");
  const og = (p: string) => page.locator(`meta[property="og:${p}"]`);
  await expect(og("title")).toHaveAttribute("content", "lumenCell — Shreyan Dhawa");
  await expect(og("url")).toHaveAttribute("content", /\/projects\/lumencell\/$/);
  await expect(og("image")).toHaveAttribute("content", /\/og\.png$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/projects\/lumencell\/$/);
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
        // Check contrast on the settled page, not mid-way through the page-enter fade.
        await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
        const { violations } = await new AxeBuilder({ page }).analyze();
        const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      });
    }
  });
