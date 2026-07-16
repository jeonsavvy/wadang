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
    <section className="panel form-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">ONCHAIN RULES</span>
          <h2>마당 규칙</h2>
        </div>
        <span className="status-pill status-neutral">GIWA Sepolia · 자금 없음</span>
      </div>
      <div className="panel-body">
        {prerequisite && (
          <div className="notice">
            <CircleAlert size={19} />
            <div><strong>캠페인 생성 준비가 필요합니다</strong>{prerequisite}</div>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="field field-full">
              <label htmlFor="title">캠페인 이름 <span>{utf8ByteLength(title)} / {TITLE_MAX_BYTES} bytes</span></label>
              <input id="title" name="title" onChange={(event) => setTitle(event.target.value)} placeholder="GIWA 커뮤니티 얼리 액세스" required value={title} />
            </div>
            <div className="field field-full">
              <label htmlFor="details">참여자 안내문 <span>{utf8ByteLength(details)} / {DETAILS_MAX_BYTES} bytes</span></label>
              <textarea id="details" name="details" onChange={(event) => setDetails(event.target.value)} placeholder="캠페인 대상과 참여 후 제공되는 안내 또는 혜택을 적어 주세요." value={details} />
            </div>
            <div className="field">
              <label htmlFor="startsAt">문 여는 시각 <span>내 기기 시간</span></label>
              <input id="startsAt" name="startsAt" onChange={(event) => setStartsAt(event.target.value)} type="datetime-local" value={startsAt} required />
            </div>
            <div className="field">
              <label htmlFor="endsAt">문 닫는 시각 <span>내 기기 시간</span></label>
              <input id="endsAt" name="endsAt" onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" value={endsAt} required />
            </div>
            <div className="field">
              <label htmlFor="capacity">최대 참여 수 <span>1–10,000</span></label>
              <input defaultValue="100" id="capacity" max="10000" min="1" name="capacity" type="number" required />
            </div>
            <div className="config-item">
              <span>운영자 지갑</span>
              <code>{address ?? "지갑을 연결해 주세요"}</code>
            </div>
          </div>

          <div className="form-actions">
            <p>생성된 캠페인은 삭제할 수 없습니다. 잘못 만든 경우 닫힘 상태로 변경할 수 있습니다.</p>
            <button className="button button-accent button-large" disabled={Boolean(prerequisite) || isPending || receipt.isLoading} type="submit">
              {isPending || receipt.isLoading ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}
              {isPending ? "지갑에서 확인" : receipt.isLoading ? "마당 기록 중" : "마당 열기"}
            </button>
          </div>
        </form>

        {visibleError && <div className="error-box" role="alert">{visibleError}</div>}
        {receipt.isSuccess && hash && (
          <div className="receipt-card" role="status">
            <WadangStamp label="MADANG OPEN" />
            <div>
              <strong>캠페인이 GIWA Sepolia에 기록되었습니다.</strong>
              {sharePath ? (
                <>
                  <p>공유 링크 <code>{sharePath}</code></p>
                  <div className="receipt-actions">
                    <Link className="button button-dark" href={sharePath}>공유 화면 열기 <ExternalLink size={14} /></Link>
                    <button className="button button-light" onClick={copyShareLink} type="button"><Copy size={14} />{copied ? "복사됨" : "링크 복사"}</button>
                  </div>
                </>
              ) : <p>트랜잭션은 확정됐지만 캠페인 ID를 읽지 못했습니다. 열린 마당에서 다시 확인해 주세요.</p>}
              <a className="text-link" href={`${explorerUrl}/tx/${hash}`} rel="noreferrer" target="_blank">Explorer 영수증 ↗</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
