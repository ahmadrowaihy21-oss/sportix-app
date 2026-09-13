import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/lib/sportix/types";
import { SportixSponsorButton } from "./sponsor/SportixSponsorButton";

function Action({
  label,
  active,
  activeClass,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-muted transition-colors duration-150 hover:text-fg",
        active && activeClass,
      )}
    >
      {children}
      <span className="text-3xs font-medium">{label}</span>
    </button>
  );
}

export function CommunityActionBar({
  post,
  onLike,
  onComment,
  onRepost,
  onSponsor,
  onSave,
}: {
  post: CommunityPost;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onSponsor: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-stretch border-t border-border px-1">
      <Action
        label="Like"
        active={post.liked}
        activeClass="text-danger"
        onClick={onLike}
      >
        <Heart
          className={cn("size-5 transition-transform duration-150", post.liked && "scale-110 fill-danger")}
        />
      </Action>
      <Action label="Comment" onClick={onComment}>
        <MessageCircle className="size-5" />
      </Action>
      <Action
        label="Repost"
        active={post.reposted}
        activeClass="text-fg"
        onClick={onRepost}
      >
        <Repeat2 className={cn("size-5", post.reposted && "text-fg")} />
      </Action>
      <SportixSponsorButton onClick={onSponsor} />
      <Action
        label="Save"
        active={post.saved}
        activeClass="text-fg"
        onClick={onSave}
      >
        <Bookmark className={cn("size-5", post.saved && "fill-fg text-fg")} />
      </Action>
    </div>
  );
}
