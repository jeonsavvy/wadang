"use client";

import { ArrowRight, CircleAlert, Copy, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

import { StatusPill } from "@/components/status-pill";
import { WalletButton } from "@/components/wallet-button";
import {
  type CampaignPhase,
  formatDate,
  getCampaignPhase,
  phaseLabels,
  shortenAddress,
} from "@/lib/campaign-state";
import { type Campaign, wadangAbi, wadangAddress } from "@/lib/contract";
import { useCurrentUnixTime } from "@/lib/use-current-unix-time";

type CampaignFilter = "all" | "active" | "upcoming" | "ended" | "canceled";

const filters: Array<{ id: CampaignFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "active", label: "입장 가능" },
  { id: "upcoming", label: "예정" },
  { id: "ended", label: "종료·마감" },
  { id: "canceled", label: "닫힘" },
];

function matchesFilter(filter: CampaignFilter, phase: CampaignPhase) {
  if (filter === "all") return true;
  if (filter === "ended") return phase === "ended" || phase === "full";
  return phase === filter;
}

export function ManageMadang() {
  const now = useCurrentUnixTime();
  const { address, chainId, isConnected } = useAccount();
  const [filter, setFilter] = useState<CampaignFilter>("all");
  const [copiedId, setCopiedId] = useState<number>();
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

  const campaigns = useMemo(() => (
    campaignReads.data?.flatMap((result, index) =>
      result.status === "success" &&
      address &&
      isAddressEqual(address, (result.result as Campaign).organizer)
        ? [{
            id: index + 1,
            campaign: result.result as Campaign,
            phase: getCampaignPhase(result.result as Campaign, now),
          }]
        : [],
    ).reverse() ?? []
  ), [address, campaignReads.data, now]);

  const visibleCampaigns = campaigns.filter(({ phase }) => matchesFilter(filter, phase));

  async function copyShareLink(id: number) {
    await navigator.clipboard.writeText(`${window.location.origin}/madang/${id}`);
    setCopiedId(id);
  }

  return (
    <>
      <header className="product-page-head">
        <div>
          <span className="product-kicker">운영</span>
          <h1>내 마당</h1>
          <p>{isConnected ? `${campaigns.length}개 캠페인 · ${shortenAddress(address ?? "", 7)}` : "운영자 지갑을 연결하면 만든 캠페인을 불러옵니다."}</p>
        </div>
        <div className="product-head-actions">
          <div className="network-readout">
            <span>네트워크</span>
            <strong>{chainId === 91342 ? "GIWA Sepolia" : isConnected ? "전환 필요" : "미연결"}</strong>
          </div>
          <Link className="button button-dark" href="/open"><Plus size={15} />마당 만들기</Link>
        </div>
      </header>

      <section className="workspace" aria-label="운영 캠페인">
        <div className="workspace-toolbar">
          <div className="filter-tabs" aria-label="캠페인 상태 필터" role="group">
            {filters.map((item) => {
              const filterCount = campaigns.filter(({ phase }) => matchesFilter(item.id, phase)).length;
              return (
                <button aria-pressed={filter === item.id} key={item.id} onClick={() => setFilter(item.id)} type="button">
                  {item.label}<span>{filterCount}</span>
                </button>
              );
            })}
          </div>
          <span className="workspace-source">WadangCampaigns 실시간 조회</span>
        </div>

        <div className="workspace-body">
          {!wadangAddress && (
            <div className="notice"><CircleAlert size={19} /><div><strong>컨트랙트 주소가 없습니다</strong>테스트넷 배포 주소를 설정한 뒤 다시 확인해 주세요.</div></div>
          )}
          {wadangAddress && !isConnected && (
            <div className="empty-state product-empty">
              <strong>운영자 지갑을 연결하세요</strong>
              <span>연결된 주소가 만든 캠페인만 표시합니다.</span>
              <WalletButton />
            </div>
          )}
          {(count.isLoading || campaignReads.isLoading) && wadangAddress && isConnected && (
            <div className="empty-state"><LoaderCircle className="spin" />GIWA Sepolia에서 캠페인을 읽는 중…</div>
          )}
          {(count.error || campaignReads.error) && (
            <div className="error-box">GIWA RPC에서 캠페인을 읽지 못했습니다. 네트워크 상태를 확인하고 새로고침해 주세요.</div>
          )}
          {wadangAddress && isConnected && !count.isLoading && !campaignReads.isLoading && campaigns.length === 0 && (
            <div className="empty-state product-empty"><strong>아직 만든 마당이 없습니다</strong><span>기간과 정원을 입력하면 공유 가능한 캠페인 링크가 만들어집니다.</span><Link className="button button-dark" href="/open">첫 마당 만들기</Link></div>
          )}
          {campaigns.length > 0 && visibleCampaigns.length === 0 && (
            <div className="empty-state"><strong>이 상태의 마당이 없습니다</strong><span>다른 필터를 선택해 주세요.</span></div>
          )}

          <div className="campaign-list">
            {visibleCampaigns.map(({ id, campaign, phase }) => (
              <article className="campaign-row" key={id}>
                <Link className="campaign-row-primary" href={`/madang/${id}`}>
                  <div className="campaign-index">#{String(id).padStart(3, "0")}</div>
                  <div className="campaign-main">
                    <div><StatusPill tone={phase}>{phaseLabels[phase]}</StatusPill></div>
                    <h3>{campaign.title}</h3>
                    <p>{campaign.details || "공개 안내문 없음"}</p>
                  </div>
                  <div className="campaign-stats">
                    <strong>{campaign.claimCount}<span> / {campaign.capacity}</span></strong>
                    <small>참여 · {formatDate(campaign.endsAt)} 종료</small>
                  </div>
                  <ArrowRight size={20} />
                </Link>
                <button className="row-action" onClick={() => void copyShareLink(id)} type="button">
                  <Copy size={14} />{copiedId === id ? "복사됨" : "링크 복사"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
