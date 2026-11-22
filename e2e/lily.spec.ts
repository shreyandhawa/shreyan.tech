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
    // the sheet slides up from the bottom edge and settles there
    const sheet = page.getByRole("region", { name: "Contact" });
    await expect.poll(async () => Math.round((await sheet.boundingBox())!.y + (await sheet.boundingBox())!.height)).toBe(844);
    expect(await seriousViolations(page)).toEqual([]);
  });
});

// Paths are written in the left hand's coordinates; Appendix C's index touch pose and the rest pose.
const INDEX_TOUCH = "M28 -24L31 -64L15 -50";
const THUMB_INDEX = "M36 20L33 -12L17 -40";
const THUMB_REST = "M36 20L16 14L-4 8";
const pose = (page: Page, part: string) => page.locator(`[data-pose="${part}"]`).first();

test("selecting curls the finger and brings the thumb to its tip; switching moves the thumb directly", async ({ page }) => {
  await page.goto("/lily/");
  await page.getByRole("button", { name: /^lumenCell/ }).click();
  await expect(pose(page, "left-index")).toHaveAttribute("d", INDEX_TOUCH);
  await expect(pose(page, "left-thumb")).toHaveAttribute("d", THUMB_INDEX);
  // the panel slides in after the thumb lands
  const panel = page.getByRole("region", { name: "lumenCell" });
  await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

  await page.getByRole("button", { name: /^Arohexis/ }).click();
  await expect(pose(page, "left-thumb")).toHaveAttribute("d", "M36 20L30 -10L4 -39");
  await expect(pose(page, "left-index")).not.toHaveAttribute("d", INDEX_TOUCH);
  await expect(pose(page, "left-middle")).toHaveAttribute("d", "M9 -24L9 -64L2 -49");

  // release: the panel slides out, then unmounts; the hand returns to rest
  await page.keyboard.press("Escape");
  await expect.poll(() => page.locator("#lily-panel").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  await expect(page.locator("#lily-panel")).toHaveCount(0);
  await expect(pose(page, "left-thumb")).toHaveAttribute("d", THUMB_REST);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the thumb snaps and the panel fades without sliding", async ({ page }) => {
    await page.goto("/lily/");
    await page.getByRole("button", { name: /^lumenCell/ }).click();
    // no tween: the pose is already there on the next frame
    expect(await pose(page, "left-thumb").getAttribute("d")).toBe(THUMB_INDEX);
    const panel = page.locator("#lily-panel");
    const style = await panel.evaluate((el) => {
      const s = getComputedStyle(el);
      return { delay: s.transitionDelay, duration: s.transitionDuration, translate: s.translate };
    });
    expect(style).toEqual({ delay: "0s", duration: "0.15s", translate: "none" });
  });
});

// Idle: petals drift and stamens sway on the canvases; with reduced motion nothing moves.
const canvasHash = (page: Page) =>
  page.evaluate(() => {
    const c = document.querySelectorAll<HTMLCanvasElement>("[data-side=lily] canvas")[1];
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0;
    return h;
  });

test("idle: the lilies sway and petals drift", async ({ page }) => {
  await page.goto("/lily/");
  await page.waitForTimeout(600);
  const a = await canvasHash(page);
  await page.waitForTimeout(500);
  expect(await canvasHash(page)).not.toBe(a);
});

test.describe("reduced motion, idle", () => {
  test.use({ reducedMotion: "reduce" });
  test("nothing moves", async ({ page }) => {
    await page.goto("/lily/");
    await page.waitForTimeout(600);
    const a = await canvasHash(page);
    await page.waitForTimeout(500);
    expect(await canvasHash(page)).toBe(a);
  });
});
