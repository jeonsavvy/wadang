import { expect, type Page, test } from "@playwright/test";

const routes = [
  { path: "/", ready: ".hero" },
  { path: "/open", ready: "main h1" },
  { path: "/manage", ready: "main h1" },
  { path: "/madang/1", ready: ".campaign-detail-shell" },
  { path: "/docs", ready: ".docs-page h1" },
  { path: "/deck", ready: ".deck-cover" },
  { path: "/team", ready: ".profile-sheet" },
  { path: "/gasok", ready: ".gasok-grid" },
] as const;

async function gotoReady(page: Page, path: string, readySelector: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBe(true);
  await expect(page.locator(readySelector)).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

for (const route of routes) {
  test(`${route.path} renders without horizontal overflow`, async ({ page }) => {
    await gotoReady(page, route.path, route.ready);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("public pages defer wallet runtime until the product flow", async ({ page }) => {
  await gotoReady(page, "/", ".hero");
  await expect(page.getByRole("link", { name: "마당 열기", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "지갑 연결" })).toHaveCount(0);

  await gotoReady(page, "/open", "main h1");
  await expect(page.getByRole("button", { name: "지갑 연결" })).toBeVisible();
});

test("keyboard users can skip directly to page content", async ({ page }) => {
  await gotoReady(page, "/", ".hero");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "본문으로 건너뛰기" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test.describe("product states", () => {
  test("wallet-disconnected create state keeps the primary action blocked", async ({ page }) => {
    await gotoReady(page, "/open", "main h1");

    await expect(page.getByText("지갑 미연결", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "마당 만들기" })).toBeDisabled();
    await expect(page.getByText("먼저 운영자 지갑을 연결해 주세요.")).toBeVisible();
  });

  test("invalid campaign id shows a specific recovery message", async ({ page }) => {
    await gotoReady(page, "/madang/not-a-number", "main .error-box");
    await expect(page.getByText("유효한 양의 마당 ID가 아닙니다.")).toBeVisible();
  });

  test("campaign loading state is visible while RPC is pending", async ({ page }) => {
    await page.route("https://sepolia-rpc.giwa.io/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.abort();
    });

    await gotoReady(page, "/madang/1", ".campaign-detail-shell");
    await expect(page.getByText("마당 #1을 읽는 중…")).toBeVisible();
  });

  test("campaign RPC failure names the failed dependency", async ({ page }) => {
    await page.route("https://sepolia-rpc.giwa.io/**", (route) => route.abort());

    await gotoReady(page, "/madang/1", ".campaign-detail-shell");
    await expect(page.getByText("마당을 읽지 못했습니다. 공유 ID와 GIWA RPC 상태를 확인해 주세요.")).toBeVisible({ timeout: 20_000 });
  });

  test("long Korean form content does not create horizontal overflow", async ({ page }) => {
    await gotoReady(page, "/open", "main h1");
    await page.getByLabel("캠페인 이름").fill("한글로 작성한 아주 긴 캠페인 이름과 줄바꿈 안전성 확인");
    await page.getByLabel("참여자 안내문").fill("Dojang 인증 지갑의 참여 조건과 종료 시각을 확인하는 긴 안내문입니다. ".repeat(8));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("reduced motion removes long transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/", ".hero");

    const transitionSeconds = await page.locator(".hero").evaluate((element) => {
      const value = getComputedStyle(element).transitionDuration.split(",")[0];
      return value.endsWith("ms") ? Number.parseFloat(value) / 1000 : Number.parseFloat(value);
    });
    expect(transitionSeconds).toBeLessThanOrEqual(0.001);
  });
});
