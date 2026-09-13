import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { useWeekly } from "@/lib/weekly-legends/store";
import { WeeklyHeader } from "./WeeklyHeader";
import { YourWeekCard } from "./YourWeekCard";
import { WeeklyPodium } from "./WeeklyPodium";
import { RankingBoard } from "./RankingBoard";
import {
  BestPlayCard,
  BiggestImprovementCard,
  BiggestStreakCard,
  CommunityHeroCard,
  FeaturedAchievementCard,
  HeroStory,
  LegendUnlockCard,
  MostActiveCard,
  PlayerOfWeekCard,
  RecognitionGrid,
} from "./Recognition";
import { WeekCloseFlow, WeeklyRewardCard, WinnerReveal } from "./WeekClose";
import { AthleteCard, WhySelectedSheet, WhyThisRankSheet } from "./Sheets";

function Home() {
  const open = useWeekly((s) => s.open);
  const startWeekClose = useWeekly((s) => s.startWeekClose);
  const resetDemo = useWeekly((s) => s.resetDemo);
  const phase = useWeekly((s) => s.closePhase);
  const history = useWeekly((s) => s.history);

  return (
    <div className="space-y-6 pb-16">
      <WeeklyHeader />
      <YourWeekCard />
      {phase !== "NEW_WEEK" ? <WeeklyPodium /> : null}
      <div className="px-4">
        <Button variant="outline" className="w-full" onClick={() => open("ranking")}>
          VIEW FULL RANKING
        </Button>
      </div>
      <RecognitionGrid />
      {history.length > 0 ? (
        <section className="px-4">
          <h2 className="text-sm font-semibold">SPORT ID legacy</h2>
          {history.map((h) => (
            <article key={h.id} className="mt-2 rounded-2xl border border-lime/35 bg-lime/10 p-3">
              <p className="text-2xs tracking-[0.14em] text-lime">WEEK {h.week} · KEPT AFTER RESET</p>
              <p className="mt-1 font-semibold">{h.title}</p>
              <p className="text-2xs text-muted">
                {h.context} · {h.ssp.toLocaleString()} SSP AI · {h.sportLabel}
              </p>
            </article>
          ))}
        </section>
      ) : null}
      <div className="space-y-2 px-4">
        {phase === "ACTIVE" ? (
          <Button variant="muted" className="w-full" onClick={startWeekClose}>
            DEMO WEEK CLOSE
          </Button>
        ) : null}
        <button type="button" onClick={resetDemo} className="w-full text-center text-3xs text-faint">
          Reset Weekly Legends demo
        </button>
      </div>
    </div>
  );
}

export function WeeklyLegendsShell() {
  const screen = useWeekly((s) => s.screen);
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl">
        {screen === "home" ? <Home /> : null}
        {screen === "ranking" ? <RankingBoard /> : null}
        {screen === "most-active" ? <MostActiveCard /> : null}
        {screen === "streak" ? <BiggestStreakCard /> : null}
        {screen === "featured" ? <FeaturedAchievementCard /> : null}
        {screen === "hero" ? <CommunityHeroCard /> : null}
        {screen === "story" ? <HeroStory /> : null}
        {screen === "potw" ? <PlayerOfWeekCard /> : null}
        {screen === "improvement" ? <BiggestImprovementCard /> : null}
        {screen === "best-play" ? <BestPlayCard /> : null}
        {screen === "legend-unlock" ? <LegendUnlockCard /> : null}
        {screen === "week-close" ? <WeekCloseFlow /> : null}
        {screen === "winner" ? <WinnerReveal /> : null}
        {screen === "reward" ? <WeeklyRewardCard /> : null}
        {screen === "athlete" ? <AthleteCard /> : null}
      </div>
      <WhyThisRankSheet />
      <WhySelectedSheet />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{ className: "!bg-elevated !text-fg !border-border !text-sm" }}
      />
    </div>
  );
}
