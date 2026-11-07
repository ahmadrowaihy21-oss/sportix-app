import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsChrome } from "@/components/deck/DocsChrome";
import { SLIDES } from "@/lib/portfolio/meta";

export const Route = createFileRoute("/outline")({
  component: OutlinePage,
});

function OutlinePage() {
  return (
    <DocsChrome
      kicker="Working papers"
      title="Page-by-page outline"
    >
      <p className="m-0 mb-10 max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Twenty-four pages. Each row is the page title, the job of the page, the single
        message, the source used, and the visual idea. This is the editorial spine behind
        the portfolio — not a substitute for it.
      </p>
      <div className="flex flex-col gap-6">
        {SLIDES.map((s) => (
          <article key={s.id} className="panel rounded-lg p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="num m-0 text-[12px] text-lime">{String(s.n).padStart(2, "0")}</p>
              <Link
                to="/"
                search={{ s: s.n }}
                className="text-[12px] tracking-[0.14em] text-muted uppercase hover:text-lime"
              >
                Open slide
              </Link>
            </div>
            <h2 className="mt-2 mb-1 font-display text-[24px] font-medium tracking-tight">{s.title}</h2>
            <p className="m-0 text-[12px] tracking-[0.16em] text-subtle uppercase">{s.kicker}</p>
            <dl className="mt-5 grid gap-3 text-[15px]">
              <Row label="Objective" value={s.objective} />
              <Row label="Main message" value={s.message} />
              <Row label="Evidence / source" value={s.source} />
              <Row label="Visual concept" value={s.visual} />
            </dl>
          </article>
        ))}
      </div>
    </DocsChrome>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="m-0 text-[11px] font-semibold tracking-[0.18em] text-subtle uppercase">{label}</dt>
      <dd className="mt-1 mb-0 leading-relaxed text-fg">{value}</dd>
    </div>
  );
}
