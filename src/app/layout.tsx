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
    "Dojang 검증을 참여 규칙과 온체인 기록으로 연결하고, 다른 앱이 현재 접근 자격을 확인하게 하는 GIWA-native MVP.",
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
              <span>Dojang 검증을 참여와 접근 자격으로 연결하는 온체인 마당</span>
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
