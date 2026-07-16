import type { Metadata } from "next";

import { OpenMadangForm } from "./open-madang-form";

export const metadata: Metadata = { title: "마당 열기" };

export default function OpenPage() {
  return (
    <main className="page-shell container">
      <div className="page-intro">
        <div>
          <span className="eyebrow">ORGANIZER DESK · 운영자</span>
          <h1>참여 규칙이 있는<br />첫 마당을 엽니다.</h1>
        </div>
        <p>
          이름, 안내문, 기간과 정원을 설정하면 GIWA Sepolia에 기록됩니다.
          WADANG은 Dojang 테스트 인증, 중복 여부와 참여 기록을 처리합니다.
          실제 혜택 제공과 여러 인증 조건은 현재 MVP 범위에 포함하지 않습니다.
        </p>
      </div>
      <OpenMadangForm />
    </main>
  );
}
