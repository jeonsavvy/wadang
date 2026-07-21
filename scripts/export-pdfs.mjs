import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.env.ARTIFACT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = resolve("public", "artifacts");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: "print", colorScheme: "light" });

  const artifacts = [
    {
      route: "/deck",
      readySelector: ".deck-cover",
      filename: "wadang-pitch-deck.pdf",
      options: { width: "13.333in", height: "7.5in", preferCSSPageSize: true },
    },
    {
      route: "/team",
      readySelector: ".profile-sheet",
      filename: "wadang-team-profile.pdf",
      options: { format: "A4", preferCSSPageSize: true },
    },
    {
      route: "/docs",
      readySelector: ".docs-page h1",
      filename: "wadang-technical-docs.pdf",
      options: {
        format: "A4",
        margin: { top: "14mm", right: "14mm", bottom: "14mm", left: "14mm" },
      },
    },
  ];

  for (const artifact of artifacts) {
    const response = await page.goto(`${baseUrl}${artifact.route}`, {
      waitUntil: "domcontentloaded",
    });
    if (!response?.ok()) {
      throw new Error(`${artifact.route} returned ${response?.status() ?? "no response"}`);
    }
    await page.locator(artifact.readySelector).waitFor({ state: "visible" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    });
    await page.pdf({
      path: resolve(outputDir, artifact.filename),
      printBackground: true,
      ...artifact.options,
    });
    console.log(`Wrote public/artifacts/${artifact.filename}`);
  }
} finally {
  await browser.close();
}
