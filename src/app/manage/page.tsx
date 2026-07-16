import type { Metadata } from "next";

import { ManageMadang } from "./manage-madang";

export const metadata: Metadata = { title: "열린 마당" };

export default function ManagePage() {
  return (
    <main className="page-shell container">
      <div className="page-intro">
        <div>
          <span className="eyebrow">ONCHAIN DESK · 열린 마당</span>
          <h1>내가 만든 캠페인과<br />참여 현황을 확인합니다.</h1>
        </div>
        <p>
          별도 데이터베이스 없이 WadangCampaigns에서 데이터를 읽고, 현재 연결된
          운영자 지갑이 만든 캠페인만 보여 줍니다. 여기에서 참여 수를 확인하거나
          캠페인을 닫을 수 있습니다.
        </p>
      </div>
      <ManageMadang />
    </main>
  );
}
