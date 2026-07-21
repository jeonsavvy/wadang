import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WalletButton } from "@/components/wallet-button";

export default function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <SiteHeader action={<WalletButton />} variant="product" />
      <div className="content-root" id="main-content" tabIndex={-1}>{children}</div>
      <SiteFooter />
    </Providers>
  );
}
