import { describe, expect, it } from "vitest";
import { encodeAbiParameters, encodeEventTopics } from "viem";

import {
  formatContractError,
  formatDate,
  getCreatedCampaignIdFromReceipt,
  getCampaignPhase,
  getParticipationStep,
  hasClaimedForCurrentAccount,
  hasCampaignCanceledEvent,
  hasCampaignClaimedEvent,
  isAllowedTransactionReplacement,
  isMutationForCurrentAccount,
  isRejectedReplacementForHash,
  isReceiptForCurrentAccount,
} from "./campaign-state";
import { wadangAbi } from "./contract";

const alice = "0x1111111111111111111111111111111111111111" as const;
const bob = "0x2222222222222222222222222222222222222222" as const;
const wadang = "0x3333333333333333333333333333333333333333" as const;

const campaign = {
  startsAt: 100n,
  endsAt: 200n,
  capacity: 10,
  claimCount: 0,
  canceled: false,
};

describe("getCampaignPhase", () => {
  it("keeps cancellation dominant", () => {
    expect(getCampaignPhase({ ...campaign, canceled: true }, 150n)).toBe("canceled");
  });

  it("classifies boundaries without a one-second gap", () => {
    expect(getCampaignPhase(campaign, 99n)).toBe("upcoming");
    expect(getCampaignPhase(campaign, 100n)).toBe("active");
    expect(getCampaignPhase(campaign, 199n)).toBe("active");
    expect(getCampaignPhase(campaign, 200n)).toBe("ended");
  });

  it("marks an otherwise active campaign as full", () => {
    expect(getCampaignPhase({ ...campaign, claimCount: 10 }, 150n)).toBe("full");
  });
});

describe("formatDate", () => {
  it("returns a stable fallback for uint64 timestamps outside the JS Date range", () => {
    expect(formatDate((1n << 64n) - 1n)).toBe("표시 범위 밖의 시각");
  });
});

describe("formatContractError", () => {
  it("turns known contract and wallet failures into recovery copy", () => {
    expect(formatContractError(new Error("execution reverted: NotVerified"))).toContain(
      "Dojang 인증",
    );
    expect(formatContractError(new Error("User rejected the request"))).toContain(
      "거절",
    );
    expect(formatContractError(new Error("execution reverted: InvalidWindow"))).toContain(
      "기간",
    );
    expect(formatContractError(new Error("Transaction replaced"))).toContain(
      "원래 요청",
    );
    expect(formatContractError(new Error("Transaction result mismatch"))).toContain(
      "완료 기록",
    );
    expect(formatContractError(new Error("Failed to fetch"))).toContain("RPC");
  });
});

describe("getParticipationStep", () => {
  it("keeps wallet, network, campaign, verification, and receipt precedence explicit", () => {
    expect(getParticipationStep({ isConnected: false, onGiwaSepolia: false, phase: "active", hasClaimed: false })).toBe("connect");
    expect(getParticipationStep({ isConnected: true, onGiwaSepolia: false, phase: "active", hasClaimed: false })).toBe("switch-network");
    expect(getParticipationStep({ isConnected: true, onGiwaSepolia: true, phase: "ended", isVerified: true, hasClaimed: false })).toBe("unavailable");
    expect(getParticipationStep({ isConnected: true, onGiwaSepolia: true, phase: "active", isVerified: false, hasClaimed: false })).toBe("verify");
    expect(getParticipationStep({ isConnected: true, onGiwaSepolia: true, phase: "active", isVerified: true, hasClaimed: false })).toBe("claim");
    expect(getParticipationStep({ isConnected: true, onGiwaSepolia: true, phase: "ended", isVerified: false, hasClaimed: true })).toBe("receipt");
  });
});

describe("receipt account ownership", () => {
  it("accepts a successful receipt only for the current account", () => {
    expect(isReceiptForCurrentAccount(alice, alice)).toBe(true);
    expect(hasClaimedForCurrentAccount({
      onchainClaimed: false,
      currentAccount: alice,
      receiptFrom: alice,
    })).toBe(true);
  });

  it("does not carry an optimistic receipt to a different or disconnected account", () => {
    expect(isReceiptForCurrentAccount(bob, alice)).toBe(false);
    expect(isReceiptForCurrentAccount(undefined, alice)).toBe(false);
    expect(hasClaimedForCurrentAccount({
      onchainClaimed: false,
      currentAccount: bob,
      receiptFrom: alice,
    })).toBe(false);
  });

  it("does not expose a mutation after an account switch, disconnect, or reset", () => {
    expect(isMutationForCurrentAccount(bob, alice)).toBe(false);
    expect(isMutationForCurrentAccount(undefined, alice)).toBe(false);
    expect(isMutationForCurrentAccount(alice, undefined)).toBe(false);
  });

  it("keeps an on-chain claim authoritative regardless of receipt ownership", () => {
    expect(hasClaimedForCurrentAccount({
      onchainClaimed: true,
      currentAccount: bob,
      receiptFrom: alice,
    })).toBe(true);
  });
});

describe("receipt mutation evidence", () => {
  const createdLog = {
    address: wadang,
    topics: encodeEventTopics({
      abi: wadangAbi,
      eventName: "CampaignCreated",
      args: { campaignId: 7n, organizer: alice },
    }),
    data: encodeAbiParameters(
      [
        { type: "string" },
        { type: "uint64" },
        { type: "uint64" },
        { type: "uint32" },
      ],
      ["첫 마당", 10n, 20n, 100],
    ),
  };
  const claimedLog = {
    address: wadang,
    topics: encodeEventTopics({
      abi: wadangAbi,
      eventName: "CampaignClaimed",
      args: { campaignId: 7n, account: alice },
    }),
    data: "0x" as const,
  };
  const canceledLog = {
    address: wadang,
    topics: encodeEventTopics({
      abi: wadangAbi,
      eventName: "CampaignCanceledByOrganizer",
      args: { campaignId: 7n, organizer: alice },
    }),
    data: "0x" as const,
  };

  it("accepts only exact WADANG events for the expected mutation", () => {
    expect(getCreatedCampaignIdFromReceipt({
      logs: [createdLog],
      contractAddress: wadang,
      organizer: alice,
    })).toBe(7n);
    expect(hasCampaignClaimedEvent({
      logs: [claimedLog],
      contractAddress: wadang,
      campaignId: 7n,
      account: alice,
    })).toBe(true);
    expect(hasCampaignCanceledEvent({
      logs: [canceledLog],
      contractAddress: wadang,
      campaignId: 7n,
      organizer: alice,
    })).toBe(true);
  });

  it("rejects matching topics from another contract or mutation owner", () => {
    expect(getCreatedCampaignIdFromReceipt({
      logs: [{ ...createdLog, address: bob }],
      contractAddress: wadang,
      organizer: alice,
    })).toBeUndefined();
    expect(hasCampaignClaimedEvent({
      logs: [claimedLog],
      contractAddress: wadang,
      campaignId: 7n,
      account: bob,
    })).toBe(false);
    expect(hasCampaignCanceledEvent({
      logs: [canceledLog],
      contractAddress: wadang,
      campaignId: 8n,
      organizer: alice,
    })).toBe(false);
  });

  it("allows identical-call repricing but rejects cancellation and replacement", () => {
    expect(isAllowedTransactionReplacement("repriced")).toBe(true);
    expect(isAllowedTransactionReplacement("cancelled")).toBe(false);
    expect(isAllowedTransactionReplacement("replaced")).toBe(false);
  });

  it("keeps a late replacement callback scoped to its original hash", () => {
    const firstHash = `0x${"1".repeat(64)}` as const;
    const nextHash = `0x${"2".repeat(64)}` as const;

    expect(isRejectedReplacementForHash(firstHash, firstHash)).toBe(true);
    expect(isRejectedReplacementForHash(nextHash, firstHash)).toBe(false);
    expect(isRejectedReplacementForHash(undefined, firstHash)).toBe(false);
  });
});
