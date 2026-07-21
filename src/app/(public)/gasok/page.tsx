import {
  ArrowRight,
  Blocks,
  Code2,
  ExternalLink,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { explorerUrl } from "@/lib/chain";
import { wadangAddress } from "@/lib/contract";
import {
  repositoryUrl,
  sourceCommitUrl,
  wadangRelease,
} from "@/lib/release";

export const metadata: Metadata = { title: "GASOK 제출자료" };

const transactionUrl = (hash: string) => `${explorerUrl}/tx/${hash}`;

export default function GasokPage() {
  return (
    <main className="page-shell container">
      <div className="page-intro">
        <div>
          <span className="eyebrow">GASOK · TRACK 03</span>
          <h1>WADANG<br />제출자료</h1>
        </div>
        <div>
          <StatusPill tone="live">GIWA Sepolia 검증 완료</StatusPill>
          <p>작동 MVP, 팀, 기술 구현과 공개 소스를 한곳에서 확인할 수 있습니다. WADANG은 Dojang 검증을 참여 규칙으로 사용하고, 그 결과를 다른 앱이 접근 자격으로 다시 읽게 합니다.</p>
        </div>
      </div>

      <section className="gasok-grid" aria-label="GASOK 제출 링크">
        <article className="gasok-card">
          <Blocks size={28} />
          <span>WORKING MVP</span>
          <h2>WADANG 앱</h2>
          <p>참여 규칙 생성, Playground 테스트 인증 확인, 온체인 참여와 현재 접근 자격을 확인합니다.</p>
          <Link className="text-link" href="/" prefetch={false}>제품 열기 <ArrowRight size={12} /></Link>
        </article>
        <article className="gasok-card">
          <FileText size={28} />
          <span>PITCH DECK · 9 PAGES</span>
          <h2>피치덱</h2>
          <p>문제, Dojang과 WADANG의 역할, MVP 증거, 확장 경로와 90일 검증 계획을 담았습니다.</p>
          <a className="text-link" href="/artifacts/wadang-pitch-deck.pdf">PDF 열기 <ExternalLink size={12} /></a>
        </article>
        <article className="gasok-card">
          <UserRound size={28} />
          <span>TEAM PROFILE · 1 PAGE</span>
          <h2>팀 소개</h2>
          <p>전찬혁의 역할, 학력, 경력과 공개 활동을 한 페이지로 정리했습니다.</p>
          <a className="text-link" href="/artifacts/wadang-team-profile.pdf">PDF 열기 <ExternalLink size={12} /></a>
        </article>
        <article className="gasok-card">
          <ShieldCheck size={28} />
          <span>TECHNICAL DOCUMENT</span>
          <h2>기술문서</h2>
          <p>컨트랙트 API, <code>isEligible</code> 연동, attester 선택, 테스트와 보안 경계를 설명합니다.</p>
          <Link className="text-link" href="/docs" prefetch={false}>웹 문서 열기 <ArrowRight size={12} /></Link>
        </article>
        <article className="gasok-card">
          <Code2 size={28} />
          <span>PUBLIC SOURCE</span>
          <h2>GitHub</h2>
          <p>컨트랙트, 프론트엔드, 테스트와 Cloudflare 배포 구성을 공개합니다.</p>
          <a className="text-link" href={repositoryUrl} rel="noreferrer" target="_blank">저장소 열기 <ExternalLink size={12} /></a>
        </article>
        <article className="gasok-card">
          <ShieldCheck size={28} />
          <span>VERIFIED CONTRACT</span>
          <h2>GIWA Explorer</h2>
          <p>배포 주소, 검증된 소스와 실제 테스트넷 트랜잭션을 확인합니다.</p>
          <a className="text-link" href={`${explorerUrl}/address/${wadangAddress}#code`} rel="noreferrer" target="_blank">검증된 소스 열기 <ExternalLink size={12} /></a>
        </article>
      </section>

      <section className="gasok-release">
        <ShieldCheck size={28} />
        <dl>
          <dt>Network</dt><dd>{wadangRelease.network} · Chain ID {wadangRelease.chainId}</dd>
          <dt>Application</dt><dd><a href={wadangRelease.appUrl}>{wadangRelease.appUrl}</a></dd>
          <dt>Contract</dt><dd><a href={`${explorerUrl}/address/${wadangRelease.contractAddress}#code`} rel="noreferrer" target="_blank"><code>{wadangRelease.contractAddress}</code></a></dd>
          <dt>Campaign 1</dt><dd><Link href="/madang/1" prefetch={false}>생성·참여·현재 자격 확인</Link> · <a href={transactionUrl(wadangRelease.transactions.createCampaign1)} rel="noreferrer" target="_blank">생성 영수증</a> · <a href={transactionUrl(wadangRelease.transactions.claimCampaign1)} rel="noreferrer" target="_blank">참여 영수증</a></dd>
          <dt>Campaign 2</dt><dd><a href={transactionUrl(wadangRelease.transactions.cancelCampaign2)} rel="noreferrer" target="_blank">운영자 취소 영수증</a></dd>
          <dt>Simulation</dt><dd>미인증 {wadangRelease.simulations.unverifiedClaim} · 중복 {wadangRelease.simulations.duplicateClaim} · 비운영자 취소 {wadangRelease.simulations.unauthorizedCancel}</dd>
          <dt>Source</dt><dd><a href={sourceCommitUrl} rel="noreferrer" target="_blank"><code>{wadangRelease.sourceCommit.slice(0, 8)}</code></a> · Solidity SHA-256 <code>{wadangRelease.contractSourceSha256}</code></dd>
          <dt>Published</dt><dd>{wadangRelease.publishedAt} · Track 03 GIWA-NATIVE IDEAS</dd>
        </dl>
      </section>
    </main>
  );
}
