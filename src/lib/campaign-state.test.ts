import { describe, expect, it } from "vitest";

import {
  formatContractError,
  getCampaignPhase,
  getParticipationStep,
  hasClaimedForCurrentAccount,
  isMutationForCurrentAccount,
  isReceiptForCurrentAccount,
} from "./campaign-state";

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

describe("formatContractError", () => {
  it("turns known contract and wallet failures into recovery copy", () => {
    expect(formatContractError(new Error("execution reverted: NotVerified"))).toContain(
      "Dojang 인증",
    );
    expect(formatContractError(new Error("User rejected the request"))).toContain(
      "거절",
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
  const alice = "0x1111111111111111111111111111111111111111" as const;
  const bob = "0x2222222222222222222222222222222222222222" as const;

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
