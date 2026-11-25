import { expect, test, type Page } from "@playwright/test";

const animation = (el: Element) => {
  const s = getComputedStyle(el);
  return `${s.animationName} ${s.animationDuration}`;
};

// Properties of running animations and transitions that move or fade something (colour changes don't count).
const moving = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap(Object.keys))
      .filter((k) => /^(transform|translate|rotate|scale|opacity|filter)$/.test(k)),
  );

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("page enter is a 150ms fade and the system cursor stays", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("h1").evaluate(animation)).toBe("fade-in 0.15s");
    await expect(page.locator("html")).not.toHaveClass(/custom-cursor/);
  });

  test("the rail marker, copy toast, label swap and button press all rest", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/projects/lumencell/");
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole("navigation", { name: "Sections" }).locator("[aria-current]")).not.toHaveText("Overview");
    expect(await moving(page)).toEqual([]);

    await page.getByRole("heading", { name: "Overview", exact: true }).getByRole("link").click();
    await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible();
    expect(await moving(page)).toEqual([]);

    await page.getByRole("button", { name: "Cite: copy BibTeX" }).click();
    await expect(page.getByRole("status").filter({ hasText: "BibTeX copied" })).toHaveCount(1);
    expect(await moving(page)).toEqual([]);
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
  await expect(page.getByRole("status").filter({ hasText: "Commands copied" })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pip install lumencell\nlumencell demo");
});

test("Cite copies the BibTeX entry", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/projects/lumencell/");
  const cite = page.getByRole("button", { name: "Cite: copy BibTeX" });
  await cite.click();
  await expect(cite.getByText("Copied")).toBeVisible();
  await expect(cite.getByText("Cite", { exact: true })).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "BibTeX copied" })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^@software\{dhawa_lumencell_2026,/);
});

test("a section heading shows # on hover and copies its link with a toast", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/projects/lumencell/");
  const heading = page.getByRole("heading", { name: "Overview", exact: true }).getByRole("link");
  await heading.hover();
  await expect(heading.getByText("#")).toHaveCSS("opacity", "1");
  await heading.click();
  const toast = page.getByRole("status").filter({ hasText: "Link copied" });
  await expect(toast).toBeInViewport();
  expect(await toast.locator("span").evaluate(animation)).toBe("enter 0.15s");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/projects\/lumencell\/#overview$/);
  await expect(toast).toBeHidden({ timeout: 3000 });
});

// Records the view-transition pseudo-elements that animate on each navigation.
const recordMorphs = (page: Page) =>
  page.addInitScript(() => {
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
const morphs = (page: Page) => page.evaluate(() => (window as unknown as { morphs: string[] }).morphs);

test("a card's media morphs into the project hero", async ({ page }) => {
  await recordMorphs(page);
  await page.goto("/");
  await page.locator('a[href="/projects/lumencell/"]').click();
  await expect(page).toHaveURL(/\/projects\/lumencell\/$/);
  await expect.poll(() => morphs(page)).toContain("::view-transition-group(media-lumencell)");
});

// React skips a pair whose new half is off screen: at 720px tall the title sits just under the hero, so use a 900px window.
test("the Next project's name morphs into its title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await recordMorphs(page);
  await page.goto("/projects/lumencell/");
  await page.getByRole("navigation", { name: "Next project" }).getByRole("link").click();
  await expect(page).toHaveURL(/\/projects\/trustory\/$/);
  await expect.poll(() => morphs(page)).toContain("::view-transition-group(title-trustory)");
});
