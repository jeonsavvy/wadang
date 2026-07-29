import { describe, expect, it } from "vitest";

import { giwaRpcUrls, giwaSepolia, wagmiConfig } from "./chain";

describe("GIWA transport", () => {
  it("uses both official testnet endpoints for public reads", () => {
    expect(giwaRpcUrls).toEqual([
      "https://sepolia-rpc-flashblocks.giwa.io",
      "https://sepolia-rpc.giwa.io",
    ]);
    expect(giwaSepolia.rpcUrls.default.http).toEqual(giwaRpcUrls);
    expect(wagmiConfig.getClient({ chainId: giwaSepolia.id }).transport.type).toBe(
      "fallback",
    );
  });
});
