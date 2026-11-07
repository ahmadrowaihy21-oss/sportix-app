import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  List,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import { SLIDES, SLIDE_COUNT } from "@/lib/portfolio/meta";
import { SLIDE_COMPONENTS } from "@/components/slides/registry";
import { cn } from "@/lib/utils";
import { Starfield } from "@/components/deck/Starfield";

export function DeckShell({
  index,
  onIndex,
}: {
  index: number;
  onIndex: (n: number) => void;
}) {
  const [overview, setOverview] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scale, setScale] = useState(0.45);

  const safeIndex = Math.min(Math.max(index, 1), SLIDE_COUNT);
  const slide = SLIDES[safeIndex - 1];
  const Slide = slide ? SLIDE_COMPONENTS[slide.id] : SLIDE_COMPONENTS.cover;

  const go = useCallback(
    (n: number) => {
      onIndex(Math.min(Math.max(n, 1), SLIDE_COUNT));
      setOverview(false);
    },
    [onIndex],
  );

  useEffect(() => {
    const fit = () => {
      const chrome = 96;
      const w = Math.max(window.innerWidth - 8, 320);
      const h = Math.max(window.innerHeight - chrome, 200);
      setScale(Math.min(w / 1920, h / 1080));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (e.key !== "Escape" && target?.closest?.("button, a, input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(safeIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(safeIndex - 1);
      } else if (e.key === "Home") go(1);
      else if (e.key === "End") go(SLIDE_COUNT);
      else if (e.key === "Escape") {
        setOverview(false);
        setMenu(false);
      } else if (e.key === "g" || e.key === "o") setOverview((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, safeIndex]);

  const progress = useMemo(() => (safeIndex / SLIDE_COUNT) * 100, [safeIndex]);

  return (
    <div className="relative flex h-dvh flex-col bg-bg text-fg">
      <Starfield />
      <header className="no-print relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-line px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-sm text-muted hover:text-fg"
            onClick={() => setMenu((v) => !v)}
            aria-label="Menu"
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="min-w-0">
            <p className="m-0 truncate text-[13px] font-semibold tracking-[0.2em] text-lime uppercase">
              SPORTIX AI
            </p>
            <p className="m-0 truncate text-[15px] text-muted">{slide?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn label="Overview" onClick={() => setOverview((v) => !v)}>
            <Grid2x2 className="size-4" />
          </IconBtn>
          <Link
            to="/outline"
            className="hidden items-center gap-2 rounded-sm px-3 py-2 text-[12px] tracking-[0.12em] text-muted uppercase hover:text-fg md:flex"
          >
            <List className="size-4" /> Outline
          </Link>
          <Link
            to="/diligence"
            className="hidden items-center gap-2 rounded-sm px-3 py-2 text-[12px] tracking-[0.12em] text-muted uppercase hover:text-fg md:flex"
          >
            <ShieldAlert className="size-4" /> Diligence
          </Link>
        </div>
      </header>

      {menu ? (
        <div className="no-print absolute top-14 left-0 z-40 w-80 max-w-[90vw] border-r border-b border-line bg-surface p-4 shadow-soft">
          <NavLink href="/" label="Portfolio" />
          <NavLink href="/outline" label="Page-by-page outline" />
          <NavLink href="/diligence" label="Claims & NDA notes" />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3">
        <div
          className="relative"
          style={{ width: 1920 * scale, height: 1080 * scale }}
        >
          <div
            className="absolute top-0 left-0 shadow-soft"
            style={{
              width: 1920,
              height: 1080,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Slide />
          </div>
        </div>
        {overview ? (
          <div className="no-print absolute inset-0 z-30 overflow-auto bg-bg/95 p-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SLIDES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.n)}
                  className={cn(
                    "panel rounded-md p-4 text-left",
                    s.n === safeIndex && "border-lime",
                  )}
                >
                  <span className="num text-[11px] text-lime">{String(s.n).padStart(2, "0")}</span>
                  <p className="mt-2 mb-1 font-display text-[18px] font-medium tracking-tight">
                    {s.title}
                  </p>
                  <p className="m-0 text-[13px] text-muted">{s.message}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <footer className="no-print relative z-10 flex h-14 shrink-0 items-center justify-between border-t border-line px-3 md:px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-line">
          <div className="h-px bg-lime" style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-sm px-3 text-[13px] text-muted hover:text-fg disabled:opacity-30"
          onClick={() => go(safeIndex - 1)}
          disabled={safeIndex <= 1}
        >
          <ChevronLeft className="size-4" /> Prev
        </button>
        <p className="num m-0 text-[13px] text-muted">
          {String(safeIndex).padStart(2, "0")} / {String(SLIDE_COUNT).padStart(2, "0")}
        </p>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-sm px-3 text-[13px] text-muted hover:text-fg disabled:opacity-30"
          onClick={() => go(safeIndex + 1)}
          disabled={safeIndex >= SLIDE_COUNT}
        >
          Next <ChevronRight className="size-4" />
        </button>
      </footer>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-sm text-muted hover:text-fg"
    >
      {children}
    </button>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const className =
    "block rounded-sm px-3 py-3 text-[14px] text-fg hover:bg-surface-2";
  if (href === "/") {
    return (
      <Link to="/" search={{ s: 1 }} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}
