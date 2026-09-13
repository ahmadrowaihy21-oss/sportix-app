import { useState } from "react";
import { Flag, Heart, MessageCircle, Repeat2, Ban, BellOff } from "lucide-react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "./BottomSheet";
import { SponsorFlow } from "./sponsor/SponsorFlow";
import { UserAvatar } from "./UserAvatar";
import { VerifiedMark } from "./VerificationBadge";

function CommentsBody({ postId }: { postId: string }) {
  const comments = useSportix((s) => s.comments);
  const addComment = useSportix((s) => s.addComment);
  const toggle = useSportix((s) => s.toggleCommentLike);
  const openSheet = useSportix((s) => s.openSheet);
  const [text, setText] = useState("");
  const list = comments.filter((c) => c.postId === postId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ul className="flex-1 space-y-4 pb-4">
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Be the first to comment.</p>
        ) : (
          list.map((c) => {
            const u = users[c.authorId];
            return (
              <li key={c.id} className="flex gap-2.5">
                <UserAvatar userId={c.authorId} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold">{u?.displayName}</span>
                    {u?.verified ? <VerifiedMark className="size-3" /> : null}
                    <span className="text-2xs text-muted">{c.createdAt}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed">{c.text}</p>
                  <div className="mt-1 flex items-center gap-3 text-2xs text-muted">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-fg"
                      onClick={() => toggle(c.id)}
                    >
                      <Heart className={c.liked ? "size-3 fill-danger text-danger" : "size-3"} />
                      {c.likes || "Like"}
                    </button>
                    <button type="button" className="hover:text-fg">
                      Reply
                    </button>
                    <button
                      type="button"
                      className="hover:text-fg"
                      onClick={() => openSheet({ type: "report-comment", commentId: c.id })}
                    >
                      Report
                    </button>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <form
        className="sticky bottom-0 flex gap-2 border-t border-border bg-surface py-3"
        onSubmit={(e) => {
          e.preventDefault();
          addComment(postId, text);
          setText("");
        }}
      >
        <UserAvatar userId={VIEWER_ID} size="sm" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment"
          aria-label="Add a comment"
          className="h-10 min-w-0 flex-1 rounded-md border border-border bg-elevated px-3 text-sm outline-none placeholder:text-faint"
        />
        <Button type="submit" size="sm" disabled={!text.trim()}>
          Post
        </Button>
      </form>
    </div>
  );
}

function OverflowBody({ userId, postId }: { userId: string; postId?: string }) {
  const muteUser = useSportix((s) => s.muteUser);
  const blockUser = useSportix((s) => s.blockUser);
  const closeSheet = useSportix((s) => s.closeSheet);
  const user = users[userId];
  return (
    <div className="space-y-1 pb-4">
      {postId ? (
        <button
          type="button"
          onClick={() => {
            closeSheet();
            useSportix.getState().flash("Post reported");
          }}
          className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-sm hover:bg-elevated"
        >
          <Flag className="size-4 text-muted" />
          Report post
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => muteUser(userId)}
        className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-sm hover:bg-elevated"
      >
        <BellOff className="size-4 text-muted" />
        Mute {user?.displayName}
      </button>
      <button
        type="button"
        onClick={() => blockUser(userId)}
        className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-sm text-danger hover:bg-elevated"
      >
        <Ban className="size-4" />
        Block / restrict
      </button>
    </div>
  );
}

export function SportixSheets() {
  const sheet = useSportix((s) => s.sheet);
  const closeSheet = useSportix((s) => s.closeSheet);
  const repost = useSportix((s) => s.repost);
  const [repostNote, setRepostNote] = useState("");

  if (!sheet) return null;

  if (sheet.type === "comments") {
    return (
      <BottomSheet open title="Comments" onClose={closeSheet} height="tall">
        <CommentsBody postId={sheet.postId} />
      </BottomSheet>
    );
  }
  if (sheet.type === "sponsor") {
    return (
      <BottomSheet open title="SPORTIX SPONSOR" onClose={closeSheet} height="tall">
        <SponsorFlow postId={sheet.postId} scope="post" />
      </BottomSheet>
    );
  }
  if (sheet.type === "athlete-sponsor") {
    return (
      <BottomSheet open title="SPORTIX SPONSOR" onClose={closeSheet} height="tall">
        <SponsorFlow userId={sheet.userId} scope="athlete" />
      </BottomSheet>
    );
  }
  if (sheet.type === "repost") {
    return (
      <BottomSheet open title="Repost" onClose={closeSheet}>
        <div className="space-y-2 pb-4">
          <button
            type="button"
            onClick={() => repost(sheet.postId)}
            className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-sm hover:bg-elevated"
          >
            <Repeat2 className="size-4" />
            Repost
          </button>
          <button
            type="button"
            onClick={() => useSportix.getState().openSheet({ type: "repost-comment", postId: sheet.postId })}
            className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-sm hover:bg-elevated"
          >
            <MessageCircle className="size-4" />
            Repost with comment
          </button>
        </div>
      </BottomSheet>
    );
  }
  if (sheet.type === "repost-comment") {
    return (
      <BottomSheet open title="Repost with comment" onClose={closeSheet}>
        <div className="space-y-3 pb-4">
          <textarea
            value={repostNote}
            onChange={(e) => setRepostNote(e.target.value)}
            rows={3}
            placeholder="Add a comment"
            className="w-full rounded-md border border-border bg-elevated p-3 text-sm outline-none"
          />
          <Button
            className="w-full"
            onClick={() => {
              repost(sheet.postId, repostNote);
              setRepostNote("");
            }}
          >
            Repost
          </Button>
        </div>
      </BottomSheet>
    );
  }
  if (sheet.type === "overflow") {
    return (
      <BottomSheet open title="Post options" onClose={closeSheet}>
        <OverflowBody userId={sheet.userId} postId={sheet.postId} />
      </BottomSheet>
    );
  }
  if (sheet.type === "report-comment") {
    return (
      <BottomSheet open title="Report comment" onClose={closeSheet}>
        <div className="space-y-1 pb-4">
          {["Harassment", "Spam", "Fake evidence", "Other"].map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => {
                closeSheet();
                useSportix.getState().flash("Comment reported");
              }}
              className="flex h-12 w-full items-center rounded-md px-2 text-sm hover:bg-elevated"
            >
              {reason}
            </button>
          ))}
        </div>
      </BottomSheet>
    );
  }
  return null;
}
