import Link from "next/link";
import type { ReactNode } from "react";

import { WadangMark } from "./wadang-mark";

const navigation = {
  public: [
    { href: "/", label: "제품 소개" },
    { href: "/gasok", label: "제출자료" },
    { href: "/docs", label: "기술문서" },
  ],
  product: [
    { href: "/open", label: "마당 열기" },
    { href: "/manage", label: "내 마당" },
    { href: "/docs", label: "기술문서" },
  ],
} as const;

export function SiteHeader({ action, variant }: { action: ReactNode; variant: keyof typeof navigation }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" prefetch={variant === "public" ? false : null}>
        <WadangMark size={34} />
        <span>WADANG<small>와당</small></span>
      </Link>
      <nav aria-label="주요 탐색">
        {navigation[variant].map((item) => (
          <Link href={item.href} key={item.href} prefetch={variant === "public" ? false : null}>{item.label}</Link>
        ))}
      </nav>
      {action}
    </header>
  );
}
