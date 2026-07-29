import type { Metadata } from "next";

import { ManageMadang } from "./manage-madang";

const title = "내 마당 | WADANG";
const description =
  "연결한 운영자 지갑이 만든 GIWA Sepolia 캠페인의 상태, 참여 수와 공유 링크를 확인합니다.";
const image = {
  url: "/wadang-social-card.png",
  width: 1200,
  height: 630,
  alt: "Dojang 인증 지갑의 참여를 온체인에 기록하는 WADANG",
  type: "image/png",
};

export const metadata: Metadata = {
  title: "내 마당",
  description,
  alternates: { canonical: "/manage" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "WADANG",
    title,
    description,
    url: "/manage",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default function ManagePage() {
  return (
    <main className="page-shell product-shell container">
      <ManageMadang />
    </main>
  );
}
