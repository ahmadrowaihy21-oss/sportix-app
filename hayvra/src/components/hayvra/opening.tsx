import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArchLine, HayvraMark } from "@/components/hayvra/mark";

const LETTERS = ["H", "A", "Y", "V", "R", "A"];

export function Opening({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [light, setLight] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const onCloseRef = useRef(onClose);
  const reduceRef = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceRef.current = reduce;
    const finish = () => {
      setClosing(true);
      window.setTimeout(() => onCloseRef.current(), reduceRef.current ? 0 : 620);
    };
    const timer = window.setTimeout(finish, reduce ? 1700 : 9200);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prev;
    };
  }, []);

  const rich = !light && photoOk;

  return (
    <div
      className={closing ? "opening is-closing" : "opening"}
      role="dialog"
      aria-modal="true"
      aria-label="HAYVRA opening"
    >
      {rich ? (
        <img
          src="/media/corridor.jpg"
          alt=""
          width={1600}
          height={900}
          className="opening-plate"
          onError={() => setPhotoOk(false)}
        />
      ) : (
        <div className="corridor" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="arch-plane" style={{ "--i": i } as CSSProperties}>
              <ArchLine />
            </div>
          ))}
          <div className="light-wash" />
        </div>
      )}
      <div className="opening-shade" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 md:px-8">
          <p className="wordmark-sm" lang="en" dir="ltr">
            HAYVRA
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-line" onClick={() => setLight((v) => !v)}>
              {light ? "Cinematic" : "Quiet version"}
            </button>
            <button
              ref={skipRef}
              type="button"
              className="btn btn-gold"
              onClick={() => {
                setClosing(true);
                window.setTimeout(() => onCloseRef.current(), reduceRef.current ? 0 : 620);
              }}
            >
              Skip
            </button>
          </div>
        </div>
        <div className="mt-auto px-5 pb-16 text-center md:pb-24">
          <HayvraMark className="mx-auto mb-4 h-24 w-auto md:h-28" />
          <div className="rule-draw" aria-hidden="true" />
          <p className="wordmark mt-6" lang="en" dir="ltr" aria-label="HAYVRA">
            {LETTERS.map((ch, i) => (
              <span key={`${ch}-${i}`} className="letter">
                {ch}
              </span>
            ))}
          </p>
          <p className="kicker reveal reveal-tag mt-6" lang="en" dir="ltr">
            Intelligent Hospitality Platform
          </p>
          <p className="reveal reveal-ar mx-auto mt-4 max-w-xl text-xl font-light md:text-2xl">
            Hospitality that understands you. Technology that handles every detail.
          </p>
          <p className="reveal reveal-sys quiet mx-auto mt-8 max-w-2xl text-sm md:text-base">
            Guest experience · Hotel operations · Intelligence · Connect · Digital key · Privacy and housekeeping · Growth · Rewards
          </p>
        </div>
      </div>
    </div>
  );
}
