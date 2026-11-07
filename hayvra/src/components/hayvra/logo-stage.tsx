import { useEffect, useRef } from "react";
import { HayvraMark } from "@/components/hayvra/mark";

type Star = {
  x: number;
  y: number;
  z: number;
  vz: number;
  color: string;
  phase: number;
  tw: number;
  bright: number;
};

const PALETTE = ["#9ecbff", "#7eb6ff", "#c4b5fd", "#a78bfa", "#d8b4fe", "#e8f1ff", "#8eb4ff"];

function unit(i: number, k: number) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makeStar(i: number): Star {
  return {
    x: unit(i, 1) * 2 - 1,
    y: unit(i, 2) * 2 - 1,
    z: 0.12 + unit(i, 3) * 0.88,
    vz: 0.055 + unit(i, 4) * 0.09,
    color: PALETTE[Math.floor(unit(i, 5) * PALETTE.length)] ?? "#9ecbff",
    phase: unit(i, 6) * Math.PI * 2,
    tw: 0.7 + unit(i, 7) * 1.6,
    bright: unit(i, 8) > 0.84 ? 1 : 0.45 + unit(i, 8) * 0.4,
  };
}

function build(wide: boolean): Star[] {
  const count = wide ? 340 : 190;
  return Array.from({ length: count }, (_, i) => makeStar(i + 1));
}

function paintStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
  spark: boolean,
) {
  if (alpha < 0.04 || radius < 0.2) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;
  if (spark) {
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const b = a + Math.PI / 4;
      ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.lineTo(Math.cos(b) * radius * 0.28, Math.sin(b) * radius * 0.28);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function NightField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = build(window.innerWidth >= 760);
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = now / 1000;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const yaw = reduce ? 0 : Math.sin(t * 0.17) * 0.22;
      const pitch = reduce ? 0 : Math.cos(t * 0.13) * 0.1;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      if (!reduce) {
        for (const star of stars) {
          star.z -= star.vz * dt;
          if (star.z < 0.08) {
            star.z = 1;
            star.x = Math.random() * 2 - 1;
            star.y = Math.random() * 2 - 1;
          }
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const order = stars.slice().sort((a, b) => b.z - a.z);
      for (const star of order) {
        const x1 = star.x * cosY - star.z * sinY;
        const z1 = star.x * sinY + star.z * cosY;
        const y1 = star.y * cosP - z1 * sinP;
        const z = Math.max(0.12, star.y * sinP + z1 * cosP);
        const f = 0.85 / z;
        const sx = w * 0.5 + x1 * w * 0.9 * f;
        const sy = h * 0.5 + y1 * h * 0.9 * f;
        if (sx < -40 || sy < -40 || sx > w + 40 || sy > h + 40) continue;
        const near = 1 - star.z;
        const twinkle = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * star.tw + star.phase));
        const alpha = Math.min(1, (0.12 + near * 0.95) * twinkle * star.bright);
        const radius = Math.min(6.5, (0.35 + near * 2.4) * f);
        paintStar(ctx, sx, sy, radius, star.color, alpha, near > 0.45);
      }
    };

    if (reduce) {
      draw(0);
    } else {
      const loop = (now: number) => {
        if (!document.hidden) draw(now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="night-field" aria-hidden="true" />;
}

export function LogoStage() {
  return (
    <div className="logo-stage">
      <HayvraMark className="logo-mark" />
      <span className="logo-sheen" aria-hidden="true" />
      <span className="logo-sheen logo-sheen-late" aria-hidden="true" />
    </div>
  );
}
