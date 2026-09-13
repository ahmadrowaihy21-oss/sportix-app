import { useEffect, useRef, useState } from "react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScreenHeader } from "./ScreenHeader";
import { UserAvatar } from "./UserAvatar";

export function ChatThread({ threadId }: { threadId: string }) {
  const thread = useSportix((s) => s.threads.find((t) => t.id === threadId));
  const allMessages = useSportix((s) => s.messages);
  const messages = allMessages.filter((m) => m.threadId === threadId);
  const pop = useSportix((s) => s.pop);
  const sendMessage = useSportix((s) => s.sendMessage);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!thread) {
    return (
      <div>
        <ScreenHeader title="Chat" onBack={pop} />
        <p className="p-6 text-sm text-muted">Conversation not found.</p>
      </div>
    );
  }

  const other = thread.memberIds.find((id) => id !== VIEWER_ID);
  const subtitle =
    thread.kind === "group"
      ? `${thread.memberIds.length} members${thread.groupType ? ` · ${thread.groupType}` : ""}`
      : users[other ?? ""]?.sport;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader title={thread.title} subtitle={subtitle} onBack={pop} />
      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const mine = m.authorId === VIEWER_ID;
          const u = users[m.authorId];
          return (
            <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
              <UserAvatar userId={m.authorId} size="sm" />
              <div className={cn("max-w-[75%] rounded-lg px-3 py-2", mine ? "bg-lime text-lime-fg" : "bg-elevated")}>
                {!mine && thread.kind === "group" ? (
                  <p className="text-2xs font-medium opacity-70">{u?.displayName}</p>
                ) : null}
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={cn("mt-1 text-3xs", mine ? "text-lime-fg/70" : "text-muted")}>{m.at}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        className="z-20 flex shrink-0 gap-2 border-t border-border bg-bg p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(threadId, text);
          setText("");
          field.current?.focus();
        }}
      >
        <input
          ref={field}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
          aria-label="Message"
          autoComplete="off"
          autoCorrect="on"
          enterKeyHint="send"
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-fg caret-lime outline-none placeholder:text-faint focus:border-lime"
        />
        <Button type="submit" disabled={!text.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
