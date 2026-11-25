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

test("a card's media morphs into the project hero", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { morphs: string[] };
    w.morphs = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg: Parameters<typeof start>[0]) => {
      const t = start(arg);
      t.ready
        .then(() => w.morphs.push(...document.getAnimations().map((a) => (a.effect as KeyframeEffect).pseudoElement ?? "")))
        .catch(() => {});
      return t;
    }) as typeof document.startViewTransition;
  });
  await page.goto("/");
  await page.locator('a[href="/projects/lumencell/"]').click();
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { morphs: string[] }).morphs))
    .toContain("::view-transition-group(media-lumencell)");
});
