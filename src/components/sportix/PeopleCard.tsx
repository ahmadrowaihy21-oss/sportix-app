import { MapPin, Trophy } from "lucide-react";
import { users } from "@/lib/sportix/mock";
import { SportIcon } from "./SportIcon";
import { FriendControl } from "./UserHeader";
import { UserAvatar } from "./UserAvatar";
import { VerifiedMark } from "./VerificationBadge";

export function PeopleCard({
  userId,
  onOpen,
}: {
  userId: string;
  onOpen: () => void;
}) {
  const user = users[userId];
  if (!user) return null;
  return (
    <article className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <UserAvatar userId={userId} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="truncate">{user.displayName}</span>
            {user.verified ? <VerifiedMark className="size-3.5" /> : null}
            {user.ageRestricted ? (
              <span className="rounded-full bg-elevated px-1.5 text-3xs text-muted">Age-restricted</span>
            ) : null}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-2xs text-muted">
            <SportIcon sport={user.sport} />
            {user.sport}
          </p>
          <p className="flex items-center gap-2 text-2xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {user.zone}
            </span>
            {user.weeklyRank ? (
              <span className="inline-flex items-center gap-1">
                <Trophy className="size-3" />#{user.weeklyRank} Weekly
              </span>
            ) : null}
          </p>
        </div>
      </button>
      <FriendControl userId={userId} />
    </article>
  );
}
