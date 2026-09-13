import { useEffect, useState } from "react";
import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import {
  formatSar,
  STAR_TIER_LIST,
  STAR_TIERS,
  type StarTierId,
} from "@/lib/sportix/stars";
import { Button } from "@/components/ui/button";
import { SponsorStarCard } from "./SponsorStarCard";
import { SponsorStarIcon } from "./SponsorStarIcon";

type Step = "select" | "confirm" | "processing" | "success" | "failed";

export function SponsorStarSelector({
  onPick,
}: {
  onPick: (id: StarTierId) => void;
}) {
  return (
    <div className="space-y-2 pb-4">
      <p className="text-2xs font-medium uppercase tracking-[0.16em] text-lime">
        Choose Your Sponsor Star
      </p>
      <p className="text-xs text-muted">
        Fixed-value sponsorship. Not a reaction, not a chance mechanic.
      </p>
      <div className="space-y-2 pt-2">
        {STAR_TIER_LIST.map((tier) => (
          <SponsorStarCard key={tier.tier_id} tier={tier} onSelect={() => onPick(tier.tier_id)} />
        ))}
      </div>
    </div>
  );
}

export function SponsorConfirmation({
  authorName,
  scope,
  tierId,
  method,
  onMethod,
  onConfirm,
  onCancel,
}: {
  authorName: string;
  scope: "post" | "athlete";
  tierId: StarTierId;
  method: "success" | "failed";
  onMethod: (m: "success" | "failed") => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const tier = STAR_TIERS[tierId];
  return (
    <div className="space-y-4 pb-4">
      <p className="text-sm text-muted">
        You are sponsoring {authorName}
        {scope === "post" ? "'s post" : " as an athlete"}
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
        <SponsorStarIcon tier={tierId} size="lg" prestige={tierId === "signature"} />
        <div>
          <p className="text-sm font-semibold">{tier.name}</p>
          <p className="font-display text-2xl leading-none tabular">{formatSar(tier.gross_amount_sar)}</p>
        </div>
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border">
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-sm text-muted">Total</dt>
          <dd className="font-display text-lg tabular">{formatSar(tier.gross_amount_sar)}</dd>
        </div>
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-sm text-muted">Creator receives</dt>
          <dd className="font-display text-lg tabular">{formatSar(tier.creator_allocation_sar)}</dd>
        </div>
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-sm text-muted">SPORTIX</dt>
          <dd className="font-display text-lg tabular">{formatSar(tier.sportix_allocation_sar)}</dd>
        </div>
      </dl>
      <p className="text-2xs text-muted">Amounts are founder-locked. No VAT or fees in this prototype.</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onMethod("success")}
          className={
            method === "success"
              ? "rounded-md border border-lime bg-lime/10 px-3 py-2.5 text-2xs font-medium"
              : "rounded-md border border-border px-3 py-2.5 text-2xs text-muted"
          }
        >
          Mada ··4242
        </button>
        <button
          type="button"
          onClick={() => onMethod("failed")}
          className={
            method === "failed"
              ? "rounded-md border border-warn bg-warn/10 px-3 py-2.5 text-2xs font-medium"
              : "rounded-md border border-border px-3 py-2.5 text-2xs text-muted"
          }
        >
          Card ··0002
        </button>
      </div>
      <Button className="w-full" onClick={onConfirm}>
        Confirm SPORTIX SPONSOR
      </Button>
      <Button className="w-full" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

export function SponsorPaymentState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <span className="size-8 animate-spin rounded-full border-2 border-border border-t-lime" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function SponsorSuccessState({
  authorName,
  tierId,
  viewLabel,
  onView,
  onDone,
}: {
  authorName: string;
  tierId: StarTierId;
  viewLabel: string;
  onView: () => void;
  onDone: () => void;
}) {
  const tier = STAR_TIERS[tierId];
  return (
    <div className="space-y-4 py-4 text-center">
      <p className="text-2xs font-medium uppercase tracking-[0.16em] text-lime">
        SPORTIX SPONSOR SUCCESSFUL
      </p>
      <div className="flex justify-center">
        <SponsorStarIcon tier={tierId} size="xl" prestige={tierId === "signature"} />
      </div>
      <p className="font-display text-2xl leading-none">{tier.name}</p>
      <p className="text-sm text-muted">
        {authorName} received a SPORTIX SPONSOR.
      </p>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button variant="outline" onClick={onView}>
          {viewLabel}
        </Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

export function SponsorFlow({
  postId,
  userId,
  scope,
}: {
  postId?: string;
  userId?: string;
  scope: "post" | "athlete";
}) {
  const posts = useSportix((s) => s.posts);
  const closeSheet = useSportix((s) => s.closeSheet);
  const completeSponsorship = useSportix((s) => s.completeSponsorship);
  const canSponsor = useSportix((s) => s.canSponsor);
  const setTab = useSportix((s) => s.setTab);
  const closeAll = useSportix((s) => s.closeAll);

  const post = postId ? posts.find((p) => p.id === postId) : undefined;
  const athleteId = scope === "post" ? post?.authorId : userId;
  const author = athleteId ? users[athleteId] : undefined;

  const [step, setStep] = useState<Step>("select");
  const [tierId, setTierId] = useState<StarTierId | null>(null);
  const [method, setMethod] = useState<"success" | "failed">("success");

  const gate = athleteId ? canSponsor(athleteId, postId) : { ok: false, reason: "Unavailable" };

  useEffect(() => {
    if (step !== "processing" || !tierId || !athleteId) return;
    const t = window.setTimeout(() => {
      const record = completeSponsorship({
        postId,
        athleteId,
        scope,
        tierId,
        outcome: method,
      });
      setStep(record && method === "success" ? "success" : "failed");
    }, 1100);
    return () => window.clearTimeout(t);
  }, [step, tierId, athleteId, method, completeSponsorship, postId, scope]);

  if (!author || !athleteId) return null;

  if (!gate.ok) {
    return (
      <div className="py-6">
        <p className="text-sm text-muted">{gate.reason}</p>
        <p className="mt-2 text-2xs text-faint">
          Safety, eligibility and privacy sit above SPORTIX SPONSOR MOMENTUM.
        </p>
        <Button className="mt-4 w-full" variant="muted" onClick={closeSheet}>
          Close
        </Button>
      </div>
    );
  }

  if (step === "select") {
    return (
      <SponsorStarSelector
        onPick={(id) => {
          setTierId(id);
          setStep("confirm");
        }}
      />
    );
  }

  if (step === "confirm" && tierId) {
    return (
      <SponsorConfirmation
        authorName={author.displayName}
        scope={scope}
        tierId={tierId}
        method={method}
        onMethod={setMethod}
        onConfirm={() => setStep("processing")}
        onCancel={closeSheet}
      />
    );
  }

  if (step === "processing") {
    return <SponsorPaymentState label="Processing SPORTIX SPONSOR" />;
  }

  if (step === "failed") {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-sm font-semibold">Payment failed</p>
        <p className="text-xs text-muted">No sponsorship was recorded. Retry with another method.</p>
        <Button className="w-full" onClick={() => setStep("confirm")}>
          Retry
        </Button>
        <Button className="w-full" variant="ghost" onClick={closeSheet}>
          Cancel
        </Button>
      </div>
    );
  }

  if (step === "success" && tierId) {
    return (
      <SponsorSuccessState
        authorName={author.displayName}
        tierId={tierId}
        viewLabel={scope === "post" ? "View Post" : "View Profile"}
        onView={() => {
          if (scope === "post") {
            closeAll();
            setTab("feed");
          } else {
            closeSheet();
          }
        }}
        onDone={() => {
          closeSheet();
          setTab("discover");
        }}
      />
    );
  }

  return null;
}
