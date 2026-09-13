import { useState } from "react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import type { GroupType } from "@/lib/sportix/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScreenHeader } from "./ScreenHeader";
import { UserAvatar } from "./UserAvatar";

const types: { id: GroupType; label: string; hint: string }[] = [
  { id: "normal", label: "Normal Group", hint: "Friends, general chat" },
  { id: "match", label: "Match Group", hint: "Tied to a match room" },
  { id: "team", label: "Team Group", hint: "Ongoing squad" },
  { id: "training", label: "Training Group", hint: "Sessions and plans" },
  { id: "challenge", label: "Challenge Group", hint: "Time-boxed effort" },
];

export function GroupCreateFlow({ matchId }: { matchId?: string }) {
  const pop = useSportix((s) => s.pop);
  const createGroup = useSportix((s) => s.createGroup);
  const friendships = useSportix((s) => s.friendships);
  const match = useSportix((s) => s.matches.find((m) => m.id === matchId));
  const friends = Object.values(users).filter(
    (u) => u.id !== VIEWER_ID && !u.isOrg && friendships[u.id] === "friends",
  );
  const seed = match?.acceptedIds.filter((id) => id !== VIEWER_ID) ?? [];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(seed);
  const [type, setType] = useState<GroupType>(matchId ? "match" : "normal");
  const [name, setName] = useState(match ? `${match.title} · Match Group` : "");

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div>
      <ScreenHeader
        title="Create group"
        subtitle={`Step ${step + 1} of 3`}
        onBack={pop}
      />
      {step === 0 ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted">Select friends</p>
          <ul className="mt-3 space-y-1">
            {friends.map((u) => {
              const on = selected.includes(u.id);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => toggle(u.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left",
                      on ? "bg-lime/10" : "hover:bg-elevated",
                    )}
                  >
                    <UserAvatar userId={u.id} size="sm" />
                    <span className="flex-1 text-sm font-medium">{u.displayName}</span>
                    <span
                      className={cn(
                        "size-5 rounded-full border",
                        on ? "border-lime bg-lime" : "border-border-strong",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          <Button className="mt-6 w-full" onClick={() => setStep(1)} disabled={selected.length === 0}>
            Continue
          </Button>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted">Choose group type</p>
          <div className="mt-3 space-y-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left",
                  type === t.id ? "border-lime bg-lime/10" : "border-border",
                )}
              >
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-2xs text-muted">{t.hint}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted">Name the group</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            aria-label="Group name"
            className="mt-3 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none"
          />
          <p className="mt-3 text-2xs text-muted">Optional image can be added later. Create to open the chat.</p>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                createGroup({
                  name: name || "New group",
                  type,
                  memberIds: selected,
                  matchId,
                })
              }
            >
              Create Group
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
