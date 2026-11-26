import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The custom cursor mounts in the same hydration pass as the palette's key listener.
async function visit(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("html")).toHaveClass(/custom-cursor/);
}

async function openPalette(page: Page) {
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("⌘K opens the palette on the search field; Esc and ⌘K close it", async ({ page }) => {
  await visit(page, "/");
  await expect(page.locator("footer")).toContainText("⌘K to search");
  await openPalette(page);
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await openPalette(page);
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("typing filters the results, accents aside", async ({ page }) => {
  await visit(page, "/");
  await openPalette(page);
  const options = page.getByRole("option");
  await page.keyboard.type("lumen");
  await expect(options).toHaveText([/^lumenCell/]);
  await page.getByRole("combobox").fill("resume");
  await expect(options).toHaveText([/Open résumé/]);
  await page.getByRole("combobox").fill("zzz");
  await expect(options).toHaveCount(0);
  await expect(page.getByText("No matches")).toBeVisible();
});

test("arrow keys move the selection and Enter opens it", async ({ page }) => {
  await visit(page, "/");
  await openPalette(page);
  const options = page.getByRole("option");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp"); // wraps to the last
  await expect(options.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/trustory\/$/);
  await expect(page.getByRole("dialog")).toBeHidden();

  await openPalette(page);
  await page.keyboard.type("about");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about\/$/);
});

test("Copy email copies and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await visit(page, "/");
  await openPalette(page);
  await page.keyboard.type("copy");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option")).toHaveText([/^Copied/]);
  await expect(page.getByRole("status").filter({ hasText: "Email copied" })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("shreyan.dhawa@gmail.com");
});

test("j/k and ←/→ step between projects, but not while typing", async ({ page }) => {
  await visit(page, "/projects/lumencell/");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/projects\/trustory\/$/);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);
  await page.keyboard.press("k"); // wraps to the last
  await expect(page).toHaveURL(/\/projects\/nosolear\/$/);
  await page.keyboard.press("j");
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);

  await openPalette(page);
  await page.keyboard.type("jk");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("combobox")).toHaveValue("jk");
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);
});

test("j/k and ←/→ wait while a figure's lightbox is open", async ({ page }) => {
  await visit(page, "/projects/lumencell/");
  await page.getByRole("button", { name: /^Enlarge: / }).first().click();
  const lightbox = page.getByRole("dialog");
  await expect(lightbox).toBeVisible();
  for (const key of ["j", "k", "ArrowRight", "ArrowLeft"]) await page.keyboard.press(key);
  // Each would step to another project; none may land within 1.5s.
  await expect(page.waitForURL((url) => !url.pathname.startsWith("/projects/lumencell/"), { timeout: 1500 })).rejects.toThrow();
  await expect(lightbox).toBeVisible();
});

test("the open palette passes axe", async ({ page }) => {
  await visit(page, "/");
  await openPalette(page);
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
});

test.describe("touch", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("the footer hint is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText("Updated");
    await expect(page.getByText("to search")).toBeHidden();
  });
});
