// Prints the built /cv/ to public/cv.pdf and copies it into out/ for the deploy. Runs after `next build` in `npm run build`.
// The footer links it unless a hand-made public/resume.pdf exists (app/(site)/layout.tsx).
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const origin = "http://cv.local";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Serve out/ straight from disk: no server to start or wait for.
  await page.route(`${origin}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const path = join("out", pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    return existsSync(path) ? route.fulfill({ path }) : route.fulfill({ status: 404 });
  });
  await page.goto(`${origin}/cv/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Margins come from @page in app/globals.css.
  await page.pdf({ path: "public/cv.pdf", format: "Letter", tagged: true, outline: true });
  copyFileSync("public/cv.pdf", "out/cv.pdf");
  console.log("wrote public/cv.pdf and out/cv.pdf");
} finally {
  await browser.close();
}
