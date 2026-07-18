import {
  ArrowUpRight,
  Braces,
  Cloud,
  Database,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

import { StatusPill } from "@/components/status-pill";
import {
  attesterCandidates,
  officialVerifierAddress,
  wadangAddress,
} from "@/lib/contract";
import { wadangRelease } from "@/lib/release";

export const metadata: Metadata = { title: "기술문서" };

const contractApi = [
  ["createCampaign", "이름·안내문·기간·정원을 검증하고 새 캠페인 ID를 만듭니다."],
  ["claim", "Dojang 인증과 캠페인 규칙을 확인한 뒤 한 번의 참여를 기록합니다."],
  ["cancelCampaign", "운영자만 캠페인을 닫을 수 있습니다."],
  ["getCampaign", "운영자·안내문·기간·정원·참여 수·취소 상태를 반환합니다."],
  ["hasClaimed", "인증이 취소돼도 유지되는 과거 참여 기록입니다."],
  ["isEligible", "과거 참여, 캠페인 취소 여부와 조회 시점의 인증을 함께 확인합니다."],
];

export default function DocsPage() {
  return (
    <main className="page-shell container docs-page printable-doc">
      <header className="docs-head">
        <div><span className="product-kicker">기술 참조 · v0.4</span><h1>개발 문서</h1><p>컨트랙트 API, 참여 불변조건, <code>isEligible</code> 연동과 테스트넷 검증 증거를 정리했습니다.</p></div>
        <div><StatusPill tone="live">GIWA Sepolia · Verified</StatusPill><a className="text-link print-hidden" href="/artifacts/wadang-technical-docs.pdf">PDF 내려받기 ↗</a></div>
      </header>

      <div className="docs-layout">
        <nav className="docs-nav print-hidden" aria-label="기술문서 목차">
          <div>
            <strong>목차</strong>
            <a href="#architecture"><span>01</span>아키텍처</a>
            <a href="#contract"><span>02</span>컨트랙트 API</a>
            <a href="#integration"><span>03</span>외부 앱 연동</a>
            <a href="#attester"><span>04</span>Attester 선택</a>
            <a href="#security"><span>05</span>보안 경계</a>
            <a href="#evidence"><span>06</span>검증 증거</a>
            <a href="#next"><span>07</span>선발 후 검증</a>
          </div>
        </nav>

        <div className="docs-content">

          <section className="docs-summary-grid" aria-label="문서 요약">
            <article><ShieldCheck /><span>검증</span><strong>Dojang 상태 조회</strong><p>참여 시점에 지정된 verifier와 attester를 확인합니다.</p></article>
            <article><Database /><span>기록</span><strong>GIWA Sepolia</strong><p>기간, 정원, 참여 수, 취소 상태를 온체인에서 관리합니다.</p></article>
            <article><FileCheck2 /><span>연동</span><strong><code>isEligible</code></strong><p>참여 이력과 현재 인증을 외부 접근 조건으로 조회합니다.</p></article>
          </section>

      <section className="docs-section" id="architecture">
        <div className="docs-section-title"><span>01</span><h2>아키텍처</h2></div>
        <div className="architecture-flow">
          <div><small>PERSON</small><strong>운영자 / 참여자</strong></div><i>→</i>
          <div><small>CLOUDFLARE EDGE</small><strong>Next.js · OpenNext Worker</strong></div><i>→</i>
          <div><small>PRODUCT STATE</small><strong>WadangCampaigns</strong></div><i>→</i>
          <div><small>TRUST SOURCE</small><strong>GIWA OnchainVerifier</strong></div>
        </div>
        <p className="docs-copy">사용자의 브라우저가 지갑과 GIWA Sepolia RPC에 연결합니다. Cloudflare Worker는 화면과 정적 문서만 제공합니다. Dojang은 검증 정보를 제공하고, WadangCampaigns는 참여 규칙과 기록을 관리하며, 연동 앱은 공개 조회 함수로 현재 접근 자격을 확인합니다. D1·KV·R2·Durable Objects는 사용하지 않습니다.</p>
      </section>

      <section className="docs-section" id="contract">
        <div className="docs-section-title"><span>02</span><h2>컨트랙트 API</h2></div>
        <div className="api-list">
          {contractApi.map(([name, description]) => <div key={name}><code>{name}</code><p>{description}</p></div>)}
        </div>
        <div className="invariant-grid">
          <div><strong>Dojang 인증</strong><p>참여할 때 verifier가 true를 반환해야 합니다. 조회 오류는 미인증이나 성공으로 처리하지 않습니다.</p></div>
          <div><strong>지갑당 한 번</strong><p>참여가 완료된 지갑은 같은 캠페인에 다시 참여할 수 없습니다.</p></div>
          <div><strong>기간과 정원</strong><p>시작 시각은 포함하고 종료 시각은 제외합니다. 정원은 1–10,000입니다.</p></div>
          <div><strong>참여 기록과 후속 자격</strong><p><code>hasClaimed</code>는 과거 참여를 보존하고 <code>isEligible</code>은 캠페인 취소 여부와 조회 시점의 인증을 다시 확인합니다.</p></div>
        </div>
      </section>

      <section className="docs-section" id="integration">
        <div className="docs-section-title"><span>03</span><h2>외부 앱 연동</h2></div>
        <p className="docs-copy">다른 컨트랙트는 WADANG의 상태를 복사하지 않고 <code>isEligible</code>을 읽어 접근을 결정할 수 있습니다. 로컬 테스트에서는 참여 전 거절, 참여 후 허용, 인증 취소 후 재거절을 실제 소비자 컨트랙트로 확인합니다.</p>
        <pre className="integration-code"><code>{`interface IWadangEligibility {
    function isEligible(uint256 campaignId, address account)
        external view returns (bool);
}

if (!wadang.isEligible(campaignId, msg.sender)) {
    revert AccessDenied();
}`}</code></pre>
        <p className="docs-copy"><strong>v0.1 범위:</strong> 하나의 immutable verifier·attester 조합과 캠페인 참여 이력을 사용합니다. 파일럿에서는 여러 인증 조건, SDK·위젯과 Wallet 안의 발견 흐름 가운데 우선순위를 확인합니다.</p>
      </section>

      <section className="docs-section" id="attester">
        <div className="docs-section-title"><span>04</span><h2>Attester 선택</h2></div>
        <div className="config-grid">
          <div className="config-item"><span>Official verifier</span><code>{officialVerifierAddress}</code></div>
          <div className="config-item"><span>WADANG contract</span><code>{wadangAddress}</code></div>
          <div className="config-item"><span>Candidate · UPBIT KOREA</span><code>{attesterCandidates.upbitKorea}</code></div>
          <div className="config-item"><span>Candidate · TESTNET FAUCET</span><code>{attesterCandidates.testnetFaucet}</code></div>
        </div>
        <p className="docs-copy"><code>pnpm check:attesters &lt;PLAYGROUND_WALLET&gt;</code>로 공식 verifier를 조회한 결과 UPBIT KOREA는 false, TESTNET FAUCET는 true였습니다. WADANG MVP의 참여 자격은 Playground의 TESTNET FAUCET attester입니다.</p>
      </section>

      <section className="docs-section" id="security">
        <div className="docs-section-title"><span>05</span><h2>보안 경계</h2></div>
        <div className="boundary-grid">
          <div><h3>WADANG이 처리하는 것</h3><ul><li>설정된 Dojang 인증 확인</li><li>마당·지갑당 한 번의 입장</li><li>기간·정원·취소 상태</li><li>운영자 전용 마당 닫기</li><li>과거 입장 기록 보존</li></ul></div>
          <div><h3>연동 서비스가 처리하는 것</h3><ul><li>인증 유형의 서비스별 해석</li><li>입장 이후 혜택 제공</li><li>추가 Sybil 방지 정책</li><li>멤버십 발급과 권한 설계</li><li>Wallet 안의 발견·알림 흐름</li></ul></div>
        </div>
      </section>

      <section className="docs-section docs-evidence" id="evidence">
        <div className="docs-section-title"><span>06</span><h2>검증 증거</h2></div>
        <div><Braces size={26} /><p><strong>로컬 테스트:</strong> 14개 컨트랙트 테스트가 한글 byte 경계, 정원, 인증·미인증·중복, 시작·종료 시각, 취소 권한, 인증 취소·재발급, verifier 오류와 외부 접근 연동을 확인합니다. UI 테스트는 입력 제한, 화면 단계, 오류 안내와 생성 이벤트 ID 파싱을 다룹니다.</p></div>
        <div><ArrowUpRight size={26} /><p><strong>GIWA Sepolia:</strong> <code>{wadangRelease.contractAddress}</code>를 배포하고 Blockscout에서 소스를 검증했습니다. 캠페인 1은 생성과 참여 후 <code>isEligible == true</code>를 확인했고, 캠페인 2는 운영자 취소를 기록했습니다. 미인증 참여, 중복 참여와 비운영자 취소는 RPC simulation에서 각각 <code>NotVerified</code>, <code>AlreadyClaimed</code>, <code>NotOrganizer</code>를 확인했습니다.</p></div>
      </section>

      <section className="docs-section mainnet-plan" id="next">
        <div className="docs-section-title"><span>07</span><h2>선발 후 검증</h2></div>
        <div><Cloud size={26} /><p><strong>90일 계획:</strong> GIWA Wallet 안에서 마당을 찾고 참여하는 흐름과 인증 만료·취소 안내를 검토합니다. 파일럿 1건, 인증 지갑 입장 100건, 반복 사용 운영자 3곳과 <code>isEligible</code> 외부 연동 1건을 검증합니다. 결과를 바탕으로 여러 Dojang 인증을 조합하는 자격 정책과 SDK·위젯의 범위를 결정합니다.</p></div>
      </section>
        </div>
      </div>
    </main>
  );
}
