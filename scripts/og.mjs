// Regenerates the social images from the built site. Run after `npm run build`: npm run og
// public/og.png is the Home page; public/og/<slug>.png is each project's card poster with its name on a plate at bottom right, clear of the posters' own titles (all 1200×630).
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { projects } from "../content/projects.ts";
import { site } from "../content/site.ts";

const server = spawn("python3", ["-m", "http.server", "4175", "-d", "out"], { stdio: "ignore" });
try {
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await page.goto("http://localhost:4175/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // the 400ms fade-in
  await page.screenshot({ path: "public/og.png" });
  console.log("wrote public/og.png");

  mkdirSync("public/og", { recursive: true });
  for (const p of projects.filter((p) => p.card)) {
    // The built page supplies the fonts, colours and grain; its body is swapped for the poster and the name.
    await page.goto(`http://localhost:4175/projects/${p.slug}/`, { waitUntil: "networkidle" });
    await page.evaluate(
      ({ src, name, by }) => {
        document.body.innerHTML = `
          <img style="position:fixed;inset:0;width:100%;height:100%;object-fit:cover">
          <div style="position:fixed;right:40px;bottom:40px;padding:20px 28px 24px;border-radius:4px;background:var(--bg)">
            <span style="display:block;font:72px/1 var(--font-instrument-serif);letter-spacing:-1px;color:var(--ink)"></span>
            <span style="display:block;margin-top:14px;font:14px/1 var(--font-geist-mono);letter-spacing:2px;text-transform:uppercase;color:var(--muted)"></span>
          </div>
          <div class="grain"></div>`;
        document.querySelector("img").src = src;
        const [title, byline] = document.querySelectorAll("span");
        title.textContent = name;
        byline.textContent = by;
      },
      { src: `${p.card.src}.webp`, name: p.name, by: site.name },
    );
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => Promise.all([document.fonts.ready, document.querySelector("img").decode()]));
    await page.screenshot({ path: `public/og/${p.slug}.png` });
    console.log(`wrote public/og/${p.slug}.png`);
  }
  await browser.close();
} finally {
  server.kill();
}
