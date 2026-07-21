import type { Metadata } from "next";

import { OpenMadangForm } from "./open-madang-form";

export const metadata: Metadata = { title: "마당 열기" };

export default function OpenPage() {
  return (
    <main className="page-shell product-shell container">
      <header className="product-page-head product-page-head-compact">
        <div>
          <span className="product-kicker">운영</span>
          <h1>마당 만들기</h1>
          <p>캠페인 이름, 기간과 정원을 입력해 GIWA Sepolia에 기록합니다.</p>
        </div>
      </header>
      <OpenMadangForm />
    </main>
  );
}
