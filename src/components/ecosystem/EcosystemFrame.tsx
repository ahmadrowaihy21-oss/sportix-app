import { useEffect } from "react";
import { useAthlete } from "@/lib/athlete/store";
import { syncSyntheticViews } from "@/lib/athlete/bridge";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, IdCard, Play, Store, Users } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { NotificationCenter, SettingsShell } from "@/components/shell/Overlays";
import { useShell } from "@/lib/shell/store";
import { t } from "@/lib/shell/i18n";
import { cn } from "@/lib/utils";

export function ProductDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = useShell((s) => s.lang);
  const onHome = pathname === "/";
  const onCommunities = pathname.startsWith("/communities");
  const onMarket = pathname.startsWith("/marketplace");
  const onSport = pathname.startsWith("/sport-id");
  const onGo = pathname.startsWith("/go-sportix");

  return (
    <nav
      aria-label="SPORTIX ecosystem"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/94 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 md:max-w-3xl lg:max-w-4xl">
        <DockLink to="/" current={onHome} icon={Home} label={t(lang, "home")} />
        <DockLink
          to="/communities"
          current={onCommunities}
          icon={Users}
          label={t(lang, "communities")}
        />
        <DockLink
          to="/go-sportix"
          current={onGo}
          icon={Play}
          label={t(lang, "go")}
        />
        <DockLink
          to="/marketplace"
          current={onMarket}
          icon={Store}
          label={t(lang, "market")}
        />
        <DockLink
          to="/sport-id"
          current={onSport}
          icon={IdCard}
          label={t(lang, "sportId")}
        />
      </div>
    </nav>
  );
}

function DockLink({
  to,
  current,
  icon: Icon,
  label,
}: {
  to: "/" | "/communities" | "/go-sportix" | "/marketplace" | "/sport-id";
  current: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      to={to}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide",
        current ? "text-lime" : "text-muted hover:text-fg",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

export function EcosystemFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Read browser storage after hydration so server and first client markup agree.
    try {
      if (sessionStorage.getItem("sportix-onboarded") === "1")
        useShell.setState({ onboarded: true, overlay: "none" });
    } catch {
      /* Keep onboarding visible when storage is unavailable. */
    }
    useAthlete.getState().hydrate();
    syncSyntheticViews();
  }, []);
  const overlay = useShell((s) => s.overlay);
  const onboarded = useShell((s) => s.onboarded);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      {children}
      {onboarded ? <ProductDock /> : null}
      {overlay === "onboarding" || !onboarded ? <OnboardingShell /> : null}
      {overlay === "notifications" ? <NotificationCenter /> : null}
      {overlay === "settings" ? <SettingsShell /> : null}
    </div>
  );
}
