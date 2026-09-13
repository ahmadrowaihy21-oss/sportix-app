import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { users } from "@/lib/sportix/mock";
import type { CommunityPost } from "@/lib/sportix/types";
import { UserAvatar } from "./UserAvatar";

export function EngagementProofBar({
  post,
  onComments,
}: {
  post: CommunityPost;
  onComments: () => void;
}) {
  const { engagement } = post;
  const leadId = engagement.likedBy.find((id) => users[id] && !users[id]?.isOrg);
  const lead = leadId ? users[leadId] : undefined;
  const others = Math.max(0, engagement.likeCount - (lead ? 1 : 0));
  const avatars = engagement.likedBy.filter((id) => users[id]?.avatar).slice(0, 3);

  if (engagement.likeCount === 0 && engagement.commentCount === 0 && engagement.repostCount === 0) {
    return null;
  }

  const likeLabel = lead
    ? others > 0
      ? `${lead.displayName} and ${others} others`
      : lead.displayName
    : `${engagement.likeCount}`;

  return (
    <button
      type="button"
      onClick={onComments}
      className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left"
      aria-label={`${engagement.likeCount} likes, ${engagement.commentCount} comments, ${engagement.repostCount} reposts`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {avatars.length > 0 ? (
          <span className="flex -space-x-1.5">
            {avatars.map((id) => (
              <UserAvatar key={id} userId={id} size="xs" className="ring-2 ring-bg" />
            ))}
          </span>
        ) : (
          <Heart className="size-3.5 fill-danger text-danger" />
        )}
        <span className="flex items-center gap-1 truncate text-2xs text-muted">
          <Heart className="size-3 fill-danger text-danger" aria-hidden="true" />
          <span className="truncate">{likeLabel}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2.5 text-2xs text-muted">
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3" />
          {engagement.commentCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Repeat2 className="size-3" />
          {engagement.repostCount}
        </span>
      </span>
    </button>
  );
}
