import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WADANG — Dojang 검증을 참여와 접근 자격으로",
    template: "%s — WADANG",
  },
  description:
    "기간과 정원을 정해 마당을 열고, Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록하는 온체인 캠페인.",
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
