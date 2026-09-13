import { Toaster } from "sonner";
import { useSportix } from "@/lib/sportix/store";
import { AchievementsTab } from "./AchievementsTab";
import { ChatThread } from "./ChatThread";
import { CommunitiesHeader } from "./CommunitiesHeader";
import { CommunityFeed } from "./CommunityFeed";
import { CommunityPostCard } from "./CommunityPost";
import { CommunityTabs } from "./CommunityTabs";
import { DiscoverTab } from "./DiscoverTab";
import { GroupCreateFlow } from "./GroupCreateFlow";
import { MatchDetail } from "./MatchDetail";
import { MatchesTab } from "./MatchesTab";
import { MessageInbox } from "./MessageInbox";
import { PeopleTab } from "./PeopleTab";
import { PerformanceScreen } from "./PerformanceScreen";
import { ScreenHeader } from "./ScreenHeader";
import { SportixSheets } from "./sheets";
import { CreatorSponsorSummary } from "./sponsor/CreatorSponsorSummary";
import { SponsorHistory } from "./sponsor/SponsorHistory";
import { SportIdPreview } from "./SportIdPreview";
import { UserProfile } from "./UserProfile";

function StackedPost({ postId }: { postId: string }) {
  const post = useSportix((s) => s.posts.find((p) => p.id === postId));
  const pop = useSportix((s) => s.pop);
  if (!post) return null;
  return (
    <div>
      <ScreenHeader title="Verified activity post" onBack={pop} />
      <CommunityPostCard post={post} />
    </div>
  );
}

function StackScreen() {
  const screen = useSportix((s) => s.stack[s.stack.length - 1]);
  if (!screen) return null;
  switch (screen.type) {
    case "profile":
      return <UserProfile userId={screen.userId} />;
    case "sport-id":
      return <SportIdPreview userId={screen.userId} />;
    case "messages":
      return <MessageInbox />;
    case "chat":
      return <ChatThread threadId={screen.threadId} />;
    case "match":
      return <MatchDetail matchId={screen.matchId} />;
    case "performance":
      return <PerformanceScreen postId={screen.postId} />;
    case "group-create":
      return <GroupCreateFlow matchId={screen.matchId} />;
    case "sponsor-history":
      return <SponsorHistory postId={screen.postId} userId={screen.userId} />;
    case "creator-earnings":
      return <CreatorSponsorSummary userId={screen.userId} />;
    case "post":
      return <StackedPost postId={screen.postId} />;
    default:
      return null;
  }
}

export function CommunitiesShell() {
  const tab = useSportix((s) => s.tab);
  const stacked = useSportix((s) => s.stack.length > 0);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div
        className={
          stacked
            ? "mx-auto flex h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl"
            : "mx-auto flex min-h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl"
        }
      >
        {stacked ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <StackScreen />
          </div>
        ) : (
          <>
            <CommunitiesHeader />
            <CommunityTabs />
            <main className="flex-1 pb-8">
              {tab === "feed" ? <CommunityFeed /> : null}
              {tab === "achievements" ? <AchievementsTab /> : null}
              {tab === "matches" ? <MatchesTab /> : null}
              {tab === "discover" ? <DiscoverTab /> : null}
              {tab === "people" ? <PeopleTab /> : null}
            </main>
          </>
        )}
      </div>
      <SportixSheets />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          className: "!bg-elevated !text-fg !border-border !text-sm",
        }}
      />
    </div>
  );
}
