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
          <p>이름, 안내문, 기간과 정원을 입력해 마당을 만듭니다. 생성 결과는 GIWA Sepolia에 기록됩니다.</p>
        </div>
      </header>
      <OpenMadangForm />
    </main>
  );
}
