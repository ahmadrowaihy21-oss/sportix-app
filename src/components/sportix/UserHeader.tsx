import { Check, MoreHorizontal, Plus, UserPlus } from "lucide-react";
import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { cn } from "@/lib/utils";
import { SportIcon } from "./SportIcon";
import { UserAvatar } from "./UserAvatar";
import { VerifiedMark } from "./VerificationBadge";

export function FriendControl({
  userId,
  compact = false,
}: {
  userId: string;
  compact?: boolean;
}) {
  const viewerId = useSportix((s) => s.viewerId);
  const state = useSportix((s) => s.friendships[userId] ?? "none");
  const requestFriend = useSportix((s) => s.requestFriend);
  const acceptFriend = useSportix((s) => s.acceptFriend);
  const cancelRequest = useSportix((s) => s.cancelRequest);

  if (userId === viewerId) return null;

  if (state === "friends") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 text-2xs font-medium text-muted",
          compact ? "h-7" : "h-8",
        )}
      >
        <Check className="size-3" aria-hidden="true" />
        Friends
      </span>
    );
  }

  if (state === "requested") {
    return (
      <button
        type="button"
        onClick={() => cancelRequest(userId)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-2xs font-medium text-muted hover:text-fg",
          compact ? "h-7" : "h-8",
        )}
        aria-label="Requested — tap to cancel"
      >
        Requested
      </button>
    );
  }

  if (state === "incoming") {
    return (
      <button
        type="button"
        onClick={() => acceptFriend(userId)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-lime px-2.5 text-2xs font-semibold text-lime-fg",
          compact ? "h-7" : "h-8",
        )}
      >
        Accept
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => requestFriend(userId)}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full bg-lime text-2xs font-semibold text-lime-fg",
        compact ? "size-7 px-0" : "h-8 px-2.5",
      )}
      aria-label="Add"
    >
      {compact ? <Plus className="size-3.5" /> : <UserPlus className="size-3.5" />}
      {compact ? null : <span>Add</span>}
    </button>
  );
}

export function UserHeader({
  userId,
  timeLabel,
  onOverflow,
}: {
  userId: string;
  timeLabel?: string;
  onOverflow?: () => void;
}) {
  const user = users[userId];
  const openProfile = useSportix((s) => s.openProfile);
  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <button
        type="button"
        onClick={() => openProfile(userId)}
        className="shrink-0 rounded-full"
        aria-label={`${user.displayName} profile`}
      >
        <UserAvatar userId={userId} size="md" />
      </button>
      <button
        type="button"
        onClick={() => openProfile(userId)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">{user.displayName}</span>
          {user.verified ? <VerifiedMark className="size-3.5" /> : null}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-muted">
          <SportIcon sport={user.sport} className="size-3" />
          <span>{user.sport}</span>
          <span aria-hidden="true">·</span>
          <span>{user.city}</span>
          {timeLabel ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{timeLabel}</span>
            </>
          ) : null}
        </div>
      </button>
      <FriendControl userId={userId} compact />
      {onOverflow ? (
        <button
          type="button"
          onClick={onOverflow}
          className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg"
          aria-label="More"
        >
          <MoreHorizontal className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
