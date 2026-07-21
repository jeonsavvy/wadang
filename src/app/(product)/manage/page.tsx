import type { Metadata } from "next";

import { ManageMadang } from "./manage-madang";

export const metadata: Metadata = { title: "내 마당" };

export default function ManagePage() {
  return (
    <main className="page-shell product-shell container">
      <ManageMadang />
    </main>
  );
}
