import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { CommunityPostCard } from "@/components/sportix/CommunityPost";
import { useSportix } from "@/lib/sportix/store";
import { useSportId } from "@/lib/sport-id/store";
import { useGo } from "@/lib/go-sportix/store";
import { ACTIVITIES, formatKm } from "@/lib/go-sportix/format";

import { ActivityAudienceChip } from "./ActivityAudienceChip";

export function VerifiedActivityPostView() {
  const session = useGo((s) => s.session);
  const goHome = useGo((s) => s.goHome);
  const audience = useGo((s) => s.audience);
  const posts = useSportix((s) => s.posts);
  const navigate = useNavigate();

  const post = posts.find((p) => p.id === session?.postId);
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
      <ScreenHeader
        title="Activity simulation"
        subtitle={cfg.sportLabel}
        onBack={goHome}
      />
      <div className="flex items-center justify-between px-4 py-3">
        <ActivityAudienceChip audience={audience} />
        {session.sportIdRecordId ? (
          <span className="text-2xs text-lime">SPORT ID TEST RECORD</span>
        ) : null}
      </div>
      {post ? (
        <CommunityPostCard post={post} />
      ) : (
        <p className="px-4 text-sm text-muted">
          Private activity. Choose a sharing audience explicitly to make a
          synthetic post available.
        </p>
      )}
      <div className="space-y-2 px-4 pt-4">
        <p className="text-sm text-muted">
          Simulation only. No verified metrics or rewards were added.
        </p>
        <Button variant="outline" className="w-full" onClick={openSportId}>
          VIEW IN SPORT ID
        </Button>
        <Button
          className="w-full"
          variant="muted"
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
        {formatKm(session.distanceKm)} KM · media stays in this browser and is
        never copied to the community projection.
      </p>
    </div>
  );
}
