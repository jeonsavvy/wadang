import type { Metadata } from "next";

import { MadangDetail } from "./madang-detail";

type MadangPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: MadangPageProps): Promise<Metadata> {
  const { id } = await params;
  const validId = /^[1-9]\d*$/.test(id);
  const pageTitle = validId ? `마당 #${id}` : "마당 입장";
  const title = `${pageTitle} | WADANG`;
  const description = validId
    ? `GIWA Sepolia 마당 #${id}의 상태와 Dojang 인증 지갑 참여 조건을 확인합니다.`
    : "GIWA Sepolia 마당의 상태와 Dojang 인증 지갑 참여 조건을 확인합니다.";
  const path = `/madang/${encodeURIComponent(id)}`;
  const image = {
    url: "/wadang-social-card.png",
    width: 1200,
    height: 630,
    alt: "Dojang 인증 지갑의 참여를 온체인에 기록하는 WADANG",
    type: "image/png",
  };

  return {
    title: pageTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "WADANG",
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function MadangPage({ params }: MadangPageProps) {
  const { id } = await params;
  return <MadangDetail id={id} />;
}
