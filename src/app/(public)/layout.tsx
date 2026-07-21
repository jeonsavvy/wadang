import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <SiteHeader
        action={<Link className="button button-dark site-header-action" href="/open" prefetch={false}>마당 열기</Link>}
        variant="public"
      />
      <div className="content-root" id="main-content" tabIndex={-1}>{children}</div>
      <SiteFooter />
    </>
  );
}
