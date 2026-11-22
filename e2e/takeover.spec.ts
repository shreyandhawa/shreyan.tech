import { expect, test, type Page } from "@playwright/test";

const overlay = (page: Page) => page.locator("canvas.fixed.z-\\[95\\]");
const labelOpacity = (page: Page, name: RegExp) => page.getByRole("button", { name }).evaluate((el) => getComputedStyle(el).opacity);

test("the lily button plays the takeover to /lily, and back to the page it came from", async ({ page }) => {
  await page.goto("/about/");
  await page.locator("[data-lily-button]").click();
  // under way: the overlay covers the page while it runs
  await expect(overlay(page)).toBeVisible();
  await expect(page).toHaveURL(/\/lily\/$/);
  // the scene arrives: labels fade in, then the overlay goes away
  await expect.poll(() => labelOpacity(page, /^TruStory/)).toBe("1");
  await expect(overlay(page)).toBeHidden();

  // return: the same timeline backwards, landing on /about
  await page.locator("[data-lily-button]").click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(overlay(page)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeAttached();
});

test("the return takes about 2s / 1.4", async ({ page }) => {
  await page.goto("/lily/");
  await page.waitForTimeout(500);
  const start = Date.now();
  await page.locator("[data-lily-button]").click();
  await expect(overlay(page)).toBeHidden({ timeout: 5000 });
  const took = Date.now() - start;
  expect(took).toBeGreaterThan(1200);
  expect(took).toBeLessThan(2600);
  await expect(page).toHaveURL(/\/$/); // no page to return to: home
});

test("'Open case study' plays the return and lands on the project page", async ({ page }) => {
  await page.goto("/lily/#arohexis");
  await page.getByRole("link", { name: "Open case study →" }).click();
  await expect(page).toHaveURL(/\/work\/arohexis\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Arohexis" })).toBeVisible();
  await expect(overlay(page)).toBeHidden();
});

test("loading /lily directly skips the takeover", async ({ page }) => {
  await page.goto("/lily/");
  await expect(overlay(page)).toBeHidden();
  await expect.poll(() => labelOpacity(page, /^Contact/)).toBe("1");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the takeover is a short cross-fade both ways", async ({ page }) => {
    await page.goto("/");
    const start = Date.now();
    await page.locator("[data-lily-button]").click();
    await expect(page).toHaveURL(/\/lily\/$/);
    await expect(overlay(page)).toBeHidden();
    expect(Date.now() - start).toBeLessThan(1500);
    await expect.poll(() => labelOpacity(page, /^lumenCell/)).toBe("1");

    await page.locator("[data-lily-button]").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(overlay(page)).toBeHidden();
  });
});
