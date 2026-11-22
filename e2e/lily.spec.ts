import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LEFT = ["lumenCell", "Arohexis", "Nosolear", "TruStory"];
const RIGHT = ["About", "Research", "Education", "Contact"];

async function seriousViolations(page: Page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`);
}

const focusedName = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.innerText.split("\n")[0] ?? "");

test("tab order: left labels top to bottom, then right labels, then the lily button", async ({ page }) => {
  await page.goto("/lily/");
  const seen: string[] = [];
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    seen.push(await focusedName(page));
  }
  expect(seen.slice(0, 8)).toEqual([...LEFT, ...RIGHT]);
  await expect(page.getByRole("link", { name: "Back to the light side" })).toBeFocused();
});

test("a finger opens its panel, puts it in the hash, and Esc releases it", async ({ page }) => {
  await page.goto("/lily/");
  const label = page.getByRole("button", { name: /^lumenCell/ });
  await label.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lily\/#lumencell$/);
  await expect(label).toHaveAttribute("aria-expanded", "true");
  const panel = page.getByRole("region", { name: "lumenCell" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: "Open case study →" })).toHaveAttribute("href", "/work/lumencell/");
  // The opposite column is hidden behind the panel (inert): Tab goes left labels → panel → lily button.
  const seen: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    seen.push(await focusedName(page));
  }
  expect(seen).toEqual(["Arohexis", "Nosolear", "TruStory", "Open case study →", "ESC · RELEASE", ""]);
  await expect(page.getByRole("link", { name: "Back to the light side" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/lily\/$/);
  await expect(panel).toHaveCount(0);
  await expect(label).toHaveAttribute("aria-expanded", "false");
});

test("the same finger again releases; another finger switches", async ({ page }) => {
  await page.goto("/lily/");
  await page.getByRole("button", { name: /^Arohexis/ }).click();
  await page.getByRole("button", { name: /^Nosolear/ }).click();
  await expect(page).toHaveURL(/#nosolear$/);
  await expect(page.getByRole("region", { name: "Nosolear" })).toBeVisible();
  await page.getByRole("button", { name: /^Nosolear/ }).click();
  await expect(page.getByRole("region")).toHaveCount(0);
});

test("loading /lily#about opens About directly; the panel's control releases it", async ({ page }) => {
  await page.goto("/lily/#about");
  const panel = page.getByRole("region", { name: "About" });
  await expect(panel).toContainText("I'm a computer science undergraduate");
  await panel.getByRole("button", { name: "Esc · Release" }).click();
  await expect(panel).toHaveCount(0);
});

for (const hash of ["#lumencell", "#research", "#contact"]) {
  test(`axe passes with the ${hash} panel open`, async ({ page }) => {
    await page.goto(`/lily/${hash}`);
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test.describe("under 900px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("labels are a two-column list, the panel is a bottom sheet, and axe passes", async ({ page }) => {
    await page.goto("/lily/");
    const lumen = await page.getByRole("button", { name: /^lumenCell/ }).boundingBox();
    const about = await page.getByRole("button", { name: /^About/ }).boundingBox();
    expect(Math.abs(lumen!.y - about!.y)).toBeLessThan(2);
    expect(about!.x).toBeGreaterThan(lumen!.x + 100);
    expect(await seriousViolations(page)).toEqual([]);

    await page.getByRole("button", { name: /^Contact/ }).click();
    const sheet = await page.getByRole("region", { name: "Contact" }).boundingBox();
    expect(sheet!.y + sheet!.height).toBeCloseTo(844, 0);
    expect(await seriousViolations(page)).toEqual([]);
  });
});
