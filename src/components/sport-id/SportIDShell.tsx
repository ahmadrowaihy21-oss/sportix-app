import { ServiceHistory } from "@/components/services/ServiceHistory";
import { IntegrationNotice } from "@/components/athlete/IntegrationNotice";
import { Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useSportId } from "@/lib/sport-id/store";
import { AthleteIdentityCard } from "./AthleteIdentityCard";
import {
  AchievementDetail,
  DevelopmentScreen,
  HistoryScreen,
  MetricDetail,
  SessionDetail,
  VisionReportScreen,
} from "./Drilldowns";
import { FootballID } from "./FootballID";
import { AddSportFlow, PlayLoopScreen, SensorProfiles } from "./Flows";
import {
  ConnectionsScreen,
  DevicesScreen,
  EditProfileScreen,
  JourneyScreen,
  PrivacyScreen,
  SportJourneySummary,
  WeeklyLegendScreen,
} from "./JourneyAndAccount";
import { CyclingID, PadelID, RunningID, WalkingID } from "./OtherSportIDs";
import { ProfileSection } from "./ProfileSection";
import { SportIDHeader } from "./SportIDHeader";
import { SportSelector } from "./SportSelector";

function Home() {
  const selected = useSportId((s) => s.selected);
  const view = useSportId((s) => s.view);
  return (
    <>
      <SportIDHeader />
      <IntegrationNotice section="sport-id" />
      {view === "owner" && <ServiceHistory />}
      <Link
        to="/academy"
        className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-lime/30 bg-lime/10 p-4 text-sm text-lime"
        dir="rtl"
      >
        <span>
          <strong className="block">مساحة الأكاديمية</strong>
          <span className="mt-1 block text-xs text-muted">
            إضافة لاعب · مراجعة تقرير · متابعة التطور — بيانات تجريبية
          </span>
        </span>
        <span aria-hidden="true">↖</span>
      </Link>
      {view === "professional" ? (
        <p className="px-4 pt-3 text-2xs text-muted">
          Authorised professional view · Football evidence only · no DMs, health
          or raw sensors
        </p>
      ) : null}
      {view === "public" ? (
        <p className="px-4 pt-3 text-2xs text-muted">
          Public SPORT ID · approved fields only
        </p>
      ) : null}
      <AthleteIdentityCard />
      <SportSelector />
      <div className="mt-5">
        {selected === "football" ? <FootballID /> : null}
        {selected === "padel" ? <PadelID /> : null}
        {selected === "running" ? <RunningID /> : null}
        {selected === "walking" ? <WalkingID /> : null}
        {selected === "cycling" ? <CyclingID /> : null}
      </div>
      <SportJourneySummary />
      <ProfileSection />
    </>
  );
}

function StackScreen() {
  const screen = useSportId((s) => s.stack[s.stack.length - 1]);
  if (!screen) return null;
  switch (screen.type) {
    case "metric":
      return <MetricDetail sport={screen.sport} metricId={screen.metricId} />;
    case "vision":
      return <VisionReportScreen />;
    case "development":
      return <DevelopmentScreen />;
    case "achievement":
      return <AchievementDetail id={screen.id} />;
    case "history":
      return <HistoryScreen />;
    case "session":
      return <SessionDetail id={screen.id} />;
    case "sensors":
      return <SensorProfiles />;
    case "add-sport":
      return <AddSportFlow />;
    case "privacy":
      return <PrivacyScreen />;
    case "devices":
      return <DevicesScreen />;
    case "connections":
      return <ConnectionsScreen />;
    case "edit-profile":
      return <EditProfileScreen />;
    case "settings":
      return <PlayLoopScreen />;
    case "journey":
      return <JourneyScreen />;
    case "weekly-legend":
      return <WeeklyLegendScreen />;
    default:
      return null;
  }
}

export function SportIDShell() {
  const stacked = useSportId((s) => s.stack.length > 0);
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl">
        {stacked ? <StackScreen /> : <Home />}
      </div>
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
