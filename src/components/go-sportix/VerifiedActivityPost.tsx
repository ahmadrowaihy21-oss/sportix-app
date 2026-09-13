import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { CommunityPostCard } from "@/components/sportix/CommunityPost";
import { useSportix } from "@/lib/sportix/store";
import { useSportId } from "@/lib/sport-id/store";
import { useGo } from "@/lib/go-sportix/store";
import { ACTIVITIES, formatKm } from "@/lib/go-sportix/format";
import { useWeekly } from "@/lib/weekly-legends/store";
import { WhyVerifiedSheet } from "./WhyVerifiedSheet";
import { ActivityAudienceChip } from "./ActivityAudienceChip";

export function VerifiedActivityPostView() {
  const session = useGo((s) => s.session);
  const goHome = useGo((s) => s.goHome);
  const audience = useGo((s) => s.audience);
  const posts = useSportix((s) => s.posts);
  const navigate = useNavigate();
  const [why, setWhy] = useState(false);
  const post = posts.find((p) => p.id === session?.postId);
  const lastMove = useWeekly((s) => s.lastMove);
  const entered = useWeekly((s) => s.enteredFromWeekly);

  useEffect(() => {
    if (!entered || session?.state !== "VERIFIED_COMPLETED") return;
    const t = window.setTimeout(() => void navigate({ to: "/weekly-legends" }), 2200);
    return () => window.clearTimeout(t);
  }, [entered, session?.state, navigate]);

  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];

  const openSportId = () => {
    const sport =
      session.activity === "hiking" || session.activity === "walking"
        ? "walking"
        : session.activity === "cycling"
          ? "cycling"
          : "running";
    useSportId.getState().setSelected(sport);
    useSportId.getState().closeAll();
    void navigate({ to: "/sport-id" });
  };

  return (
    <div className="pb-10">
      <ScreenHeader title="Verified activity post" subtitle={cfg.sportLabel} onBack={goHome} />
      <div className="flex items-center justify-between px-4 py-3">
        <ActivityAudienceChip audience={audience} />
        {session.state === "VERIFIED_COMPLETED" ? (
          <span className="text-2xs font-semibold text-lime">SPORT ID UPDATED</span>
        ) : null}
      </div>
      {lastMove && session.state === "VERIFIED_COMPLETED" ? (
        <p className="px-4 pb-2 text-sm font-semibold text-lime">
          Weekly Legends #{lastMove.from} → #{lastMove.to} · +{lastMove.sspTo - lastMove.sspFrom} SSP AI
        </p>
      ) : null}
      {post ? <CommunityPostCard post={post} /> : (
        <p className="px-4 text-sm text-muted">Post unavailable.</p>
      )}
      <div className="space-y-2 px-4 pt-4">
        <Button className="w-full" onClick={() => setWhy(true)}>
          WHY VERIFIED?
        </Button>
        <Button variant="outline" className="w-full" onClick={openSportId}>
          VIEW IN SPORT ID
        </Button>
        <Button
          className="w-full"
          variant={entered ? "lime" : "muted"}
          onClick={() => void navigate({ to: "/weekly-legends" })}
        >
          SEE WEEKLY LEGENDS
        </Button>
        <Button
          variant="muted"
          className="w-full"
          onClick={() => {
            useSportix.getState().setTab("feed");
            useSportix.getState().closeAll();
            void navigate({ to: "/communities" });
          }}
        >
          Open in Communities
        </Button>
      </div>
      <p className="px-4 pt-3 text-2xs text-faint">
        {formatKm(session.distanceKm)} KM · this is the same attached evidence used for verification.
      </p>
      <WhyVerifiedSheet open={why} onClose={() => setWhy(false)} />
    </div>
  );
}
