"use client";

import {
  CircleAlert,
  Copy,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { WadangStamp } from "@/components/wadang-mark";
import { explorerUrl, giwaSepolia } from "@/lib/chain";
import {
  DETAILS_MAX_BYTES,
  TITLE_MAX_BYTES,
  utf8ByteLength,
  validateCampaignDraft,
} from "@/lib/campaign-form";
import { formatContractError } from "@/lib/campaign-state";
import { getCreatedCampaignId, wadangAbi, wadangAddress } from "@/lib/contract";

function localInputValue(offsetHours: number) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function OpenMadangForm() {
  const { address, chainId, isConnected } = useAccount();
  const [formError, setFormError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startsAt, setStartsAt] = useState(() => localInputValue(0));
  const [endsAt, setEndsAt] = useState(() => localInputValue(72));
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const prerequisite = useMemo(() => {
    if (!wadangAddress) return "WADANG 테스트넷 컨트랙트 주소를 설정해야 캠페인을 만들 수 있습니다.";
    if (!isConnected) return "먼저 운영자 지갑을 연결해 주세요.";
    if (chainId !== giwaSepolia.id) return "지갑 네트워크를 GIWA Sepolia로 전환해 주세요.";
    return undefined;
  }, [chainId, isConnected]);

  const createdId = receipt.data ? getCreatedCampaignId(receipt.data.logs) : undefined;
  const sharePath = createdId ? `/madang/${createdId}` : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    setCopied(false);
    if (!wadangAddress || prerequisite) return;

    const form = new FormData(event.currentTarget);
    const capacity = Number(form.get("capacity"));
    const validationError = validateCampaignDraft({
      title,
      details,
      capacity,
      startsAt,
      endsAt,
    });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    writeContract({
      address: wadangAddress,
      abi: wadangAbi,
      functionName: "createCampaign",
      args: [
        title.trim(),
        details.trim(),
        BigInt(Math.floor(new Date(startsAt).getTime() / 1000)),
        BigInt(Math.floor(new Date(endsAt).getTime() / 1000)),
        capacity,
      ],
    });
  }

  async function copyShareLink() {
    if (!sharePath) return;
    await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
    setCopied(true);
  }

  const visibleError = formError ?? (error ? formatContractError(error) : undefined);

  return (
    <section>
      <div className="create-layout">
        <form autoComplete="off" className="form-surface" onSubmit={onSubmit}>
          {prerequisite && (
            <div className="notice">
              <CircleAlert size={19} />
              <div><strong>생성 전 확인</strong>{prerequisite}</div>
            </div>
          )}

          <section className="form-block">
            <header><span>01</span><div><h2>기본 정보</h2><p>공유 화면에 표시할 이름과 참여 안내문입니다.</p></div></header>
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="title">캠페인 이름 <span>UTF-8 {utf8ByteLength(title)} / {TITLE_MAX_BYTES}</span></label>
                <input id="title" name="title" onChange={(event) => setTitle(event.target.value)} placeholder="예: GIWA 커뮤니티 얼리 액세스…" required value={title} />
              </div>
              <div className="field field-full">
                <label htmlFor="details">참여자 안내문 <span>UTF-8 {utf8ByteLength(details)} / {DETAILS_MAX_BYTES}</span></label>
                <textarea id="details" name="details" onChange={(event) => setDetails(event.target.value)} placeholder="예: 참여 대상과 입장 후 확인할 내용을 적어 주세요…" value={details} />
              </div>
            </div>
          </section>

          <section className="form-block">
            <header><span>02</span><div><h2>기간과 정원</h2><p>시작 시각은 포함하고 종료 시각부터 입장을 닫습니다.</p></div></header>
            <div className="form-grid schedule-grid">
              <div className="field">
                <label htmlFor="startsAt">시작 시각 <span>내 기기 시간</span></label>
                <input id="startsAt" name="startsAt" onChange={(event) => setStartsAt(event.target.value)} type="datetime-local" value={startsAt} required />
              </div>
              <div className="field">
                <label htmlFor="endsAt">종료 시각 <span>내 기기 시간</span></label>
                <input id="endsAt" name="endsAt" onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" value={endsAt} required />
              </div>
              <div className="field">
                <label htmlFor="capacity">최대 참여 수 <span>1~10,000</span></label>
                <input defaultValue="100" id="capacity" max="10000" min="1" name="capacity" type="number" required />
              </div>
            </div>
          </section>

          {visibleError && <div className="error-box" role="alert">{visibleError}</div>}

          <div className="form-actions">
            <p><strong>생성 후 삭제할 수 없습니다.</strong> 입력을 잘못한 경우 운영자 지갑으로 마당을 닫을 수 있습니다.</p>
            <button className="button button-accent button-large" disabled={Boolean(prerequisite) || isPending || receipt.isLoading} type="submit">
              {isPending || receipt.isLoading ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}
              {isPending ? "지갑에서 확인" : receipt.isLoading ? "GIWA에 기록 중" : "마당 만들기"}
            </button>
          </div>
        </form>

        <aside className="creation-summary">
          <div><span className="product-kicker">온체인 확인</span><h2>이번 마당의 조건</h2></div>
          <dl>
            <div><dt>네트워크</dt><dd>{chainId === giwaSepolia.id ? "GIWA Sepolia" : isConnected ? "전환 필요" : "지갑 미연결"}</dd></div>
            <div><dt>운영자</dt><dd><code>{address ?? "연결 전"}</code></dd></div>
            <div><dt>참여 제한</dt><dd>지갑당 한 번</dd></div>
            <div><dt>인증 기준</dt><dd>Dojang 테스트 인증</dd></div>
            <div><dt>토큰·자금</dt><dd>전송 없음</dd></div>
          </dl>
          <p>캠페인 정보와 참여 기록은 공개 컨트랙트에서 누구나 확인할 수 있습니다.</p>
        </aside>
      </div>

      {receipt.isSuccess && hash && (
        <div className="receipt-card create-receipt" role="status">
          <WadangStamp label="MADANG OPEN" />
          <div>
            <strong>마당이 GIWA Sepolia에 기록되었습니다.</strong>
            {sharePath ? (
              <>
                <p>공유 링크 <code>{sharePath}</code></p>
                <div className="receipt-actions">
                  <Link className="button button-dark" href={sharePath}>공유 화면 열기 <ExternalLink size={14} /></Link>
                  <button className="button button-light" onClick={copyShareLink} type="button"><Copy size={14} />{copied ? "복사됨" : "링크 복사"}</button>
                </div>
              </>
            ) : <p>트랜잭션은 확정됐지만 캠페인 ID를 읽지 못했습니다. 내 마당에서 다시 확인해 주세요.</p>}
            <a className="text-link" href={`${explorerUrl}/tx/${hash}`} rel="noreferrer" target="_blank">Explorer 영수증 ↗</a>
          </div>
        </div>
      )}
    </section>
  );
}
