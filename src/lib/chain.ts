import { fallback, http } from "viem";
import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { giwaSepolia as baseGiwaSepolia } from "viem/chains";

export const giwaRpcUrls = [
  "https://sepolia-rpc-flashblocks.giwa.io",
  ...baseGiwaSepolia.rpcUrls.default.http,
] as const;

export const giwaSepolia = {
  ...baseGiwaSepolia,
  rpcUrls: {
    ...baseGiwaSepolia.rpcUrls,
    default: { http: giwaRpcUrls },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [giwaSepolia],
  connectors: [injected()],
  transports: {
    [giwaSepolia.id]: fallback(
      giwaRpcUrls.map((url) => http(url, { timeout: 5_000 })),
      { retryCount: 0 },
    ),
  },
  ssr: true,
});

export const explorerUrl = giwaSepolia.blockExplorers.default.url;
