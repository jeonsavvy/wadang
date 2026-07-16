import { network } from "hardhat";
import { getAddress } from "viem";

const expected = process.env.EXPECTED_DEPLOYER_ADDRESS;
if (!expected) throw new Error("EXPECTED_DEPLOYER_ADDRESS is required");

const { viem } = await network.create();
const [wallet] = await viem.getWalletClients();
if (!wallet) throw new Error("No configured deployment wallet");

const actual = getAddress(wallet.account.address);
const normalizedExpected = getAddress(expected);
if (actual !== normalizedExpected) {
  throw new Error(`Configured deployer mismatch: expected ${normalizedExpected}, got ${actual}`);
}

console.log(`DEPLOYER_ADDRESS=${actual}`);
