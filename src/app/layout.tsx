import type { Metadata, Viewport } from "next";

import { wadangRelease } from "@/lib/release";

import "./globals.css";

const homeTitle = "WADANG | Dojang 인증 지갑의 온체인 캠페인";
const homeDescription =
  "기간과 정원을 정해 마당을 열고, Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록하는 온체인 캠페인.";
const brandImage = {
  url: "/wadang-social-card.png",
  width: 1200,
  height: 630,
  alt: "Dojang 인증 지갑의 참여를 온체인에 기록하는 WADANG",
  type: "image/png",
};

export const metadata: Metadata = {
  metadataBase: new URL(wadangRelease.appUrl),
  applicationName: "WADANG",
  title: {
    default: homeTitle,
    template: "%s | WADANG",
  },
  description: homeDescription,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "WADANG",
    title: homeTitle,
    description: homeDescription,
    images: [brandImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [brandImage],
  },
  icons: {
    icon: [{ url: "/wadang-mark.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f3ede1",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
