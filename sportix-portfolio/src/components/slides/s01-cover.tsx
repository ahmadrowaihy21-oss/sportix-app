import { BrandImg, Chip, Confidential } from "@/components/deck/primitives";
import { SLIDE_COUNT } from "@/lib/portfolio/meta";

export function SlideCover() {
  return (
    <article className="slide-stage">
      <img src="/plates/stadium.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #050608 0%, color-mix(in oklab, #050608 90%, transparent) 44%, color-mix(in oklab, #050608 38%, transparent) 100%)",
        }}
      />
      <div className="vignette" />
      <div className="noise" />

      <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-20 pt-10">
        <Chip tone="lime">Founding / Pre-Launch Execution Stage</Chip>
        <Confidential />
      </header>

      <div className="relative z-10 flex h-full items-center px-20 pb-8">
        <div className="flex w-full items-center gap-12">
          <BrandImg
            src="/brand/sportix-intelligence.png"
            alt="SPORTIX Intelligence Systems"
            shine="ai"
            className="h-[560px] w-auto shrink-0"
          />
          <div className="flex max-w-[860px] flex-col gap-6">
            <p className="kicker m-0">Executive Portfolio</p>
            <h1 className="slide-title m-0 text-[92px]">
              Intelligence infrastructure
              <br />
              for sports, fans
              <br />
              <span style={{ color: "var(--color-lime)" }}>& experiences.</span>
            </h1>
            <div className="lime-rule" />
            <p className="m-0 max-w-[46ch] text-[24px] leading-relaxed text-muted">
              A depth document for investment and capital-structuring discussion.
              Designed to sit beside the pitch deck — not replace it.
            </p>
            <p className="m-0 text-[17px] tracking-[0.18em] text-subtle uppercase">
              Prepared for Equivator · Faisal Alsanie · investment partners
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute right-0 bottom-0 left-0 z-20 px-20 pb-7">
        <div className="hairline mb-5" />
        <div className="flex items-end justify-between">
          <p className="m-0 text-[14px] tracking-[0.18em] text-subtle uppercase">
            SPORTIX AI SYSTEMS · SPORTIX ECOSYSTEM · YALLA HAYYIHOM · SECURITY SYSTEMS
          </p>
          <span className="num text-[14px] text-muted">
            <span style={{ color: "var(--color-lime)" }}>01</span>
            <span className="text-subtle"> / {String(SLIDE_COUNT).padStart(2, "0")}</span>
          </span>
        </div>
      </footer>
    </article>
  );
}
