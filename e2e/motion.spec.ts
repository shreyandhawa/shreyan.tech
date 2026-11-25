import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const animation = (el: Element) => {
  const s = getComputedStyle(el);
  return `${s.animationName} ${s.animationDuration}`;
};

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("page enter is a 150ms fade and the system cursor stays", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("h1").evaluate(animation)).toBe("fade-in 0.15s");
    await expect(page.locator("html")).not.toHaveClass(/custom-cursor/);
  });
});

test("page enter blurs blocks in, 40ms apart", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("h1").evaluate(animation)).toBe("enter 0.45s");
  expect(await page.locator("h1 + section").evaluate((el) => getComputedStyle(el).animationDelay)).toBe("0.04s");
});

// Headless Chromium has no H.264, so count play() calls instead of checking playback.
const countPlays = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { plays: number };
    w.plays = 0;
    HTMLMediaElement.prototype.play = () => (w.plays++, Promise.resolve());
  });
const plays = (page: Page) => page.evaluate(() => (window as unknown as { plays: number }).plays);

test("card clips play when on screen", async ({ page }) => {
  await countPlays(page);
  await page.goto("/");
  await expect.poll(() => plays(page)).toBeGreaterThan(0);
});

test.describe("reduced motion clips", () => {
  test.use({ reducedMotion: "reduce" });

  test("card clips stay on their poster", async ({ page }) => {
    await countPlays(page);
    await page.goto("/");
    await page.locator("video").last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await plays(page)).toBe(0);
  });
});

test("cursor shows a label over a card", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/custom-cursor/);
  await page.locator('a[href="/projects/lumencell/"]').hover();
  const label = page.getByText("View project", { exact: true });
  await expect(label).toHaveCount(1);
  await expect.poll(() => label.evaluate((el) => el.parentElement!.style.width)).not.toBe("0px");
});

test("clicking the email copies it and the label says Copied", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/about/");
  const email = page.getByRole("button", { name: /copy email/i });
  await email.click();
  await expect(email).toHaveAttribute("data-cursor", "Copied");
  await expect(page.getByRole("status")).toHaveText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("shreyan.dhawa@gmail.com");
});

test("the install commands copy with one click", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/projects/lumencell/");
  await page.getByRole("button", { name: "Copy commands" }).click();
  await expect(page.getByRole("status")).toHaveText("Commands copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pip install lumencell\nlumencell demo");
});

// Records the pseudo-elements each view transition animates.
const recordTransitions = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { animated: string[] };
    w.animated = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg: Parameters<typeof start>[0]) => {
      const t = start(arg);
      t.ready
        .then(() => w.animated.push(...document.getAnimations().map((a) => (a.effect as KeyframeEffect).pseudoElement ?? "")))
        .catch(() => {});
      return t;
    }) as typeof document.startViewTransition;
  });
const animated = (page: Page) => page.evaluate(() => (window as unknown as { animated: string[] }).animated);

test("a card's media morphs into the project hero", async ({ page }) => {
  await recordTransitions(page);
  await page.goto("/");
  await page.locator('a[href="/projects/lumencell/"]').click();
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);
  await expect.poll(() => animated(page)).toContain("::view-transition-group(media-lumencell)");
});

const figure = (page: Page) => page.getByRole("button", { name: /^Enlarge: lumenCell explorer in dark mode/ });

test("a figure morphs into a full-size lightbox and Esc returns focus to it", async ({ page }) => {
  await recordTransitions(page);
  await page.goto("/projects/lumencell/");
  const zoom = figure(page);
  const dialog = page.getByRole("dialog");

  await zoom.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", "/media/lumencell/explorer-playback.webp");
  await expect.poll(() => animated(page)).toContain("::view-transition-group(zoom-media-lumencell-explorer-playback)");
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(zoom).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(zoom).toBeFocused();
});

test("a backdrop click or a downward swipe closes the lightbox", async ({ page }) => {
  await page.goto("/projects/lumencell/");
  const dialog = page.getByRole("dialog");
  await figure(page).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toHaveCount(0);

  await figure(page).click();
  const at = (clientY: number) => [{ identifier: 0, clientX: 200, clientY }];
  await dialog.dispatchEvent("touchstart", { touches: at(200), changedTouches: at(200) });
  await dialog.dispatchEvent("touchend", { touches: [], changedTouches: at(230) });
  await expect(dialog).toBeVisible(); // 30px is not a swipe
  await dialog.dispatchEvent("touchstart", { touches: at(200), changedTouches: at(200) });
  await dialog.dispatchEvent("touchend", { touches: [], changedTouches: at(320) });
  await expect(dialog).toHaveCount(0);
});

test.describe("reduced motion lightbox", () => {
  test.use({ reducedMotion: "reduce" });

  test("the lightbox fades in and out instead of morphing", async ({ page }) => {
    await recordTransitions(page);
    await page.goto("/projects/lumencell/");
    await figure(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Open and close each fade the whole page (other reduced-motion transitions animate nothing); nothing is named, so nothing morphs.
    await expect.poll(async () => (await animated(page)).filter((p) => p === "::view-transition-old(root)").length).toBe(2);
    expect((await animated(page)).join()).not.toContain("zoom");
  });
});
