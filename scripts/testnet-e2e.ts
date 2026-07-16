import { mkdir, writeFile } from "node:fs/promises";

import { network } from "hardhat";
import {
  BaseError,
  ContractFunctionRevertedError,
  decodeEventLog,
  getAddress,
  isAddress,
  type Address,
  type Hash,
} from "viem";

import { wadangAbi } from "../src/lib/contract.js";

const contractInput = process.env.WADANG_CONTRACT_ADDRESS ?? "";
const expectedInput = process.env.EXPECTED_DEPLOYER_ADDRESS ?? "";
if (!isAddress(contractInput)) throw new Error("WADANG_CONTRACT_ADDRESS is required");
if (!isAddress(expectedInput)) throw new Error("EXPECTED_DEPLOYER_ADDRESS is required");

const contractAddress = getAddress(contractInput);
const expectedDeployer = getAddress(expectedInput);
const unverifiedCaller = getAddress("0x000000000000000000000000000000000000dEaD");
const firstTitle = "WADANG 테스트넷 입장";
const secondTitle = "WADANG 닫기 검증";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const [wallet] = await viem.getWalletClients();
if (!wallet) throw new Error("No configured deployment wallet");
if (getAddress(wallet.account.address) !== expectedDeployer) {
  throw new Error(`Configured deployer mismatch: expected ${expectedDeployer}, got ${wallet.account.address}`);
}

type TransactionEvidence = {
  campaignId?: string;
  hash: Hash;
  blockNumber: string;
  isEligible?: boolean;
};

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor<T>(
  label: string,
  read: () => Promise<T>,
  accept: (value: T) => boolean,
) {
  let latest: T | undefined;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    latest = await read();
    if (accept(latest)) return latest;
    await sleep(2_000);
  }
  throw new Error(`${label} did not become consistent; latest=${String(latest)}`);
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

async function recentEvents(eventName: "CampaignCreated" | "CampaignClaimed" | "CampaignCanceledByOrganizer") {
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock > 10_000n ? latestBlock - 10_000n : 0n;
  return publicClient.getContractEvents({
    address: contractAddress,
    abi: wadangAbi,
    eventName,
    fromBlock,
    toBlock: "latest",
  });
}

async function existingTransaction(
  eventName: "CampaignCreated" | "CampaignClaimed" | "CampaignCanceledByOrganizer",
  campaignId: bigint,
) {
  const events = await recentEvents(eventName);
  const event = events.find((candidate) => candidate.args.campaignId === campaignId);
  if (!event?.transactionHash || event.blockNumber === null) {
    throw new Error(`${eventName} event not found for campaign ${campaignId}`);
  }
  return {
    hash: event.transactionHash,
    blockNumber: event.blockNumber.toString(),
  };
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
  await waitFor(
    `campaign ${campaignId} visibility`,
    () => publicClient.readContract({
      address: contractAddress,
      abi: wadangAbi,
      functionName: "campaignCount",
    }),
    (count) => count >= campaignId!,
  );
  return {
    campaignId,
    evidence: {
      campaignId: campaignId.toString(),
      hash,
      blockNumber: receipt.blockNumber.toString(),
    } satisfies TransactionEvidence,
  };
}

async function loadOrCreateCampaign(
  campaignId: bigint,
  title: string,
  details: string,
) {
  const count = await publicClient.readContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "campaignCount",
  });
  if (count < campaignId) return createCampaign(title, details);

  const campaign = await publicClient.readContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "getCampaign",
    args: [campaignId],
  });
  if (campaign.title !== title || getAddress(campaign.organizer) !== expectedDeployer) {
    throw new Error(`Existing campaign ${campaignId} does not match the evidence fixture`);
  }
  const transaction = await existingTransaction("CampaignCreated", campaignId);
  return {
    campaignId,
    evidence: { campaignId: campaignId.toString(), ...transaction } satisfies TransactionEvidence,
  };
}

const first = await loadOrCreateCampaign(
  1n,
  firstTitle,
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

let claimEvidence: TransactionEvidence;
const alreadyClaimed = await publicClient.readContract({
  address: contractAddress,
  abi: wadangAbi,
  functionName: "hasClaimed",
  args: [first.campaignId, expectedDeployer],
});
if (alreadyClaimed) {
  claimEvidence = await existingTransaction("CampaignClaimed", first.campaignId);
} else {
  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "claim",
    args: [first.campaignId],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  claimEvidence = { hash, blockNumber: receipt.blockNumber.toString() };
}

const eligible = await waitFor(
  "isEligible after claim",
  () => publicClient.readContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "isEligible",
    args: [first.campaignId, expectedDeployer],
  }),
  Boolean,
);
claimEvidence.isEligible = eligible;

const duplicateClaim = await expectSimulationRevert(
  "claim",
  first.campaignId,
  expectedDeployer,
);
if (duplicateClaim !== "AlreadyClaimed") {
  throw new Error(`Expected AlreadyClaimed simulation, got ${duplicateClaim}`);
}

const second = await loadOrCreateCampaign(
  2n,
  secondTitle,
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

let cancelEvidence: TransactionEvidence;
const secondCampaign = await publicClient.readContract({
  address: contractAddress,
  abi: wadangAbi,
  functionName: "getCampaign",
  args: [second.campaignId],
});
if (secondCampaign.canceled) {
  cancelEvidence = await existingTransaction("CampaignCanceledByOrganizer", second.campaignId);
} else {
  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: wadangAbi,
    functionName: "cancelCampaign",
    args: [second.campaignId],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  cancelEvidence = { hash, blockNumber: receipt.blockNumber.toString() };
  await waitFor(
    "campaign cancellation visibility",
    () => publicClient.readContract({
      address: contractAddress,
      abi: wadangAbi,
      functionName: "getCampaign",
      args: [second.campaignId],
    }),
    (campaign) => campaign.canceled,
  );
}

const evidence = {
  generatedAt: new Date().toISOString(),
  chainId: await publicClient.getChainId(),
  contractAddress,
  account: expectedDeployer,
  transactions: {
    createCampaign1: first.evidence,
    claimCampaign1: claimEvidence,
    createCampaign2: second.evidence,
    cancelCampaign2: cancelEvidence,
  },
  simulations: {
    unverifiedClaim: { account: unverifiedCaller, result: unverifiedClaim },
    duplicateClaim: { account: expectedDeployer, result: duplicateClaim },
    unauthorizedCancel: { account: unverifiedCaller, result: unauthorizedCancel },
  },
};

await mkdir("tmp", { recursive: true });
await writeFile("tmp/testnet-evidence.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
