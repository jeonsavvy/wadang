import {
  BadgeCheck,
  CircleCheck,
  Cloud,
  Database,
  Fingerprint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

import { WadangMark } from "@/components/wadang-mark";
import { wadangAddress } from "@/lib/contract";
import { wadangRelease } from "@/lib/release";

export const metadata: Metadata = { title: "GASOK 피치덱" };

function DeckChrome({ number, children }: { number: number; children: React.ReactNode }) {
  return <><div className="deck-logo"><WadangMark size={27} /><span>WADANG <small>와당</small></span></div><div className="deck-number">{String(number).padStart(2, "0")} / 09</div>{children}</>;
}

export default function DeckPage() {
  return (
    <main className="deck-page">
      <div className="artifact-toolbar print-hidden"><span>GASOK TRACK 03 · 9 SLIDES</span><a className="button button-light" href="/artifacts/wadang-pitch-deck.pdf">PDF 내려받기</a></div>

      <section className="deck-slide deck-cover">
        <DeckChrome number={1}>
          <div className="deck-tag">GASOK · TRACK 03 · GIWA-NATIVE IDEAS</div>
          <h1>Dojang 인증 지갑의 참여를<br />온체인에 기록하는 <em>WADANG</em></h1>
          <p>운영자는 캠페인 규칙을 만들고, 외부 앱은 참여 기록과 현재 인증을 접근 조건으로 조회합니다.</p>
          <div className="deck-triad"><span>DOJANG<small>지갑의 검증 정보</small></span><i>×</i><span>WADANG<small>참여 규칙과 기록</small></span><i>×</i><span>GIWA APP<small>접근과 후속 혜택</small></span></div>
          <div className="deck-seal"><WadangMark size={155} /></div>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-problem">
        <DeckChrome number={2}>
          <div className="deck-side-label">THE PROBLEM</div>
          <h2>지갑 주소만으로는 캠페인에 필요한<br /><em>참여 자격을 확인하기 어렵습니다.</em></h2>
          <div className="deck-three">
            <article><span>01</span><h3>주소만으로 부족한 참여 조건</h3><p>운영자는 지갑 주소만 보고 인증 여부나 캠페인 참여 조건을 판단할 수 없습니다.</p></article>
            <article><span>02</span><h3>반복되는 개인정보 입력</h3><p>별도 신청서를 받으면 참여 단계가 늘고 개인정보 관리 부담도 생깁니다.</p></article>
            <article><span>03</span><h3>운영자만 확인하는 명단</h3><p>오프체인 명단은 참여 규칙과 결과를 참여자가 직접 확인하기 어렵습니다.</p></article>
          </div>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-insight">
        <DeckChrome number={3}>
          <div className="deck-tag">VERIFY → RECORD → CHECK</div>
          <h2>Dojang은 인증하고,<br /><em>WADANG은 참여를 기록합니다.</em></h2>
          <div className="deck-flow">
            <div><Fingerprint /><small>DOJANG</small><strong>지갑의 검증 정보를 제공</strong></div><b>→</b>
            <div><ShieldCheck /><small>WADANG</small><strong>기간·정원·중복을 적용</strong></div><b>→</b>
            <div><CircleCheck /><small>CONNECTED APP</small><strong>현재 접근 자격을 확인</strong></div>
          </div>
          <p className="deck-quote">WADANG은 <code>isVerified</code> 결과를 복사하지 않습니다. 참여할 때 Dojang을 조회하고, 외부 앱에는 <code>isEligible</code>을 제공합니다.</p>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-product">
        <DeckChrome number={4}>
          <div className="deck-side-label">THE MVP</div>
          <div className="deck-title-row"><div><span className="deck-tag">FIRST USE CASE · CAMPAIGN</span><h2>운영자는 참여 규칙을 만들고,<br /><em>사용자는 인증 후 입장합니다.</em></h2></div><Sparkles /></div>
          <div className="deck-two">
            <article><small>FOR ORGANIZERS · 운영자</small><h3>마당 열기</h3><ol><li>운영자 지갑 연결</li><li>안내문·기간·정원 설정</li><li>공유 링크 확인</li><li>참여 현황 확인·캠페인 닫기</li></ol></article>
            <article><small>FOR PARTICIPANTS · 참여자</small><h3>입장하기</h3><ol><li>GIWA Sepolia 전환</li><li>Playground 테스트 인증 확인</li><li>한 번 참여</li><li>Explorer 영수증 확인</li></ol></article>
          </div>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-demo">
        <DeckChrome number={5}>
          <div className="deck-tag">WORKING TESTNET MVP</div>
          <h2>규칙 생성부터 접근 자격 확인까지<br /><em>GIWA Sepolia에서 실행했습니다.</em></h2>
          <div className="deck-demo-frame">
            <div className="deck-browser"><span /><span /><span /><b>wadang.jeonsavvy.workers.dev/madang/1</b></div>
            <div className="deck-demo-card"><small>MADANG · DOJANG CHECK</small><BadgeCheck /><h3>TESTNET CONTRACT CONNECTED</h3><p>{wadangAddress}</p><span className="deck-demo-result">입장 완료 · isEligible true</span></div>
            <div className="deck-evidence"><strong>VERIFIED ONCHAIN</strong><span>Campaign 1 · create + claim</span><span>Campaign 2 · create + cancel</span><span>14 contract tests</span><span>Source · {wadangRelease.sourceCommit.slice(0, 8)}</span></div>
          </div>
          <p className="deck-footnote">Verified contract · {wadangRelease.contractAddress} · Campaign 1 참여 후 isEligible == true</p>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-architecture">
        <DeckChrome number={6}>
          <div className="deck-side-label">PARTICIPATION → ACCESS</div>
          <h2>WADANG의 참여 기록을<br /><em>외부 앱이 접근 조건으로 조회합니다.</em></h2>
          <div className="deck-architecture-map">
            <div><ShieldCheck /><small>TRUST SOURCE</small><strong>Dojang verification</strong></div>
            <div><Database /><small>PARTICIPATION</small><strong>WadangCampaigns</strong></div>
            <div><CircleCheck /><small>PUBLIC READ</small><strong>isEligible(id, wallet)</strong></div>
            <div><Cloud /><small>CONNECTED APP</small><strong>Access · Membership</strong></div>
          </div>
          <div className="deck-boundaries"><span>과거 참여 기록</span><span>현재 인증 상태</span><span>마당 취소 여부</span><span>외부 앱 연동 테스트</span></div>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-market">
        <DeckChrome number={7}>
          <div className="deck-tag">CAMPAIGN → POLICY → WALLET</div>
          <h2>현재는 캠페인,<br /><em>다음은 자격 정책과 SDK입니다.</em></h2>
          <div className="deck-market-grid">
            <article><span>01 · MVP</span><h3>검증 지갑 캠페인</h3><p>Verified Address 한 종류에 기간·정원·중복 규칙을 적용합니다.</p></article>
            <article><span>02 · PRODUCT</span><h3>자격 정책과 SDK</h3><p>여러 Dojang 인증을 조합하는 정책과 외부 서비스용 SDK·위젯을 시험합니다.</p></article>
            <article><span>03 · SCALE</span><h3>Wallet 참여·접근 계층</h3><p>GIWA Wallet에서 마당을 찾고, 참여 기록을 여러 앱의 멤버십 조건으로 조회합니다.</p></article>
          </div>
          <p className="deck-honesty"><strong>사업모델 가설:</strong> 운영자 구독 · 검증 참여 건별 요금 · SDK/API 요금. 파일럿에서 반복 사용과 지불 의사를 먼저 확인합니다.</p>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-roadmap">
        <DeckChrome number={8}>
          <div className="deck-side-label">90-DAY VALIDATION</div>
          <h2>선발 후 90일 동안<br />실제 반복 사용 여부를 검증합니다.</h2>
          <div className="deck-kpis"><div><strong>1</strong><span>실제 파일럿</span></div><div><strong>100</strong><span>인증 지갑 입장</span></div><div><strong>3</strong><span>반복 사용 운영자</span></div><div><strong>1</strong><span>외부 앱 연동</span></div></div>
          <div className="deck-timeline"><div><small>AUG</small><strong>Wallet 참여 흐름 · 첫 파트너</strong><p>만료·취소·재인증 안내를 GIWA와 검토</p></div><div><small>SEP</small><strong>파일럿 운영</strong><p>참여 완료율과 연동 수요 확인</p></div><div><small>OCT</small><strong>인증 유형 확장 판단</strong><p>Verified Balance·Code 적용 범위 결정</p></div></div>
        </DeckChrome>
      </section>

      <section className="deck-slide deck-team">
        <DeckChrome number={9}>
          <div className="deck-tag">TEAM & ASK</div>
          <div className="deck-team-grid">
            <div><h2>전찬혁<br /><em>JEON CHAN HYUK</em></h2><p>Product · Smart Contract · Frontend</p><div className="deck-proof-list"><span>Coupang Catalog Operation</span><span>NAVER billboard.js contributor</span><span>14 contract tests</span><span>Public source · technical docs</span></div></div>
            <div className="deck-ask"><small>SUPPORT REQUEST</small><h3>GIWA Wallet UX 리뷰</h3><h3>Attester 운영 가이드</h3><h3>생태계 파일럿 파트너 1곳</h3><p>GIWA Wallet에서 캠페인을 찾고 참여하는 흐름, 인증 만료·취소 안내와 첫 파일럿 운영을 GIWA 팀과 함께 검토하고 싶습니다.</p></div>
          </div>
          <div className="deck-end"><WadangMark size={22} /> WADANG · Dojang 인증 지갑의 참여를 기록하는 온체인 마당</div>
        </DeckChrome>
      </section>
    </main>
  );
}
