import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { giwaSepolia } from "viem/chains";

export { giwaSepolia };

export const wagmiConfig = createConfig({
  chains: [giwaSepolia],
  connectors: [injected()],
  transports: {
    [giwaSepolia.id]: http(),
  },
  ssr: true,
});

export const explorerUrl = giwaSepolia.blockExplorers.default.url;
