import { cn } from "@/lib/utils";
import type { StarTierId } from "@/lib/sportix/stars";

const PATH =
  "M12 2.2 14.62 8.4l6.78.74-5.08 4.56 1.42 6.66L12 16.9l-5.74 3.46 1.42-6.66L2.6 9.14l6.78-.74Z";

function StarSvg({
  fill,
  stroke,
  glow,
  className,
}: {
  fill: string;
  stroke: string;
  glow?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {glow ? (
        <path d={PATH} fill={glow} opacity="0.35" transform="translate(0 0.4)" />
      ) : null}
      <path d={PATH} fill={fill} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

export function SponsorStarIcon({
  tier,
  size = "md",
  prestige,
  className,
}: {
  tier: StarTierId;
  size?: "sm" | "md" | "lg" | "xl";
  prestige?: boolean;
  className?: string;
}) {
  const dim =
    size === "sm"
      ? "size-5"
      : size === "md"
        ? "size-8"
        : size === "lg"
          ? "size-12"
          : "size-16";

  if (tier === "signature") {
    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-bg",
          dim,
          prestige && "star-signature-glow",
          className,
        )}
      >
        <img
          src="/media/sportix-signature-star.jpg"
          alt=""
          className="size-full object-cover"
        />
      </span>
    );
  }

  if (tier === "yellow") {
    return (
      <StarSvg
        fill="#f0c94a"
        stroke="#c9a227"
        glow="#f0c94a"
        className={cn(dim, className)}
      />
    );
  }
  if (tier === "silver") {
    return (
      <StarSvg
        fill="#e8eef4"
        stroke="#9aa7b5"
        glow="#d7e2ec"
        className={cn(dim, className)}
      />
    );
  }
  if (tier === "green") {
    return (
      <StarSvg
        fill="#c8f54a"
        stroke="#8fb82e"
        glow="#c8f54a"
        className={cn(dim, className)}
      />
    );
  }
  return (
    <span className={cn("relative inline-flex", dim, className)}>
      <StarSvg fill="#101412" stroke="#f0c94a" className="size-full" />
      <span className="pointer-events-none absolute inset-[28%] rounded-full bg-star-yellow" />
    </span>
  );
}
