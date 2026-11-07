import { createFileRoute } from "@tanstack/react-router";
import { DocsChrome } from "@/components/deck/DocsChrome";
import { CLAIMS_REQUIRING_VALIDATION, NDA_ONLY } from "@/lib/portfolio/diligence";

export const Route = createFileRoute("/diligence")({
  component: DiligencePage,
});

function DiligencePage() {
  return (
    <DocsChrome kicker="Before external use" title="Diligence notes">
      <p className="m-0 mb-6 max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Two lists that travel with the portfolio. The first is every claim that still needs
        an evidence gate before it is spoken loosely. The second is material that was
        deliberately kept out of the portfolio and belongs in an NDA room.
      </p>
      <p className="mb-12 max-w-[62ch] text-[13px] tracking-[0.12em] text-subtle uppercase">
        View only · files are not offered for download
      </p>

      <h2 className="font-display mt-0 mb-4 text-[28px] font-medium tracking-tight">
        Claims requiring validation before external use
      </h2>
      <div className="mb-16 flex flex-col gap-4">
        {CLAIMS_REQUIRING_VALIDATION.map((c) => (
          <article key={c.claim} className="panel rounded-lg p-5">
            <h3 className="mt-0 mb-2 font-display text-[18px] font-semibold tracking-tight">
              {c.claim}
            </h3>
            <p className="m-0 text-[12px] tracking-[0.14em] text-lime uppercase">{c.location}</p>
            <p className="mt-3 mb-1 text-[14px] leading-relaxed text-muted">
              <span className="text-fg">Risk. </span>
              {c.risk}
            </p>
            <p className="m-0 text-[14px] leading-relaxed text-muted">
              <span className="text-fg">Required. </span>
              {c.required}
            </p>
          </article>
        ))}
      </div>

      <h2 className="font-display mt-0 mb-4 text-[28px] font-medium tracking-tight">
        Recommended NDA-only materials not included
      </h2>
      <div className="flex flex-col gap-4">
        {NDA_ONLY.map((n) => (
          <article key={n.item} className="panel rounded-lg p-5">
            <h3 className="mt-0 mb-2 font-display text-[18px] font-semibold tracking-tight">
              {n.item}
            </h3>
            <p className="m-0 text-[14px] leading-relaxed text-muted">{n.reason}</p>
          </article>
        ))}
      </div>
    </DocsChrome>
  );
}
