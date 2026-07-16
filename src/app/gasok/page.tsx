import {
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

export const metadata: Metadata = { title: "GASOK 제출자료" };

const repositoryUrl = "https://github.com/jeonsavvy/wadang";

export default function GasokPage() {
  return (
    <main className="page-shell container">
      <div className="page-intro">
        <div>
          <span className="eyebrow">GASOK · TRACK 03</span>
          <h1>WADANG<br />제출자료</h1>
        </div>
        <div>
          <StatusPill tone={wadangAddress ? "live" : "preview"}>
            {wadangAddress ? "GIWA Sepolia 연결됨" : "테스트넷 배포 전"}
          </StatusPill>
          <p>작동 MVP, 팀, 기술 구현과 공개 소스를 한곳에서 확인할 수 있습니다. WADANG은 Dojang 검증을 참여 규칙으로 사용하고, 그 결과를 다른 앱이 접근 자격으로 다시 읽게 합니다.</p>
        </div>
      </div>

      <section className="gasok-grid" aria-label="GASOK 제출 링크">
        <article className="gasok-card">
          <Blocks size={28} />
          <span>WORKING MVP</span>
          <h2>WADANG 앱</h2>
          <p>참여 규칙 생성, Playground 테스트 인증 확인, 온체인 참여와 현재 접근 자격을 확인합니다.</p>
          <Link className="text-link" href="/">제품 열기 <ExternalLink size={12} /></Link>
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
          <Link className="text-link" href="/docs">웹 문서 열기 <ExternalLink size={12} /></Link>
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
          {wadangAddress ? (
            <a className="text-link" href={`${explorerUrl}/address/${wadangAddress}`} rel="noreferrer" target="_blank">컨트랙트 열기 <ExternalLink size={12} /></a>
          ) : (
            <span>배포 후 링크 활성화</span>
          )}
        </article>
      </section>

      <section className="gasok-release">
        <ShieldCheck size={28} />
        <dl>
          <dt>Network</dt><dd>GIWA Sepolia · Chain ID 91342</dd>
          <dt>Contract</dt><dd><code>{wadangAddress ?? "PENDING"}</code></dd>
          <dt>Repository</dt><dd>{repositoryUrl}</dd>
          <dt>Track</dt><dd>Track 03 · GIWA-NATIVE IDEAS</dd>
        </dl>
      </section>
    </main>
  );
}
