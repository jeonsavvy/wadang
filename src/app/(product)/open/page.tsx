import type { Metadata } from "next";

import { OpenMadangForm } from "./open-madang-form";

const title = "마당 열기 | WADANG";
const description =
  "기간과 정원을 정해 마당을 열고 Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록합니다.";
const image = {
  url: "/wadang-social-card.png",
  width: 1200,
  height: 630,
  alt: "Dojang 인증 지갑의 참여를 온체인에 기록하는 WADANG",
  type: "image/png",
};

export const metadata: Metadata = {
  title: "마당 열기",
  description,
  alternates: { canonical: "/open" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "WADANG",
    title,
    description,
    url: "/open",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

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
