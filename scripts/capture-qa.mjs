import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = resolve("tmp", "qa-web");
const routes = [
  ["home", "/", ".hero"],
  ["open", "/open", "main h1"],
  ["manage", "/manage", "main h1"],
  ["madang", "/madang/1", ".campaign-overview"],
  ["docs", "/docs", ".docs-page h1"],
  ["deck", "/deck", ".deck-cover"],
  ["team", "/team", ".profile-sheet"],
  ["gasok", "/gasok", ".gasok-grid"],
];
const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  args: ["--disable-gpu", "--disable-software-rasterizer"],
});
try {
  for (const [viewportName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    for (const [routeName, route, readySelector] of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw new Error(`${route} returned ${response?.status() ?? "no response"}`);
      await page.locator(readySelector).waitFor({ state: "visible" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
      });
      await page.screenshot({
        path: resolve(outputDir, `${viewportName}-${routeName}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Captured ${routes.length * viewports.length} route screenshots in tmp/qa-web`);
