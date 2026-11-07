import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({
  children,
  tone = "lime",
}: {
  children: ReactNode;
  tone?: "lime" | "gold" | "muted";
}) {
  return (
    <p
      className={cn(
        "kicker m-0",
        tone === "gold" && "kicker-gold",
        tone === "muted" && "kicker-muted",
      )}
    >
      {children}
    </p>
  );
}

export function Title({
  children,
  size = "xl",
  className,
}: {
  children: ReactNode;
  size?: "display" | "xl" | "lg" | "md";
  className?: string;
}) {
  const sizeClass =
    size === "display"
      ? "text-[96px]"
      : size === "xl"
        ? "text-[68px]"
        : size === "lg"
          ? "text-[52px]"
          : "text-[40px]";
  return (
    <h1 className={cn("slide-title m-0", sizeClass, className)}>{children}</h1>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("slide-lead m-0", className)}>{children}</p>;
}

export function Rule({ tone = "lime" }: { tone?: "lime" | "gold" }) {
  return <div className={tone === "gold" ? "gold-rule" : "lime-rule"} />;
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "lime" | "gold";
}) {
  return (
    <span
      className={cn(
        "chip",
        tone === "lime" && "chip-lime",
        tone === "gold" && "chip-gold",
      )}
    >
      {children}
    </span>
  );
}

export function Quote({
  children,
  tone = "lime",
}: {
  children: ReactNode;
  tone?: "lime" | "gold";
}) {
  return (
    <blockquote
      className="m-0 border-l-2 pl-6 text-[26px] font-medium leading-snug tracking-tight"
      style={{
        borderColor: tone === "gold" ? "var(--color-gold)" : "var(--color-lime)",
        color: "var(--color-fg)",
        fontFamily: "var(--font-display)",
      }}
    >
      {children}
    </blockquote>
  );
}

export function Panel({
  children,
  className,
  pad = "md",
}: {
  children: ReactNode;
  className?: string;
  pad?: "sm" | "md" | "lg";
}) {
  const p = pad === "sm" ? "p-5" : pad === "lg" ? "p-8" : "p-6";
  return <div className={cn("panel rounded-lg", p, className)}>{children}</div>;
}

export function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.2em] text-subtle">
      {children}
    </p>
  );
}

export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("m-0 text-[18px] leading-relaxed text-muted", className)}>{children}</p>
  );
}

export function Step({
  n,
  label,
  hint,
  tone = "lime",
}: {
  n: string;
  label: string;
  hint?: string;
  tone?: "lime" | "gold";
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span
        className="num text-[13px] font-semibold"
        style={{ color: tone === "gold" ? "var(--color-gold)" : "var(--color-lime)" }}
      >
        {n}
      </span>
      <span className="text-[16px] font-semibold leading-tight tracking-tight text-fg">
        {label}
      </span>
      {hint ? <span className="text-[14px] leading-snug text-subtle">{hint}</span> : null}
    </div>
  );
}

export function Arrow({ tone = "lime" }: { tone?: "lime" | "gold" | "muted" }) {
  const fill =
    tone === "gold"
      ? "var(--color-gold)"
      : tone === "muted"
        ? "var(--color-subtle)"
        : "var(--color-lime)";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0 self-center">
      <path d="M3 9h10M9 4l5 5-5 5" fill="none" stroke={fill} strokeWidth="1.4" />
    </svg>
  );
}

export function BrandImg({
  src,
  alt,
  className,
  shine = "ai",
}: {
  src: string;
  alt: string;
  className?: string;
  shine?: "ai" | "eco" | "sec" | "yal" | "none";
}) {
  return (
    <span className={cn("brand-shine", shine !== "none" && `brand-shine-${shine}`)}>
      <img src={src} alt={alt} className={cn("relative z-[1] shrink-0 object-contain", className)} draggable={false} />
    </span>
  );
}

export function Confidential() {
  return (
    <span className="text-[14px] font-semibold uppercase tracking-[0.22em] text-subtle">
      Confidential · Investment discussion
    </span>
  );
}
