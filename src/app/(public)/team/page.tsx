import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { WadangMark } from "@/components/wadang-mark";

export const metadata: Metadata = { title: "팀 소개" };

export default function TeamPage() {
  return (
    <main className="profile-page">
      <div className="artifact-toolbar print-hidden"><span>TEAM PROFILE · 1 PAGE</span><a className="button button-light" href="/artifacts/wadang-team-profile.pdf">PDF 내려받기</a></div>
      <article className="profile-sheet">
        <header className="profile-brand"><WadangMark size={34} /><span>WADANG <small>와당</small></span><b>GASOK · TRACK 03</b></header>

        <section className="profile-hero">
          <div>
            <span className="eyebrow">PRODUCT · SMART CONTRACT · FRONTEND</span>
            <h1>전찬혁<small>JEON CHAN HYUK</small></h1>
            <p>Republic of Korea</p>
          </div>
          <div className="profile-photo">
            <Image alt="전찬혁 증명사진" fill priority sizes="42mm" src="/team/jeon-chan-hyuk.png" unoptimized />
          </div>
        </section>

        <section className="profile-grid">
          <div className="profile-main">
            <section>
              <h2>역할</h2>
              <p>제품 기획 · 스마트 컨트랙트 · 프론트엔드 · 테스트 · 기술 문서</p>
            </section>
            <section>
              <h2>경력과 활동</h2>
              <div className="profile-entry"><span>2025.04 — 2025.07</span><strong>Coupang</strong><p>Catalog Operation · Associate</p></div>
              <div className="profile-entry"><span>2026.06</span><strong>NAVER billboard.js</strong><p>Tooltip bug fix upstream 반영 · commit <code>d7cba7f</code></p><a href="https://github.com/naver/billboard.js/commit/d7cba7f391c83a47168e8c9d45a15a7c1b42caf1" rel="noreferrer" target="_blank">Upstream commit <ExternalLink size={10} /></a></div>
            </section>
          </div>

          <aside>
            <section>
              <h2>학력</h2>
              <strong>충남대학교</strong>
              <p>경영학부 · 학사</p>
            </section>
            <section>
              <h2>수상</h2>
              <strong>TradingView The Leap</strong>
              <p>모의투자대회 320 / 49,466<br />Top 500 · 2026</p>
            </section>
            <section>
              <h2>GitHub</h2>
              <a href="https://github.com/jeonsavvy" rel="noreferrer" target="_blank">github.com/jeonsavvy <ExternalLink size={10} /></a>
              <p>WADANG 소스 코드 · 테스트 · 기술 문서</p>
            </section>
          </aside>
        </section>

        <footer><span>Dojang 검증을 참여와 접근 자격으로 연결하는 온체인 마당</span><span>WADANG · 2026</span></footer>
      </article>
    </main>
  );
}
