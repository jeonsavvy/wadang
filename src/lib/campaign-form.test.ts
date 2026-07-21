import { describe, expect, it } from "vitest";

import { utf8ByteLength, validateCampaignDraft } from "./campaign-form";

const validDraft = {
  title: "첫 마당",
  details: "Dojang 인증 지갑을 위한 얼리 액세스",
  capacity: 100,
  startsAt: "2026-07-20T10:00",
  endsAt: "2026-07-21T10:00",
};

describe("campaign form byte limits", () => {
  it("counts Korean text as UTF-8 bytes", () => {
    expect(utf8ByteLength("가".repeat(26))).toBe(78);
    expect(utf8ByteLength("가".repeat(27))).toBe(81);
  });

  it("accepts and rejects the contract's exact title boundary", () => {
    expect(validateCampaignDraft({ ...validDraft, title: "가".repeat(26) }, Date.UTC(2026, 6, 19))).toBeUndefined();
    expect(validateCampaignDraft({ ...validDraft, title: "가".repeat(27) }, Date.UTC(2026, 6, 19))).toContain("80바이트");
  });

  it("rejects invalid windows and capacity before the wallet prompt", () => {
    expect(validateCampaignDraft({ ...validDraft, capacity: 10_001 }, Date.UTC(2026, 6, 19))).toContain("10,000");
    expect(validateCampaignDraft({ ...validDraft, endsAt: validDraft.startsAt }, Date.UTC(2026, 6, 19))).toContain("이후여야");
  });
});
