import { useEffect, useRef } from "react";

/** Lime-glowing 4/8-point stars on the page background. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Star = {
      x: number;
      y: number;
      r: number;
      n: number;
      inner: number;
      a: number;
      s: number;
      p: number;
      tw: number;
    };
    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let raf = 0;

    const path = (cx: number, cy: number, r: number, n: number, inner: number) => {
      ctx.beginPath();
      for (let k = 0; k < n * 2; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / n;
        const rad = k % 2 === 0 ? r : r * inner;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad;
        if (k) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
    };

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = Array.from({ length: 42 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 3.5 + Math.random() * 9,
        n: Math.random() > 0.45 ? 8 : 4,
        inner: 0.38 + Math.random() * 0.16,
        a: Math.random() * Math.PI * 2,
        s: 0.003 + Math.random() * 0.01,
        p: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4,
      }));
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.s;
        const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.tw + s.p));
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.a);
        ctx.shadowColor = `rgba(198,255,0,${0.55 * glow})`;
        ctx.shadowBlur = 16 + s.r;
        ctx.fillStyle = `rgba(198,255,0,${0.2 + glow * 0.55})`;
        path(0, 0, s.r, s.n, s.inner);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(230,255,160,${0.3 + glow * 0.5})`;
        path(0, 0, s.r * 0.4, s.n, s.inner);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
