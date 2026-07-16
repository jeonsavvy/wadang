import { mkdir, writeFile } from "node:fs/promises";

import { network } from "hardhat";
import {
  BaseError,
  ContractFunctionRevertedError,
  decodeEventLog,
  getAddress,
  isAddress,
  type Address,
} from "viem";

import { wadangAbi } from "../src/lib/contract.js";

const contractInput = process.env.WADANG_CONTRACT_ADDRESS ?? "";
const expectedInput = process.env.EXPECTED_DEPLOYER_ADDRESS ?? "";
if (!isAddress(contractInput)) throw new Error("WADANG_CONTRACT_ADDRESS is required");
if (!isAddress(expectedInput)) throw new Error("EXPECTED_DEPLOYER_ADDRESS is required");

const contractAddress = getAddress(contractInput);
const expectedDeployer = getAddress(expectedInput);
const unverifiedCaller = getAddress("0x000000000000000000000000000000000000dEaD");

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const [wallet] = await viem.getWalletClients();
if (!wallet) throw new Error("No configured deployment wallet");
if (getAddress(wallet.account.address) !== expectedDeployer) {
  throw new Error(`Configured deployer mismatch: expected ${expectedDeployer}, got ${wallet.account.address}`);
}

function revertName(error: unknown) {
  if (error instanceof BaseError) {
    const reverted = error.walk(
      (candidate) => candidate instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      return reverted.data?.errorName ?? reverted.shortMessage;
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : String(error);
}

async function expectSimulationRevert(
  functionName: "claim" | "cancelCampaign",
  campaignId: bigint,
  account: Address,
) {
  try {
    await publicClient.simulateContract({
      address: contractAddress,
      abi: wadangAbi,
      functionName,
      args: [campaignId],
      account,
    });
  } catch (error) {
    return revertName(error);
  }
  throw new Error(`${functionName} simulation unexpectedly succeeded for ${account}`);
}

async function createCampaign(title: string, details: string) {
  const block = await publicClient.getBlock();
  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "createCampaign",
    args: [title, details, block.timestamp, block.timestamp + 604_800n, 100],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  let campaignId: bigint | undefined;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: wadangAbi,
        data: log.data,
        topics: log.topics,
        strict: true,
      });
      if (decoded.eventName === "CampaignCreated") {
        campaignId = decoded.args.campaignId;
        break;
      }
    } catch {
      // Ignore logs emitted by other contracts in the receipt.
    }
  }
  if (campaignId === undefined) throw new Error("CampaignCreated event not found");
  return { campaignId, hash, blockNumber: receipt.blockNumber };
}

const first = await createCampaign(
  "WADANG 테스트넷 입장",
  "Playground 테스트 인증 지갑의 참여와 접근 자격을 검증합니다.",
);

const unverifiedClaim = await expectSimulationRevert(
  "claim",
  first.campaignId,
  unverifiedCaller,
);
if (unverifiedClaim !== "NotVerified") {
  throw new Error(`Expected NotVerified simulation, got ${unverifiedClaim}`);
}

const claimHash = await wallet.writeContract({
  address: contractAddress,
  abi: wadangAbi,
  functionName: "claim",
  args: [first.campaignId],
});
const claimReceipt = await publicClient.waitForTransactionReceipt({ hash: claimHash });
const eligible = await publicClient.readContract({
  address: contractAddress,
  abi: wadangAbi,
  functionName: "isEligible",
  args: [first.campaignId, expectedDeployer],
});
if (!eligible) throw new Error("Expected isEligible to return true after claim");

const duplicateClaim = await expectSimulationRevert(
  "claim",
  first.campaignId,
  expectedDeployer,
);
if (duplicateClaim !== "AlreadyClaimed") {
  throw new Error(`Expected AlreadyClaimed simulation, got ${duplicateClaim}`);
}

const second = await createCampaign(
  "WADANG 닫기 검증",
  "운영자 권한과 취소 이후 상태를 확인합니다.",
);
const unauthorizedCancel = await expectSimulationRevert(
  "cancelCampaign",
  second.campaignId,
  unverifiedCaller,
);
if (unauthorizedCancel !== "NotOrganizer") {
  throw new Error(`Expected NotOrganizer simulation, got ${unauthorizedCancel}`);
}

const cancelHash = await wallet.writeContract({
  address: contractAddress,
  abi: wadangAbi,
  functionName: "cancelCampaign",
  args: [second.campaignId],
});
const cancelReceipt = await publicClient.waitForTransactionReceipt({ hash: cancelHash });

const evidence = {
  generatedAt: new Date().toISOString(),
  chainId: await publicClient.getChainId(),
  contractAddress,
  account: expectedDeployer,
  transactions: {
    createCampaign1: {
      campaignId: first.campaignId.toString(),
      hash: first.hash,
      blockNumber: first.blockNumber.toString(),
    },
    claimCampaign1: {
      hash: claimHash,
      blockNumber: claimReceipt.blockNumber.toString(),
      isEligible: eligible,
    },
    createCampaign2: {
      campaignId: second.campaignId.toString(),
      hash: second.hash,
      blockNumber: second.blockNumber.toString(),
    },
    cancelCampaign2: {
      hash: cancelHash,
      blockNumber: cancelReceipt.blockNumber.toString(),
    },
  },
  simulations: {
    unverifiedClaim: { account: unverifiedCaller, result: unverifiedClaim },
    duplicateClaim: { account: expectedDeployer, result: duplicateClaim },
    unauthorizedCancel: { account: unverifiedCaller, result: unauthorizedCancel },
  },
} satisfies Record<string, unknown>;

await mkdir("tmp", { recursive: true });
await writeFile("tmp/testnet-evidence.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
