import { Camera, Cpu, Footprints, Radio, Watch } from "lucide-react";
import type { EvidenceEnvelope, EvidenceSource } from "@/lib/sport-id/types";
import { VerificationStatus } from "./SportStatusBadge";

export function EvidenceSourceList({ sources }: { sources: EvidenceSource[] }) {
  return (
    <ul className="space-y-2">
      {sources.map((s) => (
        <li key={s.id} className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2 text-sm">
          <SourceIcon className={s.className} />
          <span className="flex-1">{s.label}</span>
          <span className="text-2xs uppercase tracking-wide text-muted">{s.quality}</span>
        </li>
      ))}
    </ul>
  );
}

function SourceIcon({ className }: { className: EvidenceSource["className"] }) {
  const cls = "size-4 text-lime";
  if (className === "vision") return <Camera className={cls} />;
  if (className === "foot-sensor") return <Footprints className={cls} />;
  if (className === "watch") return <Watch className={cls} />;
  if (className === "uwb") return <Radio className={cls} />;
  return <Cpu className={cls} />;
}

export function EvidenceQualityCard({ evidence }: { evidence: EvidenceEnvelope }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-3">
      <VerificationStatus state={evidence.state} />
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-2xs text-muted">Evidence quality</dt>
          <dd className="capitalize">{evidence.quality}</dd>
        </div>
        <div>
          <dt className="text-2xs text-muted">Coverage</dt>
          <dd className="tabular">{evidence.coveragePct}%</dd>
        </div>
        <div>
          <dt className="text-2xs text-muted">Calibrated confidence</dt>
          <dd className="tabular">{evidence.confidencePct}%</dd>
        </div>
        <div>
          <dt className="text-2xs text-muted">Human review</dt>
          <dd className="capitalize">{evidence.humanReview.replace("-", " ")}</dd>
        </div>
        <div>
          <dt className="text-2xs text-muted">Sessions used</dt>
          <dd className="tabular">{evidence.sessionsUsed}</dd>
        </div>
        <div>
          <dt className="text-2xs text-muted">Last updated</dt>
          <dd>{evidence.lastUpdated}</dd>
        </div>
      </dl>
      <p className="text-3xs text-faint">Model / service {evidence.modelVersion}</p>
      <p className="text-2xs text-muted">{evidence.limitations[0]}</p>
    </div>
  );
}
