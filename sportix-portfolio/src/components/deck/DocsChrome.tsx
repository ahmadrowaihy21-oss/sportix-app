import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function DocsChrome({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-5 backdrop-blur-sm">
        <Link to="/" search={{ s: 1 }} className="flex items-center gap-3">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-lime uppercase">
            SPORTIX AI
          </span>
          <span className="text-[13px] text-muted">Executive Portfolio</span>
        </Link>
        <nav className="flex items-center gap-1 text-[12px] tracking-[0.12em] uppercase">
          <Link to="/" search={{ s: 1 }} className="rounded-sm px-3 py-2 text-muted hover:text-fg">
            Deck
          </Link>
          <Link to="/outline" className="rounded-sm px-3 py-2 text-muted hover:text-fg">
            Outline
          </Link>
          <Link to="/diligence" className="rounded-sm px-3 py-2 text-muted hover:text-fg">
            Diligence
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <p className="kicker m-0">{kicker}</p>
        <h1 className="slide-title mt-4 mb-3 text-[44px] md:text-[56px]">{title}</h1>
        <div className="lime-rule mb-10" />
        {children}
      </main>
    </div>
  );
}
