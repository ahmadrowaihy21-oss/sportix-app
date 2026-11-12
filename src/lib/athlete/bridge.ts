import { useAthlete } from "./store.ts";
import { useSportix } from "../sportix/store.ts";
import { useSportId } from "../sport-id/store.ts";
import { VIEWER_ID } from "../sportix/mock.ts";
import type { CommunityPost } from "../sportix/types.ts";

/** Reuse existing UI stores. VIEWER_ID is a synthetic presentation alias, never an auth claim. */
export function syncSyntheticViews() {
  const data = useAthlete.getState().data;
  const posts: CommunityPost[] = data.posts.map((p) => ({
    id: p.id,
    authorId: VIEWER_ID,
    kind: "activity",
    createdAt: "now",
    context: "SYNTHETIC ACTIVITY · NOT VERIFIED",
    media: { src: "", alt: "" },
    caption: p.metrics
      ? `Simulation · ${p.kind} · ${p.metrics.distanceKm.toFixed(2)} KM · ${Math.round(p.metrics.durationSec)} sec`
      : `Simulation · ${p.kind} · metrics private`,
    verification: "unverified",
    engagement: { likeCount: 0, commentCount: 0, repostCount: 0, likedBy: [] },
    sponsor: { topSponsorId: null, extraCount: 0 },
    liked: false,
    saved: false,
    reposted: false,
    athleteProjection: {
      activityId: p.activityId,
      consentVersion: p.consentVersion,
      audience: p.audience,
    },
  }));
  useSportix.setState((s) => ({
    posts: [...posts, ...s.posts.filter((p) => !p.athleteProjection)],
  }));
  useSportId.setState({ integrationRecords: structuredClone(data.sportId) });
}
