import { Circle } from "lucide-react";

export function StatusPill({ tone = "neutral", children }: { tone?: string; children: React.ReactNode }) {
  return (
    <span className={`status-pill status-${tone}`}>
      <Circle fill="currentColor" size={7} strokeWidth={0} />
      {children}
    </span>
  );
}
