import Image from "next/image";

export function WadangMark({ size = 38, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`wadang-mark ${className}`}
      height={size}
      src="/wadang-mark.svg"
      width={size}
    />
  );
}

export function WadangStamp({ label = "DOJANG VERIFIED" }: { label?: string }) {
  return (
    <span className="wadang-stamp" aria-label={label}>
      <WadangMark size={44} />
      <b>{label}</b>
    </span>
  );
}
