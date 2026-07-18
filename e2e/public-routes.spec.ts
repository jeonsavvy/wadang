import { expect, test } from "@playwright/test";

const routes = ["/", "/open", "/manage", "/madang/1", "/docs", "/deck", "/team", "/gasok"];

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test.describe("product states", () => {
  test("wallet-disconnected create state keeps the primary action blocked", async ({ page }) => {
    await page.goto("/open", { waitUntil: "networkidle" });

    await expect(page.getByText("지갑 미연결", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "마당 만들기" })).toBeDisabled();
    await expect(page.getByText("먼저 운영자 지갑을 연결해 주세요.")).toBeVisible();
  });

  test("invalid campaign id shows a specific recovery message", async ({ page }) => {
    await page.goto("/madang/not-a-number", { waitUntil: "networkidle" });
    await expect(page.getByText("유효한 양의 마당 ID가 아닙니다.")).toBeVisible();
  });

  test("campaign loading state is visible while RPC is pending", async ({ page }) => {
    await page.route("https://sepolia-rpc.giwa.io/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.abort();
    });

    await page.goto("/madang/1", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("마당 #1을 읽는 중…")).toBeVisible();
  });

  test("campaign RPC failure names the failed dependency", async ({ page }) => {
    await page.route("https://sepolia-rpc.giwa.io/**", (route) => route.abort());

    await page.goto("/madang/1", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("마당을 읽지 못했습니다. 공유 ID와 GIWA RPC 상태를 확인해 주세요.")).toBeVisible({ timeout: 20_000 });
  });

  test("long Korean form content does not create horizontal overflow", async ({ page }) => {
    await page.goto("/open", { waitUntil: "networkidle" });
    await page.getByLabel("캠페인 이름").fill("한글로 작성한 아주 긴 캠페인 이름과 줄바꿈 안전성 확인");
    await page.getByLabel("참여자 안내문").fill("Dojang 인증 지갑의 참여 조건과 종료 시각을 확인하는 긴 안내문입니다. ".repeat(8));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("reduced motion removes long transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    const transitionSeconds = await page.locator(".hero").evaluate((element) => {
      const value = getComputedStyle(element).transitionDuration.split(",")[0];
      return value.endsWith("ms") ? Number.parseFloat(value) / 1000 : Number.parseFloat(value);
    });
    expect(transitionSeconds).toBeLessThanOrEqual(0.001);
  });
});
