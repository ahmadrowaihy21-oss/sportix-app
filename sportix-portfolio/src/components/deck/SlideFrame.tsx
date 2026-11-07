import type { ReactNode } from "react";
import { SLIDE_COUNT } from "@/lib/portfolio/meta";
import { Confidential } from "./primitives";

type Variant = "standard" | "hero" | "yhh" | "close";

export function SlideFrame({
  n,
  kicker,
  plate,
  overlay = 0.62,
  variant = "standard",
  children,
  hideHeader = false,
}: {
  n: number;
  kicker?: string;
  plate?: string;
  overlay?: number;
  variant?: Variant;
  children: ReactNode;
  hideHeader?: boolean;
}) {
  const isYhh = variant === "yhh";
  const isHero = variant === "hero" || variant === "close";

  return (
    <article className="slide-stage">
      {plate ? (
        <img
          src={plate}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-bg" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: isHero
            ? `linear-gradient(90deg, color-mix(in oklab, var(--color-bg) ${Math.round(overlay * 100 + 18)}%, transparent) 0%, color-mix(in oklab, var(--color-bg) ${Math.round(overlay * 70)}%, transparent) 46%, color-mix(in oklab, var(--color-bg) 42%, transparent) 100%)`
            : `linear-gradient(180deg, color-mix(in oklab, var(--color-bg) ${Math.round(overlay * 100)}%, transparent) 0%, color-mix(in oklab, var(--color-bg) ${Math.round(overlay * 92)}%, transparent) 100%)`,
        }}
      />
      {!plate ? <div className="grid-faint" /> : null}
      <div className="vignette" />
      <div className="noise" />

      {!hideHeader ? (
        <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-16 pt-8">
          <div className="flex items-center gap-4">
            <span className="font-display text-[18px] font-semibold tracking-[0.28em] text-fg">
              SPORTIX AI
            </span>
            <span className="h-4 w-px bg-line-strong" />
            <span className="text-[14px] font-semibold tracking-[0.22em] text-muted uppercase">
              {kicker}
            </span>
          </div>
          <Confidential />
        </header>
      ) : null}

      <div className="relative z-10 h-full px-16 pt-28 pb-20">{children}</div>

      <footer className="absolute right-0 bottom-0 left-0 z-20 flex items-center justify-between px-16 pb-7">
        <span className="text-[13px] tracking-[0.16em] text-subtle uppercase">
          SPORTIX AI · Executive Portfolio
        </span>
        <span className="num text-[15px] text-muted">
          <span style={{ color: isYhh ? "var(--color-gold)" : "var(--color-lime)" }}>
            {String(n).padStart(2, "0")}
          </span>
          <span className="text-subtle"> / {String(SLIDE_COUNT).padStart(2, "0")}</span>
        </span>
      </footer>
    </article>
  );
}
