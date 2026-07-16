import { describe, expect, it } from "vitest";

import {
  formatContractError,
  getCampaignPhase,
  getParticipationStep,
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
