import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogoStage } from "@/components/hayvra/logo-stage";

const DIGITAL = ["Stay management", "Room and dining requests", "Privacy and housekeeping on request", "Amenity booking", "Department messaging"];
const DEVICES = ["Lighting", "Climate", "Curtains", "Locks"];

export function Hero() {
  return (
    <section className="flex min-h-svh flex-col justify-center px-5 pb-16 pt-28 md:px-8" aria-labelledby="hero-title">
      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <LogoStage />
        <h1 id="hero-title" tabIndex={-1} className="wordmark" lang="en" dir="ltr" aria-label="HAYVRA">
          {"HAYVRA".split("").map((ch, index) => (
            <span key={`${ch}-${index}`} className="hero-letter" style={{ animationDelay: `${index * 0.35}s` }}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="kicker mt-6" lang="en" dir="ltr">
          Intelligent Hospitality Platform
        </p>
        <p className="mx-auto mt-6 max-w-xl text-xl font-light md:text-2xl">
          Hospitality that understands you. Technology that handles every detail.
        </p>
        <p className="quiet mx-auto mt-5 max-w-2xl text-base md:text-lg">
          A Saudi-born intelligence layer above the hotel systems already in place. For operators who want a clearer stay, a calmer operation, and growth that can be measured.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/demo" className="btn btn-gold">
            Request a demo
          </Link>
          <a className="btn btn-line" href="#ecosystem">
            Explore the ecosystem
          </a>
        </div>
      </div>
    </section>
  );
}

export function What() {
  const [linked, setLinked] = useState(false);
  return (
    <section id="platform" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28" aria-labelledby="platform-title">
      <div className="mx-auto w-full max-w-3xl px-5 md:px-8">
        <div>
          <p className="num">01</p>
          <p className="kicker mt-5" lang="en" dir="ltr">
            The Future of Intelligent Hospitality
          </p>
          <h2 id="platform-title" className="mt-3 text-3xl font-light md:text-5xl">
            The future of intelligent hospitality
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed md:text-lg">
            <p>
              HAYVRA is an intelligence platform for hotels. It connects the guest experience with operations, services, smart devices, marketing, and rewards in one system.
            </p>
            <p>
              It sits above the systems already in place. Where a hotel uses Oracle OPERA, OPERA remains the source for reservations and stays. HAYVRA does not replace it.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Property capability in this example">
            <button type="button" className={linked ? "choice" : "choice is-on"} aria-pressed={!linked} onClick={() => setLinked(false)}>
              No smart devices
            </button>
            <button type="button" className={linked ? "choice is-on" : "choice"} aria-pressed={linked} onClick={() => setLinked(true)}>
              With compatible devices
            </button>
          </div>
          <ul className="mt-6 space-y-2">
            {DIGITAL.map((item) => (
              <li key={item} className="flex items-center justify-between gap-4 border-b border-gold/15 py-2">
                <span>{item}</span>
                <span className="sim">Available digitally</span>
              </li>
            ))}
            {DEVICES.map((item) => (
              <li key={item} className="flex items-center justify-between gap-4 border-b border-gold/15 py-2">
                <span>{item}</span>
                <span className="sim">{linked ? "If the device is linked" : "Not required"}</span>
              </li>
            ))}
          </ul>
          <p className="note mt-6">
            The platform adapts to the hotel. Digital services work without smart locks or climate control. Device control is added only for what is compatible and authorized.
          </p>
        </div>
      </div>
    </section>
  );
}

const LAYERS = [
  {
    id: "experience",
    title: "Experience and coordination",
    en: "HAYVRA",
    body: "The guest experience, department coordination, marketing with guest consent, and device control through separate integrations. This is the addition. It is not the property management system.",
  },
  {
    id: "links",
    title: "Independent integrations",
    en: "According to the property",
    body: "Point of sale, building management, climate, lighting, locks, and IoT gateways. Each link depends on vendor fit, permissions, and installation. These are not completed production integrations, and they are not announced partnerships.",
  },
  {
    id: "opera",
    title: "Property system",
    en: "Oracle OPERA where used",
    body: "Oracle OPERA holds reservation, stay, and operational data for hotels that already use it. HAYVRA does not replace it. The name here describes the system. It is not a partnership mark.",
  },
];

export function Foundation() {
  const [open, setOpen] = useState("experience");
  return (
    <section id="foundation" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28" aria-labelledby="foundation-title">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="num">05</p>
        <p className="kicker mt-5" lang="en" dir="ltr">
          Built on existing hotel infrastructure
        </p>
        <h2 id="foundation-title" className="mt-3 max-w-3xl text-3xl font-light md:text-5xl">
          On top of what the hotel already has
        </h2>
        <div className="mt-10 grid gap-3">
          {LAYERS.map((layer, index) => {
            const on = open === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(layer.id)}
                className="panel px-5 py-5 text-start md:px-8"
              >
                <span className="num">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-2xl font-light">{layer.title}</span>
                  <span className="kicker" lang="en" dir="ltr">
                    {layer.en}
                  </span>
                </span>
                {on ? <span className="quiet mt-4 block max-w-3xl text-base leading-relaxed">{layer.body}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="contact" className="border-t border-gold/20 px-5 py-24 md:px-8" aria-labelledby="contact-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="kicker" lang="en" dir="ltr">
          Request a demo
        </p>
        <h2 id="contact-title" className="mt-4 text-3xl font-light md:text-5xl">
          A demo worthy of your hotel
        </h2>
        <p className="quiet mt-5 text-lg">
          We walk your team through the concept and what can run on the infrastructure you already have, without replacing the property system.
        </p>
        <Link to="/demo" className="btn btn-gold mt-8">
          Request a demo
        </Link>
      </div>
    </section>
  );
}
