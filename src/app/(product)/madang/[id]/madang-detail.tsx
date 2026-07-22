"use client";

import {
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  ShieldQuestion,
  TicketCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { getAddress, isAddressEqual, zeroAddress, zeroHash } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { StatusPill } from "@/components/status-pill";
import { WadangStamp } from "@/components/wadang-mark";
import { explorerUrl, giwaSepolia } from "@/lib/chain";
import {
  formatContractError,
  formatDate,
  getCampaignPhase,
  getParticipationStep,
  phaseLabels,
  shortenAddress,
} from "@/lib/campaign-state";
import {
  type Campaign,
  officialVerifierAddress,
  playgroundUrl,
  verifierAbi,
  wadangAbi,
  wadangAddress,
} from "@/lib/contract";
import { useCurrentUnixTime } from "@/lib/use-current-unix-time";

const actionLabels = {
  connect: "지갑 연결 필요",
  "switch-network": "네트워크 전환 필요",
  unavailable: "현재 입장할 수 없음",
  verify: "Dojang 인증 필요",
  claim: "입장하기",
  receipt: "입장 완료",
} as const;

export function MadangDetail({ id }: { id: string }) {
  const now = useCurrentUnixTime();
  const campaignId = /^\d+$/.test(id) && BigInt(id) > 0n ? BigInt(id) : 0n;
  const safeAddress = wadangAddress ?? zeroAddress;
  const { address, chainId, isConnected } = useAccount();

  const campaignRead = useReadContract({
    address: safeAddress,
    abi: wadangAbi,
    functionName: "getCampaign",
    args: [campaignId],
    query: { enabled: Boolean(wadangAddress && campaignId) },
  });
  const verifierRead = useReadContract({
    address: safeAddress,
    abi: wadangAbi,
    functionName: "verifier",
    query: { enabled: Boolean(wadangAddress) },
  });
  const attesterRead = useReadContract({
    address: safeAddress,
    abi: wadangAbi,
    functionName: "attesterId",
    query: { enabled: Boolean(wadangAddress) },
  });
  const claimedRead = useReadContract({
    address: safeAddress,
    abi: wadangAbi,
    functionName: "hasClaimed",
    args: [campaignId, address ?? zeroAddress],
    query: { enabled: Boolean(wadangAddress && address && campaignId) },
  });
  const verificationRead = useReadContract({
    address: verifierRead.data ?? officialVerifierAddress,
    abi: verifierAbi,
    functionName: "isVerified",
    args: [address ?? zeroAddress, attesterRead.data ?? zeroHash],
    query: {
      enabled: Boolean(
        wadangAddress && address && verifierRead.data && attesterRead.data,
      ),
    },
  });
  const claimWrite = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimWrite.data });
  const cancelWrite = useWriteContract();
  const cancelReceipt = useWaitForTransactionReceipt({ hash: cancelWrite.data });
  const refetchClaimed = claimedRead.refetch;
  const refetchCampaign = campaignRead.refetch;

  useEffect(() => {
    if (claimReceipt.isSuccess) {
      void refetchClaimed();
      void refetchCampaign();
    }
  }, [claimReceipt.isSuccess, refetchCampaign, refetchClaimed]);

  useEffect(() => {
    if (cancelReceipt.isSuccess) void refetchCampaign();
  }, [cancelReceipt.isSuccess, refetchCampaign]);

  const campaign = campaignRead.data as Campaign | undefined;
  const phase = campaign ? getCampaignPhase(campaign, now) : undefined;
  const isOrganizer = Boolean(
    address && campaign && isAddressEqual(address, campaign.organizer),
  );
  const isVerified = verificationRead.data;
  const hasClaimed = claimedRead.data === true || claimReceipt.isSuccess;
  const step = phase
    ? getParticipationStep({
        isConnected,
        onGiwaSepolia: chainId === giwaSepolia.id,
        phase,
        isVerified,
        hasClaimed,
      })
    : "unavailable";
  const claimPending = claimWrite.isPending || claimReceipt.isLoading;

  function claim() {
    if (!wadangAddress || !campaignId || step !== "claim") return;
    claimWrite.writeContract({
      address: wadangAddress,
      abi: wadangAbi,
      functionName: "claim",
      args: [campaignId],
    });
  }

  function cancel() {
    if (!wadangAddress || !campaignId || !isOrganizer) return;
    cancelWrite.writeContract({
      address: wadangAddress,
      abi: wadangAbi,
      functionName: "cancelCampaign",
      args: [campaignId],
    });
  }

  if (campaignId === 0n) {
    return <main className="page-shell container"><div className="error-box">유효한 양의 마당 ID가 아닙니다.</div></main>;
  }

  return (
    <main className="page-shell container campaign-detail-shell">
      <div className="campaign-detail-content">
        {!wadangAddress && (
          <div className="notice preview-notice"><CircleAlert size={19} /><div><strong>테스트넷 배포 전</strong>WADANG 컨트랙트 주소가 설정되면 실제 캠페인 데이터를 표시합니다.</div></div>
        )}
        {campaignRead.isLoading && wadangAddress && <div className="empty-state"><LoaderCircle className="spin" />마당 #{id}을 읽는 중…</div>}
        {campaignRead.error && <div className="error-box">마당을 읽지 못했습니다. 링크의 마당 ID와 GIWA RPC 상태를 확인해 주세요.</div>}
        {campaign && (
          <>
          <section className="campaign-hero campaign-overview">
            <div className="campaign-overview-main">
              <div className="campaign-kicker">
                <span>마당 #{String(id).padStart(3, "0")}</span>
                {phase && <StatusPill tone={phase}>{phaseLabels[phase]}</StatusPill>}
              </div>
              <h1>{campaign.title}</h1>
              <p>{campaign.details || "운영자가 공개 안내문을 남기지 않았습니다."}</p>
              <dl className="campaign-meta">
                <div><dt>종료</dt><dd>{formatDate(campaign.endsAt)}</dd></div>
                <div><dt>운영자</dt><dd><code>{shortenAddress(getAddress(campaign.organizer), 7)}</code></dd></div>
              </dl>
            </div>
            <div className="claim-meter">
              <span>현재 참여</span>
              <strong>{campaign.claimCount}<small> / {campaign.capacity}</small></strong>
              <div><i style={{ width: `${Math.min(100, (campaign.claimCount / campaign.capacity) * 100)}%` }} /></div>
              <p>{Math.max(0, campaign.capacity - campaign.claimCount)}명 참여 가능</p>
              <div className="current-step"><small>내 상태</small><b>{actionLabels[step]}</b></div>
            </div>
          </section>

          <section className="claim-grid">
            <div className="panel claim-panel">
              <div className="panel-head"><div><span className="product-kicker">참여 조건</span><h2>도장 확인</h2></div><ShieldQuestion size={22} /></div>
              <div className="panel-body">
                <div className="check-list">
                  <CheckRow ok={isConnected} label="지갑" detail={address ? shortenAddress(address, 7) : "미연결"} />
                  <CheckRow ok={chainId === giwaSepolia.id} label="네트워크" detail={chainId === giwaSepolia.id ? "GIWA Sepolia · 91342" : isConnected ? "GIWA Sepolia로 전환 필요" : "지갑 연결 후 확인"} />
                  <CheckRow ok={isVerified === true} pending={isConnected && verificationRead.isLoading} label="Dojang" detail={isVerified ? "테스트 인증됨" : isConnected ? "인증을 확인하지 못함" : "지갑 연결 후 조회"} />
                  <CheckRow ok={hasClaimed} label="참여" detail={hasClaimed ? "입장 기록 있음" : "참여 전"} neutral={!hasClaimed} />
                </div>

                {verificationRead.error && <div className="error-box">Dojang 상태를 읽지 못했습니다. 네트워크 연결을 확인한 뒤 다시 조회해 주세요.</div>}
                {isVerified === false && (
                  <div className="error-box">이 지갑의 테스트 인증을 찾지 못했습니다. <a href={playgroundUrl} rel="noreferrer" target="_blank">GIWA Playground 확인 <ExternalLink size={12} /></a></div>
                )}
                {hasClaimed && !claimReceipt.isSuccess && <div className="notice compact-notice"><CircleAlert size={17} /><div><strong>이미 입장한 지갑입니다</strong>Explorer에서 기존 참여 기록을 확인할 수 있습니다.</div></div>}
                {(claimWrite.error || claimReceipt.error) && <div className="error-box" role="alert">{formatContractError(claimWrite.error ?? claimReceipt.error)}</div>}
                {claimReceipt.isSuccess && claimWrite.data && (
                  <div className="receipt-card compact-receipt"><WadangStamp label="ENTRY RECORDED" /><div><strong>입장이 기록되었습니다.</strong><p>참여 트랜잭션이 GIWA Sepolia에 기록됐습니다.</p><a className="text-link" href={`${explorerUrl}/tx/${claimWrite.data}`} rel="noreferrer" target="_blank">Explorer 영수증 ↗</a></div></div>
                )}

                <button className="button button-accent button-large claim-button" disabled={!wadangAddress || step !== "claim" || claimPending} onClick={claim} type="button">
                  {claimPending ? <LoaderCircle className="spin" size={18} /> : <TicketCheck size={18} />}
                  {claimWrite.isPending ? "지갑에서 확인" : claimReceipt.isLoading ? "GIWA에 기록 중" : actionLabels[step]}
                </button>
              </div>
            </div>

            <aside className="rule-card">
              <span className="product-kicker">마당 규칙</span>
              <dl>
                <div><dt>문 여는 시각</dt><dd>{formatDate(campaign.startsAt)}</dd></div>
                <div><dt>문 닫는 시각</dt><dd>{formatDate(campaign.endsAt)}</dd></div>
                <div><dt>지갑당 참여</dt><dd>한 번</dd></div>
                <div><dt>접근 조건</dt><dd>참여 기록·Dojang 인증</dd></div>
                <div><dt>토큰·자금</dt><dd>전송 없음</dd></div>
              </dl>
              {wadangAddress && <a className="text-link" href={`${explorerUrl}/address/${wadangAddress}`} rel="noreferrer" target="_blank">컨트랙트 살펴보기 ↗</a>}
              {isOrganizer && phase !== "canceled" && (
                <button className="cancel-button" disabled={cancelWrite.isPending || cancelReceipt.isLoading} onClick={cancel} type="button"><XCircle size={15} />마당 닫기</button>
              )}
              {(cancelWrite.error || cancelReceipt.error) && <div className="error-box">{formatContractError(cancelWrite.error ?? cancelReceipt.error)}</div>}
              {cancelReceipt.isSuccess && <div className="success-box">캠페인이 닫혔습니다. 기존 참여 기록은 그대로 보존됩니다.</div>}
            </aside>
          </section>
          </>
        )}
      </div>
      <div className="back-row"><Link className="text-link" href="/manage">← 내 마당으로</Link></div>
    </main>
  );
}

function CheckRow({ ok, pending = false, neutral = false, label, detail }: { ok: boolean; pending?: boolean; neutral?: boolean; label: string; detail: string }) {
  return (
    <div className="check-row">
      {pending ? <LoaderCircle className="spin" size={20} /> : ok ? <BadgeCheck className="check-ok" size={20} /> : neutral ? <ShieldQuestion size={20} /> : <XCircle className="check-no" size={20} />}
      <span><strong>{label}</strong><small>{detail}</small></span>
    </div>
  );
}
