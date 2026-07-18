import type { Metadata } from "next";
import Link from "next/link";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WADANG — Dojang 검증을 참여와 접근 자격으로",
    template: "%s — WADANG",
  },
  description:
    "기간과 정원을 정해 마당을 열고, Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록하는 온체인 캠페인.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <div>
              <strong>WADANG · 와당</strong>
              <span>Dojang 인증 지갑이 참여하는 GIWA 온체인 캠페인</span>
            </div>
            <div className="footer-links">
              <Link href="/gasok">GASOK 제출자료</Link>
              <a href="https://giwa.io/gasok" rel="noreferrer" target="_blank">
                GASOK ↗
              </a>
              <a href="https://docs.giwa.io/giwa-chain/en/giwa-ecosystem/dojang" rel="noreferrer" target="_blank">
                Dojang docs ↗
              </a>
              <a href="https://sepolia-explorer.giwa.io" rel="noreferrer" target="_blank">
                Explorer ↗
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
