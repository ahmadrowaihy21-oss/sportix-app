import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HayvraMark } from "@/components/hayvra/mark";

const NAV = [
  { href: "#platform", label: "Platform" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#journey", label: "Journey" },
  { href: "#privacy", label: "Privacy" },
  { href: "#value", label: "Value" },
  { href: "#team", label: "Team" },
];

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={ref} className="progress" aria-hidden="true" />;
}

export function SiteHeader({ home }: { home: boolean }) {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const hrefFor = (hash: string) => (home ? hash : `/${hash}`);

  return (
    <header className="site-header">
      <ScrollProgress />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <a href={home ? "#top" : "/"} className="flex items-center gap-3 no-underline">
          <HayvraMark className="size-12" />
          <span className="wordmark-sm" lang="en" dir="ltr">
            HAYVRA
          </span>
        </a>
        <nav className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} className="nav-link" href={hrefFor(item.href)}>
              {item.label}
            </a>
          ))}
          <Link to="/demo" className="btn btn-gold">
            Request a demo
          </Link>
        </nav>
        <button
          type="button"
          className="btn btn-line lg:hidden"
          aria-expanded={menu}
          aria-controls="mobile-nav"
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? "Close" : "Menu"}
        </button>
      </div>
      {menu ? (
        <div id="mobile-nav" className="border-t border-gold/20 px-5 py-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                className="nav-link border-b border-gold/15 text-xl"
                href={hrefFor(item.href)}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
            <Link to="/demo" className="btn btn-gold mt-4" onClick={() => setMenu(false)}>
              Request a demo
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 px-5 py-14 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <HayvraMark className="size-14" />
          <div>
            <p className="wordmark-sm" lang="en" dir="ltr">
              HAYVRA
            </p>
            <p className="kicker mt-2" lang="en" dir="ltr">
              Intelligent Hospitality Platform
            </p>
          </div>
        </div>
        <p className="note max-w-3xl">
          What you see here introduces the platform through interactive examples. It does not mean that integrations, devices, or a digital wallet are live in any specific hotel today. Any connection depends on vendor fit, permissions, and installation. SPORTIX Points are issued only by SPORTIX.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="quiet">HAYVRA — Intelligent hospitality platform</p>
          <Link to="/demo" className="nav-link">
            Request a demo
          </Link>
        </div>
      </div>
    </footer>
  );
}
