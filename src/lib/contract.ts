import {
  decodeEventLog,
  getAddress,
  isAddress,
  type Address,
  type Hex,
} from "viem";

import { wadangRelease } from "./release";

const configuredAddress =
  process.env.NEXT_PUBLIC_WADANG_CONTRACT_ADDRESS ||
  wadangRelease.contractAddress;

if (!isAddress(configuredAddress)) {
  throw new Error("NEXT_PUBLIC_WADANG_CONTRACT_ADDRESS must be a valid address");
}

export const wadangAddress: Address = getAddress(configuredAddress);

export const officialVerifierAddress = getAddress(
  "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
);

export const attesterCandidates = {
  upbitKorea:
    "0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034",
  testnetFaucet:
    "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678",
} as const;

export const playgroundUrl =
  "https://docs.giwa.io/giwa-chain/en/get-started/giwa-playground";

const errors = [
  "InvalidVerifier",
  "EmptyTitle",
  "TitleTooLong",
  "DetailsTooLong",
  "InvalidWindow",
  "InvalidCapacity",
  "CampaignNotFound",
  "CampaignCanceled",
  "CampaignNotStarted",
  "CampaignEnded",
  "CampaignFull",
  "AlreadyClaimed",
  "NotVerified",
  "NotOrganizer",
].map((name) => ({ type: "error" as const, name, inputs: [] }));

export const wadangAbi = [
  ...errors,
  {
    type: "event",
    name: "CampaignCreated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "campaignId", type: "uint256" },
      { indexed: true, name: "organizer", type: "address" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "startsAt", type: "uint64" },
      { indexed: false, name: "endsAt", type: "uint64" },
      { indexed: false, name: "capacity", type: "uint32" },
    ],
  },
  {
    type: "event",
    name: "CampaignClaimed",
    anonymous: false,
    inputs: [
      { indexed: true, name: "campaignId", type: "uint256" },
      { indexed: true, name: "account", type: "address" },
    ],
  },
  {
    type: "event",
    name: "CampaignCanceledByOrganizer",
    anonymous: false,
    inputs: [
      { indexed: true, name: "campaignId", type: "uint256" },
      { indexed: true, name: "organizer", type: "address" },
    ],
  },
  {
    type: "function",
    name: "campaignCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "verifier",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "attesterId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "getCampaign",
    stateMutability: "view",
    inputs: [{ name: "campaignId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "organizer", type: "address" },
          { name: "title", type: "string" },
          { name: "details", type: "string" },
          { name: "startsAt", type: "uint64" },
          { name: "endsAt", type: "uint64" },
          { name: "capacity", type: "uint32" },
          { name: "claimCount", type: "uint32" },
          { name: "canceled", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasClaimed",
    stateMutability: "view",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "claimed", type: "bool" }],
  },
  {
    type: "function",
    name: "isEligible",
    stateMutability: "view",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "createCampaign",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "details", type: "string" },
      { name: "startsAt", type: "uint64" },
      { name: "endsAt", type: "uint64" },
      { name: "capacity", type: "uint32" },
    ],
    outputs: [{ name: "campaignId", type: "uint256" }],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "campaignId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelCampaign",
    stateMutability: "nonpayable",
    inputs: [{ name: "campaignId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const verifierAbi = [
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "attesterId", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type Campaign = {
  organizer: Address;
  title: string;
  details: string;
  startsAt: bigint;
  endsAt: bigint;
  capacity: number;
  claimCount: number;
  canceled: boolean;
};

type ReceiptLog = { data: Hex; topics: readonly unknown[] };

export function getCreatedCampaignId(logs: readonly ReceiptLog[]) {
  for (const log of logs) {
    try {
      const topics = log.topics.filter(
        (topic): topic is Hex => typeof topic === "string" && topic.startsWith("0x"),
      );
      if (topics.length === 0) continue;
      const decoded = decodeEventLog({
        abi: wadangAbi,
        data: log.data,
        topics: topics as [Hex, ...Hex[]],
        strict: false,
      });
      if (
        decoded.eventName === "CampaignCreated" &&
        decoded.args &&
        "campaignId" in decoded.args
      ) {
        return decoded.args.campaignId as bigint;
      }
    } catch {
      // A receipt may contain unrelated logs. Only WADANG creation logs matter here.
    }
  }
  return undefined;
}
