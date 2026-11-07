import { BrandImg, Chip, Confidential } from "@/components/deck/primitives";
import { SignatureStars } from "@/components/deck/SignatureStars";
import { SLIDE_COUNT } from "@/lib/portfolio/meta";

export function SlideClose() {
  return (
    <article className="slide-stage">
      <img src="/plates/stadium.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #050608 10%, color-mix(in oklab, #050608 86%, transparent) 52%, color-mix(in oklab, #050608 42%, transparent) 100%)",
        }}
      />
      <div className="vignette" />
      <div className="noise" />
      <SignatureStars />

      <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-20 pt-10">
        <Chip tone="lime">Second meeting material</Chip>
        <Confidential />
      </header>

      <div className="relative z-10 flex h-full flex-col justify-center px-20">
        <p className="kicker m-0">Closing</p>
        <h1 className="slide-title mt-6 mb-0 max-w-[16ch] text-[88px]">
          Built in Saudi Arabia.
          <br />
          Designed for global scale.
        </h1>
        <div className="lime-rule mt-8" />
        <p className="mt-8 mb-0 max-w-[44ch] text-[24px] leading-relaxed text-muted">
          One intelligence core. Multiple market applications. Multiple revenue engines.
          The pitch deck argues for the investment. This portfolio shows the system.
        </p>
        <div className="mt-12 flex items-end gap-12">
          <BrandImg src="/brand/sportix-intelligence.png" alt="SPORTIX" shine="ai" className="h-[180px] w-auto shrink-0" />
          <BrandImg src="/brand/sportix-ecosystem.png" alt="SPORTIX Ecosystem" shine="eco" className="h-[180px] w-auto shrink-0" />
          <BrandImg src="/brand/yalla-hayyihom.png" alt="Yalla Hayyihom" shine="yal" className="h-[180px] w-auto shrink-0" />
          <BrandImg src="/brand/sportix-security.png" alt="SPORTIX AI Security Systems" shine="sec" className="h-[140px] w-auto shrink-0" />
        </div>
      </div>

      <aside className="sig-lockup absolute top-[38%] right-16 z-20">
        <p className="sig-kicker">An original by</p>
        <p className="sig-name">Ahmad Rowaihy</p>
        <div className="sig-mark">
          <img
            src="/brand/ahmad-rowaihy-signature.png"
            alt="Ahmad Rowaihy"
            className="sig-ink"
            draggable={false}
          />
          <span className="sig-gleam" aria-hidden />
        </div>
      </aside>

      <footer className="absolute right-0 bottom-0 left-0 z-20 px-20 pb-7">
        <div className="hairline mb-5" />
        <div className="flex items-center justify-between">
          <span className="text-[14px] tracking-[0.16em] text-subtle uppercase">
            SPORTIX AI · Founding / Pre-Launch Execution Stage
          </span>
          <span className="num text-[14px] text-muted">
            <span style={{ color: "var(--color-lime)" }}>24</span>
            <span className="text-subtle"> / {String(SLIDE_COUNT).padStart(2, "0")}</span>
          </span>
        </div>
      </footer>
    </article>
  );
}
