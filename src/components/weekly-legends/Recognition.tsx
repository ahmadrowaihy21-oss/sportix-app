import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useWeekly } from "@/lib/weekly-legends/store";
import { useNavigate } from "@tanstack/react-router";
import { useSportId } from "@/lib/sport-id/store";

export function RecognitionGrid() {
  const open = useWeekly((s) => s.open);
  return (
    <section className="px-4">
      <h2 className="text-sm font-semibold">This week’s recognition</h2>
      <p className="text-2xs text-muted">Not a like contest. Not a pay-to-win board.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile t="MOST ACTIVE" s="Lina A. · 9" onClick={() => open("most-active")} />
        <Tile t="BIGGEST STREAK" s="Omar M. · 12d" onClick={() => open("streak")} />
        <Tile t="FEATURED ACHIEVEMENT" s="Ahmed · 10K PB" onClick={() => open("featured")} />
        <Tile t="COMMUNITY HERO" s="Faisal A." onClick={() => open("hero")} />
        <Tile t="PLAYER OF THE WEEK" s="Ahmed · Football" onClick={() => open("potw")} />
        <Tile t="BIGGEST IMPROVEMENT" s="Faisal · +11%" onClick={() => open("improvement")} />
        <Tile t="BEST PLAY" s="SPORTIX Vision" onClick={() => open("best-play")} />
        <Tile t="LEGEND UNLOCK" s="The Sniper" onClick={() => open("legend-unlock")} />
      </div>
    </section>
  );
}

function Tile({ t, s, onClick }: { t: string; s: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border bg-surface px-3 py-3 text-left hover:border-lime/40"
    >
      <p className="text-3xs font-semibold tracking-[0.14em] text-lime">{t}</p>
      <p className="mt-2 text-sm font-semibold">{s}</p>
    </button>
  );
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  const goHome = useWeekly((s) => s.goHome);
  return (
    <div className="pb-16">
      <ScreenHeader title={title} onBack={goHome} />
      <div className="space-y-4 px-4 py-4">{children}</div>
    </div>
  );
}

export function MostActiveCard() {
  const open = useWeekly((s) => s.open);
  const streak = useWeekly((s) => s.streak);
  const activities = useWeekly((s) => s.activities);
  return (
    <Frame title="Most Active">
      <p className="font-display text-5xl leading-none">LINA A.</p>
      <p className="text-sm text-muted">9 verified completed activities this week</p>
      <p className="text-2xs text-faint">Rejected, incomplete, duplicate and suspicious sessions are not counted.</p>
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-2xs text-muted">YOUR WEEK</p>
        <p className="text-sm">{activities} verified activities · streak {streak} days</p>
      </div>
      <Button variant="outline" onClick={() => open("athlete", "lina")}>VIEW WEEK</Button>
    </Frame>
  );
}

export function BiggestStreakCard() {
  const streak = useWeekly((s) => s.streak);
  const navigate = useNavigate();
  return (
    <Frame title="Biggest Streak">
      <p className="font-display text-5xl leading-none">OMAR M.</p>
      <p className="text-lg">12 DAYS · verified activity streak</p>
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-2xs text-muted">YOUR STREAK</p>
        <p className="font-display text-3xl tabular">{streak} DAYS</p>
      </div>
      <Button variant="outline" onClick={() => void navigate({ to: "/sport-id" })}>
        VIEW SPORT ID
      </Button>
    </Frame>
  );
}

export function FeaturedAchievementCard() {
  return (
    <Frame title="Featured Achievement">
      <p className="text-2xs font-semibold tracking-[0.16em] text-lime">FEATURED BY SPORTIX</p>
      <p className="font-display text-4xl leading-none">AHMED R.</p>
      <p className="text-lg">NEW 10K PERSONAL BEST</p>
      <p className="font-display text-5xl tabular">48:12</p>
      <p className="text-sm text-lime">SPORTIX VERIFIED ✓</p>
      <p className="text-2xs text-faint">Editorial feature. Not an objective AI ranking claim.</p>
      <img src="/media/sara-run.jpg" alt="" className="aspect-photo w-full rounded-2xl object-cover" />
    </Frame>
  );
}

export function CommunityHeroCard() {
  const open = useWeekly((s) => s.open);
  return (
    <Frame title="Community Hero">
      <p className="font-display text-5xl leading-none">FAISAL A.</p>
      <ul className="space-y-1 text-sm">
        <li>Sportsmanship</li>
        <li>Reliability</li>
        <li>Fair play</li>
        <li>Helped 4 players this week</li>
      </ul>
      <p className="text-2xs text-faint">Not most likes. Approved community contribution.</p>
      <Button onClick={() => open("story")}>VIEW STORY</Button>
    </Frame>
  );
}

export function HeroStory() {
  const goHome = useWeekly((s) => s.goHome);
  return (
    <Frame title="Hero story">
      <p className="text-sm leading-relaxed text-muted">
        Faisal organised a 5-a-side when two players dropped, stayed to referee extra time, and
        reported a scoring error against himself. Weekly Legends records the contribution. It does
        not raise SSP rank.
      </p>
      <Button variant="outline" onClick={goHome}>Back</Button>
    </Frame>
  );
}

export function PlayerOfWeekCard() {
  const setWhy = useWeekly((s) => s.setWhySelected);
  const navigate = useNavigate();
  const setSelected = useSportId((s) => s.setSelected);
  return (
    <Frame title="Football Player of the Week">
      <p className="text-2xs text-muted">Sport-specific. Not comparable to Padel 91.</p>
      <p className="font-display text-5xl leading-none">AHMED R.</p>
      <div className="grid grid-cols-2 gap-2">
        <Stat k="Technical" v="91" />
        <Stat k="Tactical" v="88" />
        <Stat k="Physical" v="86" />
        <Stat k="Match impact" v="93" />
      </div>
      <p className="text-sm text-lime">SPORTIX VERIFIED ✓</p>
      <Button onClick={() => setWhy(true)}>WHY SELECTED?</Button>
      <Button
        variant="outline"
        onClick={() => {
          setSelected("football");
          void navigate({ to: "/sport-id" });
        }}
      >
        VIEW PERFORMANCE
      </Button>
    </Frame>
  );
}

export function BiggestImprovementCard() {
  const navigate = useNavigate();
  const setSelected = useSportId((s) => s.setSelected);
  return (
    <Frame title="Biggest Improvement">
      <p className="font-display text-4xl leading-none">FAISAL A. · FOOTBALL</p>
      <ul className="space-y-2 text-sm">
        <li>First touch 79 → 88</li>
        <li>Passing 81 → 87</li>
        <li>Decision making 74 → 83</li>
      </ul>
      <p className="font-display text-4xl text-lime">+11%</p>
      <p className="text-2xs text-muted">Longitudinal verified development. Not one lucky match.</p>
      <Button
        variant="outline"
        onClick={() => {
          setSelected("football");
          void navigate({ to: "/sport-id" });
        }}
      >
        VIEW DEVELOPMENT
      </Button>
    </Frame>
  );
}

export function BestPlayCard() {
  return (
    <Frame title="Best Play">
      <p className="text-2xs font-semibold tracking-[0.16em] text-lime">SPORTIX VISION VERIFIED HIGHLIGHT</p>
      <p className="text-lg font-semibold">Football · Skill moment</p>
      <div className="relative overflow-hidden rounded-2xl">
        <img src="/media/football-match.jpg" alt="" className="aspect-photo w-full object-cover" />
        <p className="absolute inset-x-0 bottom-0 bg-bg/70 px-3 py-2 text-2xs">WATCH PLAY · prototype clip</p>
      </div>
      <p className="text-2xs text-faint">Padel smash / rally modules use the same Vision highlight pattern.</p>
    </Frame>
  );
}

export function LegendUnlockCard() {
  const navigate = useNavigate();
  return (
    <Frame title="SPORTIX Legend Unlock">
      <div className="rounded-2xl border border-lime/40 bg-lime/10 px-4 py-8 text-center">
        <p className="text-2xs tracking-[0.2em] text-lime">NEW LEGEND UNLOCKED</p>
        <p className="mt-3 font-display text-5xl leading-none">AHMED R.</p>
        <p className="mt-2 font-display text-3xl text-lime">THE SNIPER</p>
        <p className="mt-3 text-sm text-muted">Earned through verified Football performance.</p>
      </div>
      <p className="text-2xs text-faint">Permanent SPORT ID achievement. Not a weekly SSP score.</p>
      <Button onClick={() => void navigate({ to: "/sport-id" })}>VIEW SPORT ID</Button>
    </Frame>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-2xl tabular">{v}</p>
      <p className="text-2xs text-muted">{k}</p>
    </div>
  );
}
