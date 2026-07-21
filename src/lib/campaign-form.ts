export const TITLE_MAX_BYTES = 80;
export const DETAILS_MAX_BYTES = 280;
export const CAPACITY_MAX = 10_000;

export function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export type CampaignDraft = {
  title: string;
  details: string;
  capacity: number;
  startsAt: string;
  endsAt: string;
};

export function validateCampaignDraft(draft: CampaignDraft, nowMs = Date.now()) {
  const titleBytes = utf8ByteLength(draft.title.trim());
  if (titleBytes === 0 || titleBytes > TITLE_MAX_BYTES) {
    return `마당 이름은 UTF-8 기준 1~${TITLE_MAX_BYTES}바이트여야 합니다.`;
  }
  if (utf8ByteLength(draft.details.trim()) > DETAILS_MAX_BYTES) {
    return `안내문은 UTF-8 기준 ${DETAILS_MAX_BYTES}바이트 이하여야 합니다.`;
  }
  if (
    !Number.isInteger(draft.capacity) ||
    draft.capacity < 1 ||
    draft.capacity > CAPACITY_MAX
  ) {
    return `정원은 1~${CAPACITY_MAX.toLocaleString("ko-KR")} 사이의 정수여야 합니다.`;
  }

  const startsAtMs = new Date(draft.startsAt).getTime();
  const endsAtMs = new Date(draft.endsAt).getTime();
  if (!Number.isFinite(startsAtMs) || !Number.isFinite(endsAtMs)) {
    return "시작과 종료 시각을 모두 입력해 주세요.";
  }
  if (endsAtMs <= startsAtMs) return "종료 시각은 시작 시각 이후여야 합니다.";
  if (endsAtMs <= nowMs) return "종료 시각은 현재 이후여야 합니다.";
  return undefined;
}
