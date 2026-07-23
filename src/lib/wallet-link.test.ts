import { describe, expect, it } from "vitest";

import { getMetaMaskDappUrl, isMobileBrowser } from "./wallet-link";

describe("isMobileBrowser", () => {
  it.each([
    ["iPhone Safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)", 5],
    ["Android Chrome", "Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36", 5],
    ["iPadOS desktop mode", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15", 5],
  ])("detects %s", (_, userAgent, maxTouchPoints) => {
    expect(isMobileBrowser(userAgent, maxTouchPoints)).toBe(true);
  });

  it("does not treat desktop Chrome as mobile", () => {
    expect(
      isMobileBrowser(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0",
        0,
      ),
    ).toBe(false);
  });
});

describe("getMetaMaskDappUrl", () => {
  it("preserves the current dapp route without leaking search or hash state", () => {
    const source = new URL("https://wadang.jeonsavvy.workers.dev/madang/1?debug=true#claim");

    expect(getMetaMaskDappUrl(source)).toBe(
      "https://link.metamask.io/dapp/wadang.jeonsavvy.workers.dev/madang/1",
    );
  });

  it("rejects non-web URLs", () => {
    expect(() => getMetaMaskDappUrl(new URL("javascript:alert(1)"))).toThrow(TypeError);
  });
});
