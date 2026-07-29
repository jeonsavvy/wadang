import { expect, type Page, test } from "@playwright/test";

async function gotoReady(page: Page, path: string, ready: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBe(true);
  await expect(page.locator(ready)).toBeVisible();
}

async function installInjectedWallet(page: Page, chainId: string, rejectSwitch = false) {
  const address = "0x00000000000000000000000000000000000a5733";
  await page.addInitScript(
    ({ account, currentChainId, shouldRejectSwitch }) => {
      Object.defineProperty(window, "ethereum", {
        configurable: true,
        value: {
          on() {},
          removeListener() {},
          async request({ method }: { method: string }) {
            if (method === "eth_chainId") return currentChainId;
            if (method === "eth_accounts" || method === "eth_requestAccounts") return [account];
            if (method === "wallet_requestPermissions") {
              return [{
                caveats: [{ type: "restrictReturnedAccounts", value: [account] }],
                parentCapability: "eth_accounts",
              }];
            }
            if (method === "wallet_switchEthereumChain" && shouldRejectSwitch) {
              throw Object.assign(new Error("User rejected the request"), { code: 4001 });
            }
            return null;
          },
        },
      });
    },
    { account: address, currentChainId: chainId, shouldRejectSwitch: rejectSwitch },
  );
}

async function installMissingChainWallet(page: Page) {
  const address = "0x00000000000000000000000000000000000a5733";
  await page.addInitScript(
    ({ account }) => {
      let currentChainId = "0x1";

      Object.defineProperty(window, "ethereum", {
        configurable: true,
        value: {
          on() {},
          removeListener() {},
          async request({ method, params }: { method: string; params?: readonly unknown[] }) {
            if (method === "eth_chainId") return currentChainId;
            if (method === "eth_accounts" || method === "eth_requestAccounts") return [account];
            if (method === "wallet_requestPermissions") {
              return [{
                caveats: [{ type: "restrictReturnedAccounts", value: [account] }],
                parentCapability: "eth_accounts",
              }];
            }
            if (method === "wallet_switchEthereumChain") {
              throw Object.assign(new Error("Unrecognized chain"), { code: 4902 });
            }
            if (method === "wallet_addEthereumChain") {
              const parameter = params?.[0] as { chainId?: string } | undefined;
              Reflect.set(window, "__walletAddChainParameter", parameter);
              if (parameter?.chainId) currentChainId = parameter.chainId;
              return null;
            }
            return null;
          },
        },
      });
    },
    { account: address },
  );
}

test("desktop header keeps the existing primary navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await gotoReady(page, "/", ".hero");

  await expect(page.getByRole("navigation", { name: "주요 탐색", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "모바일 주요 탐색", exact: true })).toBeHidden();
});

test.describe("mobile navigation and accessibility polish", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile");
  });

  test("header exposes the three review paths with 44px targets", async ({ page }) => {
    await gotoReady(page, "/", ".hero");

    const navigation = page.getByRole("navigation", { name: "모바일 주요 탐색", exact: true });
    await expect(navigation).toBeVisible();
    await expect(page.getByRole("navigation", { name: "주요 탐색", exact: true })).toBeHidden();

    const expectedLinks = [
      ["제출자료", "/gasok"],
      ["기술문서", "/docs"],
      ["내 마당", "/manage"],
    ] as const;

    for (const [name, href] of expectedLinks) {
      const link = navigation.getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }

    expect((await page.locator(".wordmark").boundingBox())?.height).toBeGreaterThanOrEqual(44);
  });

  test("320px header keeps the brand and action separated", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await gotoReady(page, "/", ".hero");

    const header = page.locator(".site-header");
    const brandBox = await header.locator(".wordmark span").boundingBox();
    const actionBox = await header.getByRole("link", { name: "마당 열기", exact: true }).boundingBox();
    expect(brandBox).not.toBeNull();
    expect(actionBox).not.toBeNull();
    expect((brandBox?.x ?? 0) + (brandBox?.width ?? 0)).toBeLessThanOrEqual(actionBox?.x ?? 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test("320px product wallet recovery stays clear of the mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await installInjectedWallet(page, "0x1", true);
    await gotoReady(page, "/open", "main h1");

    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    const header = page.locator(".site-header");
    await header.getByRole("button", { name: "지갑 연결" }).click();
    const switchButton = header.getByRole("button", { name: "GIWA Sepolia 전환" });
    await expect(switchButton).toBeVisible({ timeout: 15_000 });

    const brandBox = await header.locator(".wordmark span").boundingBox();
    const actionBox = await switchButton.boundingBox();
    await expect(header.locator(".wordmark span")).toHaveCSS("white-space", "nowrap");
    expect((brandBox?.x ?? 0) + (brandBox?.width ?? 0)).toBeLessThanOrEqual(actionBox?.x ?? 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await switchButton.click();
    const feedback = header.locator(".wallet-feedback");
    await expect(feedback).toBeVisible();
    const feedbackBox = await feedback.boundingBox();
    const navigationBox = await header.getByRole("navigation", { name: "모바일 주요 탐색" }).boundingBox();
    expect(feedbackBox?.y ?? 0).toBeGreaterThanOrEqual(
      (navigationBox?.y ?? 0) + (navigationBox?.height ?? 0),
    );
  });

  test("wallet network setup receives both GIWA RPC endpoints", async ({ page }) => {
    await installMissingChainWallet(page);
    await gotoReady(page, "/open", "main h1");

    const header = page.locator(".site-header");
    await header.getByRole("button", { name: "지갑 연결" }).click();
    const switchButton = header.getByRole("button", { name: "GIWA Sepolia 전환" });
    await expect(switchButton).toBeVisible({ timeout: 15_000 });
    await switchButton.click();

    await expect
      .poll(() => page.evaluate(() => Reflect.get(window, "__walletAddChainParameter")))
      .toMatchObject({
        chainId: "0x164ce",
        rpcUrls: [
          "https://sepolia-rpc-flashblocks.giwa.io",
          "https://sepolia-rpc.giwa.io",
        ],
      });
  });

  test("deck download action stays on one line", async ({ page }) => {
    await gotoReady(page, "/deck", ".deck-cover");

    const download = page.getByRole("link", { name: "PDF 내려받기", exact: true });
    await expect(download).toBeVisible();
    await expect(download).toHaveCSS("white-space", "nowrap");
    expect((await download.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  });

  test("GASOK evidence links keep 44px touch targets", async ({ page }) => {
    await gotoReady(page, "/gasok", ".gasok-release");

    for (const link of await page.locator(".gasok-release").getByRole("link").all()) {
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test("docs navigation hides the native scrollbar and signals overflow", async ({ page }) => {
    await gotoReady(page, "/docs", ".docs-page h1");

    const nav = page.locator(".docs-nav");
    const scroller = page.locator(".docs-nav > div");
    const state = await scroller.evaluate((element) => ({
      clientWidth: element.clientWidth,
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
      scrollbarWidth: getComputedStyle(element).scrollbarWidth,
    }));

    expect(state.overflowX).toBe("auto");
    expect(state.scrollWidth).toBeGreaterThan(state.clientWidth);
    expect(state.scrollbarWidth).toBe("none");
    expect(await nav.evaluate((element) => getComputedStyle(element, "::after").content)).not.toBe("none");
    for (const link of await scroller.getByRole("link").all()) {
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("keyboard focus uses a high-contrast dual ring", async ({ page }) => {
    await gotoReady(page, "/", ".hero");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "본문으로 건너뛰기" });
    await expect(skipLink).toBeFocused();
    const style = await skipLink.evaluate((element) => ({
      boxShadow: getComputedStyle(element).boxShadow,
      outlineColor: getComputedStyle(element).outlineColor,
      outlineWidth: getComputedStyle(element).outlineWidth,
    }));

    expect(style.outlineWidth).toBe("3px");
    expect(style.outlineColor).toBe("rgb(251, 250, 245)");
    expect(style.boxShadow).toContain("rgb(119, 48, 37)");
  });
});
