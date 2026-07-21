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
          <div className="eyebrow">GIWA SEPOLIA · GASOK TRACK 03</div>
          <h1>
            Dojang 인증 지갑만
            <br />
            참여하는 온체인
            <br />
            <em>마당</em>
          </h1>
          <p className="hero-lede">
            운영자는 기간과 정원을 정해 마당을 열고, Dojang 인증 지갑은
            한 번만 참여합니다. 참여 기록은 GIWA Sepolia에 남습니다.
          </p>
          <div className="hero-actions">
            <Link className="button button-accent button-large" href="/open" prefetch={false}>
              마당 열기 <ArrowRight size={17} />
            </Link>
            <Link className="text-link" href="/docs" prefetch={false}>
              작동 방식 보기 ↗
            </Link>
          </div>
          <div className="hero-meta">
            <StatusPill tone={wadangAddress ? "live" : "preview"}>
              {wadangAddress ? "GIWA Sepolia" : "LOCAL PREVIEW"}
            </StatusPill>
            <span>지갑당 한 번 · 기간과 정원 · 공개 영수증</span>
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
              <small>GIWA SEPOLIA · MADANG #001</small>
              <h2>테스트넷 입장</h2>
              <p>Dojang 테스트 인증과 참여 기록을 확인하는 공개 마당</p>
            </div>
            <div className="madang-pass-bottom">
              <span>지갑당 한 번</span>
              <span>Explorer 영수증</span>
            </div>
          </article>
          <WadangStamp />
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-grid">
          <div>
            <span className="section-number">一</span>
            <h3>Dojang 상태 조회</h3>
            <p>참여 버튼을 누르면 컨트랙트가 GIWA OnchainVerifier에 현재 인증 상태를 묻습니다.</p>
          </div>
          <div>
            <span className="section-number">二</span>
            <h3>기간·정원·중복 검사</h3>
            <p>시작과 종료 시각, 남은 정원과 이 지갑의 기존 참여 기록을 검사합니다.</p>
          </div>
          <div>
            <span className="section-number">三</span>
            <h3>GIWA에 참여 기록</h3>
            <p>조건을 통과한 지갑의 참여를 기록하고, Explorer에서 영수증을 확인할 수 있습니다.</p>
          </div>
        </div>
      </section>

      <section className="container journey-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">운영자와 참여자</span>
            <h2>마당을 열고,<br />인증 지갑이 입장합니다.</h2>
          </div>
          <Link className="text-link" href="/madang/1" prefetch={false}>테스트넷 마당 보기 ↗</Link>
        </div>
        <div className="journey-grid">
          <article className="journey-card organizer-card">
            <span className="journey-role">운영자</span>
            <Blocks size={32} />
            <h3>마당 열기</h3>
            <ol>
              <li><span>01</span>운영자 지갑 연결</li>
              <li><span>02</span>기간·정원·안내문 입력</li>
              <li><span>03</span>트랜잭션 확인 후 링크 공유</li>
            </ol>
            <Link href="/open" prefetch={false}>마당 만들기 <ArrowRight size={15} /></Link>
          </article>
          <article className="journey-card participant-card">
            <span className="journey-role">참여자</span>
            <DatabaseZap size={32} />
            <h3>입장하기</h3>
            <ol>
              <li><span>01</span>Dojang 테스트 인증 지갑 연결</li>
              <li><span>02</span>현재 인증과 캠페인 상태 확인</li>
              <li><span>03</span>입장 후 Explorer 영수증 확인</li>
            </ol>
            <Link href="/docs" prefetch={false}>참여 규칙 보기 <ArrowRight size={15} /></Link>
          </article>
        </div>
      </section>

      <section className="container final-cta evidence-cta">
        <ShieldCheck size={34} />
        <div>
          <span className="eyebrow">외부 앱 연동</span>
          <h2><code>isEligible</code>로 과거 참여와 현재 Dojang 인증을 함께 확인합니다.</h2>
        </div>
        <Link className="button button-dark button-large" href="/docs#integration" prefetch={false}>
          연동 코드 보기 <CircleCheckBig size={17} />
        </Link>
      </section>
    </main>
  );
}
