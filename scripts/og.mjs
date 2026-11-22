// Regenerates public/og.png (1200×630) from the built Home page. Run after `npm run build`: npm run og
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const server = spawn("python3", ["-m", "http.server", "4175", "-d", "out"], { stdio: "ignore" });
try {
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await page.goto("http://localhost:4175/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // the 400ms fade-in
  await page.screenshot({ path: "public/og.png" });
  await browser.close();
  console.log("wrote public/og.png");
} finally {
  server.kill();
}
