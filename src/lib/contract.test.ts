import { describe, expect, it } from "vitest";
import { encodeAbiParameters, encodeEventTopics, zeroAddress, type Hex } from "viem";

import { getCreatedCampaignId, wadangAbi } from "./contract";

describe("getCreatedCampaignId", () => {
  it("extracts the share ID from CampaignCreated and ignores unrelated logs", () => {
    const topics = encodeEventTopics({
      abi: wadangAbi,
      eventName: "CampaignCreated",
      args: { campaignId: 7n, organizer: zeroAddress },
    });
    const data = encodeAbiParameters(
      [
        { type: "string" },
        { type: "uint64" },
        { type: "uint64" },
        { type: "uint32" },
      ],
      ["첫 마당", 10n, 20n, 100],
    );

    expect(
      getCreatedCampaignId([
        { data: "0x", topics: ["0xdeadbeef" as Hex] },
        { data, topics },
      ]),
    ).toBe(7n);
  });
});
