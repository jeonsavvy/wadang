import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  CircleCheckBig,
  DatabaseZap,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { WadangMark, WadangStamp } from "@/components/wadang-mark";
import { wadangAddress } from "@/lib/contract";

export default function Home() {
  return (
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">DOJANG-BASED ACCESS · GASOK TRACK 03</div>
          <h1>
            검증된 지갑의
            <br />
            참여와 접근을
            <br />
            잇는 <em>마당</em>
          </h1>
          <p className="hero-lede">
            WADANG은 Dojang 검증을 기간·정원·중복 규칙과 연결합니다.
            참여 결과는 GIWA에 남고, 다른 앱이 현재 접근 자격으로 다시 확인할 수 있습니다.
          </p>
          <div className="hero-actions">
            <Link className="button button-accent button-large" href="/open">
              마당 열기 <ArrowRight size={17} />
            </Link>
            <Link className="text-link" href="/docs">
              작동 방식 보기 ↗
            </Link>
          </div>
          <div className="hero-meta">
            <StatusPill tone={wadangAddress ? "live" : "preview"}>
              {wadangAddress ? "GIWA Sepolia" : "LOCAL PREVIEW"}
            </StatusPill>
            <span>PARTICIPATION RULES · REUSABLE ELIGIBILITY</span>
          </div>
        </div>

        <div className="tile-stage" aria-label="WADANG 인증 마당 개념도">
          <div className="eaves-line" />
          <div className="tile-disc tile-disc-one"><WadangMark size={142} /></div>
          <div className="tile-disc tile-disc-two"><WadangMark size={122} /></div>
          <article className="madang-pass">
            <div className="madang-pass-top">
              <span>WADANG / GIWA SEPOLIA</span>
              <BadgeCheck size={22} />
            </div>
            <div>
              <small>FIRST USE CASE · CAMPAIGN</small>
              <h2>첫 번째 마당</h2>
              <p>테스트 인증 지갑이 한 번 참여하고 접근 자격을 남깁니다</p>
            </div>
            <div className="madang-pass-bottom">
              <span>1 WALLET · 1 ENTRY</span>
              <span>INSPECTABLE RECEIPT</span>
            </div>
          </article>
          <WadangStamp />
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-grid">
          <div>
            <span className="section-number">一</span>
            <h3>Dojang이 검증 정보를 제공합니다</h3>
            <p>참여 시점에 컨트랙트가 GIWA OnchainVerifier를 직접 조회합니다.</p>
          </div>
          <div>
            <span className="section-number">二</span>
            <h3>WADANG이 참여 규칙을 적용합니다</h3>
            <p>기간·정원·지갑당 한 번의 참여를 컨트랙트가 일관되게 처리합니다.</p>
          </div>
          <div>
            <span className="section-number">三</span>
            <h3>다른 앱이 접근 자격을 확인합니다</h3>
            <p><code>isEligible</code>로 참여 기록, 마당 상태와 조회 시점의 인증을 함께 확인합니다.</p>
          </div>
        </div>
      </section>

      <section className="container story-section">
        <div className="story-mark"><WadangMark size={90} /></div>
        <div>
          <span className="eyebrow">GIWA · DOJANG · WADANG</span>
          <h2>Dojang 검증을 참여와<br />이후 접근 자격에 연결합니다.</h2>
        </div>
        <p>
          Dojang은 지갑의 검증 정보를 제공하고, WADANG은 그 정보를 참여 규칙과 기록으로 연결합니다.
          캠페인은 이 구조를 검증하는 첫 사용 사례이며, 다른 서비스는 참여 결과와 현재 인증을 함께 확인할 수 있습니다.
          이름과 시각 요소는 기와 끝을 마감하는 와당에서 가져왔습니다.
        </p>
      </section>

      <section className="container journey-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE CONTRACT · TWO JOURNEYS</span>
            <h2>운영자는 참여 규칙을 만들고,<br />사용자는 인증 후 입장합니다.</h2>
          </div>
          <Link className="text-link" href="/manage">온체인 현황 보기 ↗</Link>
        </div>
        <div className="journey-grid">
          <article className="journey-card organizer-card">
            <span className="journey-role">FOR ORGANIZERS · 운영자</span>
            <Blocks size={32} />
            <h3>마당 열기</h3>
            <ol>
              <li><span>01</span>GIWA Sepolia 지갑 연결</li>
              <li><span>02</span>기간·정원·안내문 설정</li>
              <li><span>03</span>공유 링크와 참여 현황 확인</li>
            </ol>
            <Link href="/open">운영자 흐름 시작 <ArrowRight size={15} /></Link>
          </article>
          <article className="journey-card participant-card">
            <span className="journey-role">FOR PARTICIPANTS · 참여자</span>
            <DatabaseZap size={32} />
            <h3>입장하기</h3>
            <ol>
              <li><span>01</span>Dojang 테스트 인증 지갑 연결</li>
              <li><span>02</span>Playground 인증 상태 확인</li>
              <li><span>03</span>한 번 참여하고 영수증 확인</li>
            </ol>
            <Link href="/docs">참여 규칙 보기 <ArrowRight size={15} /></Link>
          </article>
        </div>
      </section>

      <section className="container final-cta">
        <ShieldCheck size={34} />
        <div>
          <span className="eyebrow">FIRST USE CASE · CAMPAIGN</span>
          <h2>기간과 정원을 설정해 첫 참여 마당을 열어 보세요.</h2>
        </div>
        <Link className="button button-dark button-large" href="/open">
          첫 마당 열기 <CircleCheckBig size={17} />
        </Link>
      </section>
    </main>
  );
}
