import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = resolve("tmp", "qa-web");
const routes = [
  ["home", "/"],
  ["open", "/open"],
  ["manage", "/manage"],
  ["madang", "/madang/1"],
  ["docs", "/docs"],
  ["deck", "/deck"],
  ["team", "/team"],
  ["gasok", "/gasok"],
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
    for (const [routeName, route] of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`${route} returned ${response?.status() ?? "no response"}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
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
