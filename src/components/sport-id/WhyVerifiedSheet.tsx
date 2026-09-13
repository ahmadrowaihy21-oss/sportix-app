import { BottomSheet } from "@/components/sportix/BottomSheet";
import type { EvidenceEnvelope } from "@/lib/sport-id/types";
import { EvidenceQualityCard, EvidenceSourceList } from "./EvidenceBits";

export function WhyVerifiedSheet({
  open,
  onClose,
  title,
  evidence,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  evidence: EvidenceEnvelope | null;
}) {
  if (!evidence) return null;
  return (
    <BottomSheet open={open} onClose={onClose} title="Why verified?" height="tall">
      <div className="space-y-4 pb-6">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-2xs text-muted">
          Session-specific evidence. These percentages are for this metric — not a global SPORTIX accuracy claim.
        </p>
        <EvidenceQualityCard evidence={evidence} />
        <div>
          <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Independent sources
          </p>
          <EvidenceSourceList sources={evidence.sources} />
        </div>
      </div>
    </BottomSheet>
  );
}
