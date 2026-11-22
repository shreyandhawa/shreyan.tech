import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/about/",
  ...["lumencell", "arohexis", "nosolear", "trustory"].map((s) => `/projects/${s}/`),
];

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
