import { SlideFrame } from "@/components/deck/SlideFrame";
import { Kicker, Title } from "@/components/deck/primitives";

const ROWS = [
  { who: "B2C — athletes, fans, visitors", pays: "Subscriptions, bookings, marketplace, rewards redemption", why: "Access, identity, convenience, status" },
  { who: "B2B — clubs, academies, venues", pays: "Software, dashboards, booking tools, AI/analytics services", why: "Operations, development, occupancy" },
  { who: "Institutional / federation", pays: "Enterprise contracts, pathway intelligence, reporting", why: "Continuity of talent evidence" },
  { who: "B2G / destination operators", pays: "Dashboards, event packages, visitor intelligence", why: "Participation, tourism, 2034-ready operations" },
  { who: "Sponsors — brand & campaign", pays: "Programs, activations, native posts, challenges, offers", why: "Verified audiences, not rented banners" },
  { who: "Partners — retail, travel, hospitality", pays: "Commissions, featured placements, referrals", why: "Intentional traffic from a living journey" },
];

export function SlideWhoPays() {
  return (
    <SlideFrame n={18} kicker="Demand map">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-4">
          <Kicker>Who pays</Kicker>
          <Title size="lg">Value is collected where the system creates it.</Title>
        </div>
        <div className="mt-8 flex-1">
          <div className="grid grid-cols-[1.2fr_1.4fr_1fr] gap-px overflow-hidden rounded-lg" style={{ background: "var(--color-line)" }}>
            <div className="bg-surface-2 px-5 py-3 text-[13px] font-semibold tracking-[0.18em] text-subtle uppercase">Payer</div>
            <div className="bg-surface-2 px-5 py-3 text-[13px] font-semibold tracking-[0.18em] text-subtle uppercase">What they pay for</div>
            <div className="bg-surface-2 px-5 py-3 text-[13px] font-semibold tracking-[0.18em] text-subtle uppercase">Why it holds</div>
            {ROWS.map((r) => (
              <div key={r.who} className="contents">
                <div className="bg-surface px-5 py-5 text-[18px] font-semibold">{r.who}</div>
                <div className="bg-surface px-5 py-5 text-[17px] text-muted">{r.pays}</div>
                <div className="bg-surface px-5 py-5 text-[17px] text-fg">{r.why}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-5 mb-0 text-[17px] text-muted">
          Designed commercial map. Not a statement of current contracted revenue.
        </p>
      </div>
    </SlideFrame>
  );
}
