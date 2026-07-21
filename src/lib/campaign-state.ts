import type { Campaign } from "./contract";

export type CampaignPhase =
  | "canceled"
  | "upcoming"
  | "active"
  | "full"
  | "ended";

export function getCampaignPhase(
  campaign: Pick<
    Campaign,
    "startsAt" | "endsAt" | "capacity" | "claimCount" | "canceled"
  >,
  nowSeconds: bigint,
): CampaignPhase {
  if (campaign.canceled) return "canceled";
  if (nowSeconds < campaign.startsAt) return "upcoming";
  if (nowSeconds >= campaign.endsAt) return "ended";
  if (campaign.claimCount >= campaign.capacity) return "full";
  return "active";
}

export const phaseLabels: Record<CampaignPhase, string> = {
  canceled: "닫힌 마당",
  upcoming: "시작 전",
  active: "입장 가능",
  full: "정원 마감",
  ended: "종료",
};

export type ParticipationStep =
  | "connect"
  | "switch-network"
  | "unavailable"
  | "verify"
  | "claim"
  | "receipt";

export function getParticipationStep(input: {
  isConnected: boolean;
  onGiwaSepolia: boolean;
  phase: CampaignPhase;
  isVerified?: boolean;
  hasClaimed: boolean;
}): ParticipationStep {
  if (!input.isConnected) return "connect";
  if (!input.onGiwaSepolia) return "switch-network";
  if (input.hasClaimed) return "receipt";
  if (input.phase !== "active") return "unavailable";
  if (input.isVerified !== true) return "verify";
  return "claim";
}

export function formatContractError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  const matches: Array<[string, string]> = [
    ["User rejected", "지갑에서 요청을 거절했습니다. 내용을 확인한 뒤 다시 시도해 주세요."],
    ["User denied", "지갑에서 요청을 거절했습니다. 내용을 확인한 뒤 다시 시도해 주세요."],
    ["NotVerified", "이 지갑의 Dojang 인증을 확인할 수 없습니다. Playground에서 인증 상태를 확인해 주세요."],
    ["AlreadyClaimed", "이미 이 마당에 참여한 지갑입니다. Explorer에서 기존 기록을 확인해 주세요."],
    ["CampaignNotStarted", "아직 입장할 수 없는 마당입니다. 시작 시각 이후 다시 시도해 주세요."],
    ["CampaignEnded", "이 마당의 참여 기간이 끝났습니다."],
    ["CampaignFull", "참여 정원이 모두 찼습니다."],
    ["CampaignCanceled", "운영자가 닫은 마당입니다."],
    ["NotOrganizer", "이 마당을 만든 운영자 지갑만 닫을 수 있습니다."],
    ["CampaignNotFound", "마당을 찾지 못했습니다. 공유 링크의 마당 ID를 확인해 주세요."],
    ["Failed to fetch", "GIWA RPC에 연결하지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요."],
    ["HTTP request failed", "GIWA RPC가 요청에 응답하지 않았습니다. 잠시 후 다시 시도해 주세요."],
  ];
  return matches.find(([needle]) => text.includes(needle))?.[1] ??
    "요청을 완료하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
}

export function formatDate(timestamp: bigint) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(Number(timestamp) * 1000));
}

export function shortenAddress(address: string, size = 5) {
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}
