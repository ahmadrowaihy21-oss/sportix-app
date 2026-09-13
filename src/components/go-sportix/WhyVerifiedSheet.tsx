import { BottomSheet } from "@/components/sportix/BottomSheet";
import { ACTIVITIES } from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";

export function WhyVerifiedSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const session = useGo((s) => s.session);
  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];
  const verified = session.state === "VERIFIED_COMPLETED";
  const rows = [
    ["Session Identity", true],
    ["GPS", true],
    ["Route", true],
    ["Time", true],
    ["Health / Watch", true],
    ["Media Evidence", Boolean(session.media)],
  ] as const;

  return (
    <BottomSheet open={open} onClose={onClose} title="SPORTIX EVIDENCE" height="tall">
      <div className="space-y-4 px-4 pb-8">
        <p className="text-sm text-muted">
          Media supports verification. It does not replace activity data.
        </p>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-bg">
          {rows.map(([k, ok]) => (
            <li key={k} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{k}</span>
              <span className={ok ? "font-semibold text-lime" : "text-faint"}>{ok ? "✓" : "○"}</span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-border bg-bg p-3">
            <dt className="text-2xs text-muted">Media type</dt>
            <dd className="mt-1 font-semibold">{session.media?.subject_type ?? "—"}</dd>
          </div>
          <div className="rounded-xl border border-border bg-bg p-3">
            <dt className="text-2xs text-muted">Evidence quality</dt>
            <dd className="mt-1 font-semibold text-lime">{verified ? "HIGH" : "PENDING"}</dd>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-bg p-3">
            <dt className="text-2xs text-muted">Verification</dt>
            <dd className="mt-1 font-semibold text-lime">
              {verified ? "SPORTIX VERIFIED" : session.state.replaceAll("_", " ")}
            </dd>
          </div>
        </dl>
        <p className="text-3xs text-faint">
          {cfg.label} session {session.id}. Protected model internals are not shown.
        </p>
      </div>
    </BottomSheet>
  );
}
