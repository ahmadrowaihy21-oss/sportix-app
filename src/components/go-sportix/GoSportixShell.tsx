import { Toaster } from "sonner";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useGo } from "@/lib/go-sportix/store";
import { ActivityPreflight } from "./ActivityPreflight";
import { ActivitySelector } from "./ActivitySelector";
import { GoSettings, GymCheckIn } from "./GoExtras";
import { RoomsHost } from "@/components/rooms/Rooms";
import { GoSportixHome } from "./GoSportixHome";
import { LiveActivitySession } from "./LiveActivitySession";
import { MediaEvidenceRequirement } from "./MediaEvidence";
import { VerificationProgress, VerifiedActivitySuccess } from "./VerificationFlow";
import { VerifiedActivityPostView } from "./VerifiedActivityPost";

export function GoSportixShell() {
  const screen = useGo((s) => s.screen);
  const goHome = useGo((s) => s.goHome);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl">
        {screen === "home" ? (
          <>
            <ScreenHeader title="SPORTIX" subtitle="GO SPORTIX" />
            <GoSportixHome />
          </>
        ) : null}
        {screen === "select" ? <ActivitySelector /> : null}
        {screen === "preflight" ? <ActivityPreflight /> : null}
        {screen === "live" ? (
          <>
            <ScreenHeader title="GO SPORTIX" subtitle="Live session" onBack={goHome} />
            <LiveActivitySession />
          </>
        ) : null}
        {screen === "media" ? <MediaEvidenceRequirement /> : null}
        {screen === "verify" ? <VerificationProgress /> : null}
        {screen === "success" ? <VerifiedActivitySuccess /> : null}
        {screen === "post" ? <VerifiedActivityPostView /> : null}
        {screen === "gym" ? <GymCheckIn /> : null}
        {screen === "find-game" || screen === "create-game" ? <RoomsHost /> : null}
        {screen === "settings" ? <GoSettings /> : null}
      </div>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{ className: "!bg-elevated !text-fg !border-border !text-sm" }}
      />
    </div>
  );
}
