"use client";

import { ArrowRight, CircleAlert, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

import { StatusPill } from "@/components/status-pill";
import { formatDate, getCampaignPhase, phaseLabels } from "@/lib/campaign-state";
import { type Campaign, wadangAbi, wadangAddress } from "@/lib/contract";
import { useCurrentUnixTime } from "@/lib/use-current-unix-time";

export function ManageMadang() {
  const now = useCurrentUnixTime();
  const { address, isConnected } = useAccount();
  const safeAddress = wadangAddress ?? zeroAddress;
  const count = useReadContract({
    address: safeAddress,
    abi: wadangAbi,
    functionName: "campaignCount",
    query: { enabled: Boolean(wadangAddress) },
  });
  const total = Number(count.data ?? 0n);
  const campaignReads = useReadContracts({
    contracts: Array.from({ length: total }, (_, index) => ({
      address: safeAddress,
      abi: wadangAbi,
      functionName: "getCampaign" as const,
      args: [BigInt(index + 1)] as const,
    })),
    query: { enabled: Boolean(wadangAddress) && total > 0 },
  });

  const campaigns = campaignReads.data?.flatMap((result, index) =>
    result.status === "success" &&
    address &&
    isAddressEqual(address, (result.result as Campaign).organizer)
      ? [{ id: index + 1, campaign: result.result as Campaign }]
      : [],
  ) ?? [];

  return (
    <section className="panel">
      <div className="panel-head">
        <div><span className="eyebrow">MY ONCHAIN CAMPAIGNS</span><h2>{isConnected ? `${campaigns.length}개의 캠페인` : "운영자 지갑 연결 필요"}</h2></div>
        <Link className="button button-dark" href="/open"><Plus size={15} />마당 열기</Link>
      </div>
      <div className="panel-body">
        {!wadangAddress && (
          <div className="notice"><CircleAlert size={19} /><div><strong>테스트넷 배포 전</strong>컨트랙트 주소가 설정되면 실제 캠페인만 표시됩니다.</div></div>
        )}
        {wadangAddress && !isConnected && (
          <div className="empty-state"><strong>운영자 지갑을 연결해 주세요.</strong><span>주소는 로그인 계정이 아니라 온체인 소유권 필터로만 사용됩니다.</span></div>
        )}
        {(count.isLoading || campaignReads.isLoading) && wadangAddress && (
          <div className="empty-state"><LoaderCircle className="spin" />GIWA Sepolia에서 열린 마당을 읽는 중…</div>
        )}
        {(count.error || campaignReads.error) && (
          <div className="error-box">GIWA RPC에서 마당을 읽지 못했습니다. 네트워크 상태를 확인하고 새로고침해 주세요.</div>
        )}
        {wadangAddress && isConnected && !count.isLoading && !campaignReads.isLoading && campaigns.length === 0 && (
          <div className="empty-state"><strong>이 지갑으로 만든 캠페인이 없습니다.</strong><span>첫 캠페인을 만들면 참여 현황과 공유 링크를 여기에서 확인할 수 있습니다.</span></div>
        )}
        <div className="campaign-list">
          {campaigns.map(({ id, campaign }) => {
            const phase = getCampaignPhase(campaign, now);
            return (
              <Link className="campaign-row" href={`/madang/${id}`} key={id}>
                <div className="campaign-index">#{String(id).padStart(3, "0")}</div>
                <div className="campaign-main">
                  <div><StatusPill tone={phase}>{phaseLabels[phase]}</StatusPill><span className="organizer-label">내가 연 마당</span></div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.details || "공개 안내문 없음"}</p>
                </div>
                <div className="campaign-stats">
                  <strong>{campaign.claimCount}<span> / {campaign.capacity}</span></strong>
                  <small>참여 · {formatDate(campaign.endsAt)} 종료</small>
                </div>
                <ArrowRight size={20} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
