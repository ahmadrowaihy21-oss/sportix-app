import { useEffect } from "react";

/** View-only guard for confidential advisory material. */
export function ViewProtect() {
  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const events = ["copy", "cut", "paste", "contextmenu", "dragstart", "drop", "selectstart"] as const;
    events.forEach((ev) => document.addEventListener(ev, block, true));

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const combo = e.ctrlKey || e.metaKey;
      if (combo && ["s", "p", "u", "c", "x", "a"].includes(k)) {
        e.preventDefault();
        return;
      }
      if (k === "f12" || k === "printscreen") e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);

    return () => {
      events.forEach((ev) => document.removeEventListener(ev, block, true));
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-32deg, transparent 0 140px, rgba(198,255,0,.55) 140px 141px)",
      }}
      aria-hidden
    >
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] font-display text-[42px] font-semibold tracking-[0.32em] text-lime whitespace-nowrap">
        SPORTIX AI · CONFIDENTIAL · VIEW ONLY
      </span>
    </div>
  );
}
