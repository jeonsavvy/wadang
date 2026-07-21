import type { Metadata } from "next";

import { MadangDetail } from "./madang-detail";

export const metadata: Metadata = { title: "마당 입장" };

export default async function MadangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MadangDetail id={id} />;
}
