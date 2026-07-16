import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { configVariable, type HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatVerify, hardhatKeystore],
  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },
  networks: {
    giwaSepolia: {
      type: "http",
      chainType: "op",
      url: "https://sepolia-rpc.giwa.io",
      // Store with: pnpm hardhat keystore set GIWA_SEPOLIA_PRIVATE_KEY
      accounts: [configVariable("GIWA_SEPOLIA_PRIVATE_KEY")],
    },
  },
  chainDescriptors: {
    91342: {
      name: "GIWA Sepolia",
      blockExplorers: {
        blockscout: {
          name: "GIWA Sepolia Explorer",
          url: "https://sepolia-explorer.giwa.io",
          apiUrl: "https://sepolia-explorer.giwa.io/api",
        },
      },
    },
  },
};

export default config;
