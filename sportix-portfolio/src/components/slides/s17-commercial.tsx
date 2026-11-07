import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const SPORTIX = [
  "B2C subscriptions",
  "B2B subscriptions",
  "Enterprise / institutional contracts",
  "Venue & booking revenue",
  "Marketplace commissions",
  "AI / analytics services",
  "B2C-facing sponsorship programs",
  "B2B sponsorship programs",
  "B2G-linked sponsorship programs",
  "In-app sponsorship",
  "Sponsored posts (native feed placements)",
  "Sponsored challenges, offers, partner activations",
];

const YHH = [
  "Booking / marketplace commissions",
  "Partner campaigns",
  "Featured placements",
  "Sponsorship",
  "Referral revenue",
  "Travel / mobility / hospitality referrals",
  "Institutional dashboards",
  "B2B / government contracts",
  "Event activation packages",
];

export function SlideCommercial() {
  return (
    <SlideFrame n={17} kicker="How value is created">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Commercial engine</Kicker>
            <Title size="lg">Several engines. Two applications. One core.</Title>
          </div>
          <Chip>Designed revenue architecture</Chip>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-6">
          <div className="panel flex flex-col rounded-lg p-7">
            <p className="kicker m-0">SPORTIX Ecosystem</p>
            <h3 className="mt-3 mb-5 font-display text-[26px] font-medium tracking-tight">Sports commercial stack</h3>
            <ul className="m-0 grid grid-cols-1 gap-2 p-0">
              {SPORTIX.map((x) => (
                <li key={x} className="list-none text-[17px] text-fg">
                  <span className="text-lime">· </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel flex flex-col rounded-lg p-7">
            <p className="kicker kicker-gold m-0">Yalla Hayyihom</p>
            <h3 className="mt-3 mb-5 font-display text-[26px] font-medium tracking-tight">Experience commercial stack</h3>
            <ul className="m-0 grid grid-cols-1 gap-2 p-0">
              {YHH.map((x) => (
                <li key={x} className="list-none text-[17px] text-fg">
                  <span style={{ color: "var(--color-gold)" }}>· </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-5 mb-0 text-[17px] text-muted">
          SPORTIX Sponsored Posts are native commercial placements inside the SPORTIX feed. They are
          not the same object as a strategic corporate sponsorship.
        </p>
      </div>
    </SlideFrame>
  );
}
