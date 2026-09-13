import { Button } from "@/components/ui/button";
import { useGo } from "@/lib/go-sportix/store";
import { useShell } from "@/lib/shell/store";
import { t } from "@/lib/shell/i18n";
import { cn } from "@/lib/utils";

const SPORTS = ["Football", "Padel", "Running", "Walking", "Cycling", "Gym"];
const GOALS = ["Build my SPORT ID", "Find matches", "Track running", "Join an academy", "Stay consistent"];

export function OnboardingShell() {
  const step = useShell((s) => s.onboardingStep);
  const setStep = useShell((s) => s.setStep);
  const complete = useShell((s) => s.completeOnboarding);
  const skip = useShell((s) => s.skipOnboarding);
  const lang = useShell((s) => s.lang);
  const next = () => {
    if (step >= 13) complete();
    else setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        <p className="text-2xs font-semibold tracking-[0.2em] text-lime">SPORTIX</p>
        <p className="mt-1 text-2xs text-muted">Step {step} of 13</p>
        <div className="mt-6 flex-1">{renderStep(step)}</div>
        <div className="mt-8 space-y-2">
          <Button className="h-12 w-full" onClick={next}>
            {step === 13 ? "Enter Home" : "Continue"}
          </Button>
          <button type="button" className="w-full text-center text-2xs text-faint" onClick={skip}>
            {t(lang, "skip")}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderStep(step: number) {
  switch (step) {
    case 1:
      return <Account />;
    case 2:
      return <Age />;
    case 3:
      return <Sports />;
    case 4:
      return <Goals />;
    case 5:
      return <Privacy />;
    case 6:
      return <Audience />;
    case 7:
      return <Perm k="location" title="Location" copy="Needed for GPS route evidence. Deny = outdoor verification limited." />;
    case 8:
      return <Perm k="camera" title="Camera / Media" copy="Needed for session-bound photo/video. You are never required to show yourself." />;
    case 9:
      return <Perm k="health" title="Health / Watch" copy="Connect a watch for heart-rate and motion evidence. Deny = Health source unavailable." />;
    case 10:
      return <Perm k="notifPerm" title="Notifications" copy="Match rooms, verification, Weekly Legends. You can mute categories later." />;
    case 11:
      return <PrayerOpt />;
    case 12:
      return (
        <Block title="Initial SPORT ID">
          <p className="text-sm text-muted">
            Football is your deepest verified sport. Running and Walking use governed activity evidence.
            Cycling stays a controlled verification profile until gates pass.
          </p>
          <p className="mt-3 text-sm">Yousef N. · Jeddah · 5 sports · identity verified</p>
        </Block>
      );
    default:
      return (
        <Block title="You're ready">
          <p className="text-sm text-muted">Home will tell you what to do next. Sharing is never the verification gate.</p>
        </Block>
      );
  }
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h1 className="font-display text-4xl leading-none">{title}</h1>
      <div className="mt-4 space-y-3">{children}</div>
    </>
  );
}

function Account() {
  const setLang = useShell((s) => s.setLang);
  const lang = useShell((s) => s.lang);
  return (
    <Block title="Create account">
      <p className="text-sm text-muted">Prototype identity: Yousef N. · Jeddah. Sign-in is local to this demo.</p>
      <label className="block text-sm">
        Display name
        <input defaultValue="Yousef N." className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setLang("en")} className={cn("h-11 rounded-xl border", lang === "en" ? "border-lime" : "border-border")}>
          English
        </button>
        <button type="button" onClick={() => setLang("ar")} className={cn("h-11 rounded-xl border", lang === "ar" ? "border-lime" : "border-border")}>
          العربية
        </button>
      </div>
    </Block>
  );
}

function Age() {
  const age = useShell((s) => s.ageBand);
  const setAge = useShell((s) => s.setAge);
  return (
    <Block title="Age">
      {(["18+", "16-17", "13-15"] as const).map((a) => (
        <button key={a} type="button" onClick={() => setAge(a, a !== "18+")} className={cn("h-12 w-full rounded-xl border", age === a ? "border-lime bg-lime/10" : "border-border")}>
          {a}{a !== "18+" ? " · guardian required" : ""}
        </button>
      ))}
    </Block>
  );
}

function Sports() {
  const sports = useShell((s) => s.sports);
  const setSports = useShell((s) => s.setSports);
  return (
    <Block title="Choose sports">
      {SPORTS.map((s) => {
        const on = sports.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => setSports(on ? sports.filter((x) => x !== s) : [...sports, s])}
            className={cn("h-12 w-full rounded-xl border text-sm", on ? "border-lime bg-lime/10" : "border-border")}
          >
            {s}
          </button>
        );
      })}
    </Block>
  );
}

function Goals() {
  const goals = useShell((s) => s.goals);
  const setGoals = useShell((s) => s.setGoals);
  return (
    <Block title="Goals">
      {GOALS.map((g) => {
        const on = goals.includes(g);
        return (
          <button
            key={g}
            type="button"
            onClick={() => setGoals(on ? goals.filter((x) => x !== g) : [...goals, g])}
            className={cn("min-h-12 w-full rounded-xl border px-3 py-2 text-left text-sm", on ? "border-lime bg-lime/10" : "border-border")}
          >
            {g}
          </button>
        );
      })}
    </Block>
  );
}

function Privacy() {
  return (
    <Block title="Privacy">
      <p className="text-sm text-muted">
        What you claim belongs to Profile. What SPORTIX can verify belongs to SPORT ID. Partners do not receive private SPORT ID by default.
      </p>
    </Block>
  );
}

function Audience() {
  const audience = useShell((s) => s.audience);
  const setAudience = useShell((s) => s.setAudience);
  const setGo = useGo((s) => s.setAudience);
  return (
    <Block title="Verified Activity Post audience">
      <p className="text-sm text-muted">Persistent default. Not asked at the end of a workout. Not a verification gate.</p>
      {(["PUBLIC", "FRIENDS", "ONLY ME"] as const).map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => {
            setAudience(a);
            setGo(a);
          }}
          className={cn("h-12 w-full rounded-xl border", audience === a ? "border-lime bg-lime/10" : "border-border")}
        >
          {a}
        </button>
      ))}
    </Block>
  );
}

function Perm({ k, title, copy }: { k: "location" | "camera" | "health" | "notifPerm"; title: string; copy: string }) {
  const value = useShell((s) => s[k]);
  const setPerm = useShell((s) => s.setPerm);
  return (
    <Block title={title}>
      <p className="text-sm text-muted">{copy}</p>
      <Button className="w-full" onClick={() => setPerm(k, k === "health" ? "connected" : "granted")}>
        Allow
      </Button>
      <Button variant="outline" className="w-full" onClick={() => setPerm(k, "denied")}>
        Not now
      </Button>
      {value === "denied" ? <p className="text-2xs text-warn">Denied · related verified flows will be limited, not blocked from the rest of SPORTIX.</p> : null}
    </Block>
  );
}

function PrayerOpt() {
  const prayer = useShell((s) => s.prayer);
  const setPrayer = useShell((s) => s.setPrayer);
  return (
    <Block title="Prayer Awareness">
      <p className="text-sm text-muted">
        Optional. Never affects SP, SSP, streak, Weekly Legends, sponsorship or any religiosity score.
      </p>
      <Button className="w-full" variant={prayer ? "lime" : "outline"} onClick={() => setPrayer(true)}>
        Enable
      </Button>
      <Button variant="outline" className="w-full" onClick={() => setPrayer(false)}>
        Skip
      </Button>
    </Block>
  );
}
