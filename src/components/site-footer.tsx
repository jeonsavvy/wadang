import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>WADANG · 와당</strong>
        <span>Dojang 인증 지갑이 참여하는 GIWA 온체인 캠페인</span>
      </div>
      <div className="footer-links">
        <Link href="/gasok" prefetch={false}>GASOK 제출자료</Link>
        <a href="https://giwa.io/gasok" rel="noreferrer" target="_blank">GASOK ↗</a>
        <a href="https://docs.giwa.io/giwa-chain/en/giwa-ecosystem/dojang" rel="noreferrer" target="_blank">Dojang docs ↗</a>
        <a href="https://sepolia-explorer.giwa.io" rel="noreferrer" target="_blank">Explorer ↗</a>
      </div>
    </footer>
  );
}
