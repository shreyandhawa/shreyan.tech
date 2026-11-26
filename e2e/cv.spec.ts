import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { projects } from "../content/projects";
import { site } from "../content/site";

// Rendering and axe for /cv/ run with every route in routes.spec.ts.

test("/cv/ is built from the site and project content", async ({ page }) => {
  await page.goto("/cv/");
  await expect(page.locator("h1")).toHaveText(site.name);
  await expect(page.getByRole("link", { name: site.contact.email })).toHaveAttribute("href", `mailto:${site.contact.email}`);
  for (const r of [...site.education, ...site.research]) await expect(page.locator("dt", { hasText: r.label })).toBeVisible();
  for (const p of projects) {
    await expect(page.getByRole("link", { name: p.name, exact: true })).toHaveAttribute("href", `/projects/${p.slug}/`);
    await expect(page.getByText(p.oneLine)).toBeVisible();
    await expect(page.getByText(p.stack.join(" · "))).toBeVisible();
    await expect(page.getByText(p.timeline, { exact: true })).toBeVisible();
  }
});

test("/cv/ prints black on white, without the rail, grain or footer, with each link's address", async ({ page }) => {
  await page.goto("/cv/");
  await page.emulateMedia({ media: "print" });
  for (const hidden of [page.getByRole("banner"), page.getByRole("contentinfo"), page.locator(".grain")]) await expect(hidden).toBeHidden();
  const colours = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector("dd")!).color]);
  expect(colours).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
  const after = (href: string) => page.locator(`main a[href="${href}"]`).evaluate((a) => getComputedStyle(a, "::after").content);
  expect(await after("/projects/lumencell/")).toContain(`${site.url}/projects/lumencell/`);
  expect(await after(site.research[0].href!)).toContain(site.research[0].href);
  // The contact links already read as their address.
  expect(await after(site.contact.github.href)).toBe("none");
});

test("the build prints /cv/ to /cv.pdf, and the footer prefers a hand-made resume.pdf", async ({ page, request }) => {
  const pdf = await request.get("/cv.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: /^Resume/ })).toHaveAttribute(
    "href",
    existsSync("public/resume.pdf") ? "/resume.pdf" : "/cv.pdf",
  );
});
