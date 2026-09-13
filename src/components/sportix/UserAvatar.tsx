import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { users } from "@/lib/sportix/mock";

export function UserAvatar({
  userId,
  size = "md",
  className,
}: {
  userId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const user = users[userId];
  const dim =
    size === "xs"
      ? "size-5"
      : size === "sm"
        ? "size-7"
        : size === "md"
          ? "size-10"
          : size === "lg"
            ? "size-14"
            : "size-20";
  const text =
    size === "xs" || size === "sm" ? "text-3xs" : size === "xl" ? "text-lg" : "text-xs";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className={cn("rounded-full object-cover ring-1 ring-border", dim, className)}
      />
    );
  }

  const label = user?.isOrg ? "S" : initials(user?.displayName ?? "?");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-elevated font-semibold text-lime ring-1 ring-border",
        dim,
        text,
        className,
      )}
    >
      {label}
    </span>
  );
}
