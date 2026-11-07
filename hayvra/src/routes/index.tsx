import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/hayvra/chrome";
import { Opening } from "@/components/hayvra/opening";
import { FinalCta, Foundation, Hero, What } from "@/components/hayvra/platform";
import { Ecosystem } from "@/components/hayvra/ecosystem";
import { Journey } from "@/components/hayvra/journey";
import { Housekeeping } from "@/components/hayvra/housekeeping";
import { Value } from "@/components/hayvra/value";
import { Team } from "@/components/hayvra/team";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [intro, setIntro] = useState(true);
  const closeIntro = useCallback(() => {
    try {
      sessionStorage.setItem("hayvra-intro", "1");
    } catch {
      /* ignore */
    }
    setIntro(false);
    requestAnimationFrame(() => {
      document.getElementById("hero-title")?.focus();
    });
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hayvra-intro") === "1") setIntro(false);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      {intro ? <Opening onClose={closeIntro} /> : null}
      <div inert={intro ? true : undefined}>
        <SiteHeader home />
        <main id="top">
          <Hero />
          <What />
          <Ecosystem />
          <Journey />
          <Housekeeping />
          <Value />
          <Foundation />
          <Team />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
