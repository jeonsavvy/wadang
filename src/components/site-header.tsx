import Link from "next/link";

import { WadangMark } from "./wadang-mark";
import { WalletButton } from "./wallet-button";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        <WadangMark size={34} />
        <span>WADANG<small>와당</small></span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/open">마당 열기</Link>
        <Link href="/manage">열린 마당</Link>
        <Link href="/docs">기술문서</Link>
      </nav>
      <WalletButton />
    </header>
  );
}
