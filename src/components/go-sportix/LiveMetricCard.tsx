export function LiveMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-2xl leading-none tabular text-fg">{value}</p>
      <p className="mt-1 text-2xs uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}
