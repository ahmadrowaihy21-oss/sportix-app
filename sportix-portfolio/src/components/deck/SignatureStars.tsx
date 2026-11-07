import { useEffect, useRef } from "react";

type Pt = { x: number; y: number };

const BLUE = ["#6ec8ff", "#4da6ff", "#89d4ff", "#3b8dff"];
const PURPLE = ["#c084fc", "#a855f7", "#d8b4fe", "#7c3aed"];

type Phase = "trace" | "rewind" | "dash" | "scatter" | "drift";

type Star = {
  offset: number;
  color: string;
  r: number;
  n: 4 | 8;
  inner: number;
  spin: number;
  spinV: number;
  rx: number;
  ry: number;
  z: number;
  weave: number;
  weaveS: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  vz: number;
};

const T_TRACE = 11000;
const T_REWIND = 900;
const T_DASH = 520;
const T_SCATTER = 2800;

export function SignatureStars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stage = canvas.closest(".slide-stage") as HTMLElement | null;
    if (!stage) return;

    let raf = 0;
    let running = true;
    let path: Pt[] = [];
    let stars: Star[] = [];
    let cycleStart = 0;
    let phase: Phase = "trace";
    let phaseT = 0;

    const starPath = (cx: number, cy: number, r: number, n: number, inner: number) => {
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

    const along = (t: number): Pt => {
      if (path.length < 2) return { x: 1500, y: 540 };
      const u = Math.max(0, Math.min(0.999, t)) * (path.length - 1);
      const i = Math.floor(u);
      const f = u - i;
      const a = path[i];
      const b = path[i + 1] ?? a;
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    };

    const spawn = () => {
      stars = Array.from({ length: 34 }, (_, i) => {
        const purple = i % 2 === 0;
        const palette = purple ? PURPLE : BLUE;
        return {
          offset: (i / 34) * 0.22,
          color: palette[i % palette.length],
          r: 3.2 + (i % 5) * 1.15,
          n: i % 3 === 0 ? 8 : 4,
          inner: 0.38,
          spin: Math.random() * Math.PI * 2,
          spinV: 0.006 + Math.random() * 0.01,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          z: (Math.random() - 0.5) * 140,
          weave: 10 + Math.random() * 18,
          weaveS: 2 + Math.random() * 3.4,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          vz: 0,
        };
      });
    };

    const placeOnPath = (s: Star, t: number, extraSpin: number) => {
      const tt = Math.max(0, Math.min(1, t - s.offset * (phase === "trace" ? 1 : 0.15)));
      const p = along(tt);
      const p2 = along(Math.min(1, tt + 0.012));
      const dx = p2.x - p.x;
      const dy = p2.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const w = Math.sin(tt * Math.PI * s.weaveS + s.spin) * s.weave;
      s.x = p.x + nx * w;
      s.y = p.y + ny * w + Math.cos(tt * 6 + s.rx) * 4;
      s.spin += s.spinV + extraSpin;
      s.rx += 0.03 + extraSpin * 0.6;
      s.ry += 0.02 + extraSpin * 0.4;
      s.z = Math.sin(tt * Math.PI * 2 + s.ry) * 90;
    };

    const drawStar = (s: Star, alpha: number) => {
      const persp = 520;
      const sc = persp / (persp + s.z);
      const cx = 1920 * 0.72;
      const cy = 1080 * 0.48;
      const x = cx + (s.x - cx) * sc;
      const y = cy + (s.y - cy) * sc;
      const squash = 0.55 + 0.45 * Math.cos(s.rx);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(s.spin);
      ctx.scale(sc, sc * squash);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 14 + s.r * 1.4;
      ctx.fillStyle = s.color;
      starPath(0, 0, s.r, s.n, s.inner);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      starPath(0, 0, s.r * 0.32, s.n, s.inner);
      ctx.fill();
      ctx.restore();
    };

    const samplePath = async () => {
      const mark = stage.querySelector(".sig-mark") as HTMLElement | null;
      const imgEl = stage.querySelector(".sig-ink") as HTMLImageElement | null;
      if (!mark || !imgEl) return;
      const img = new Image();
      img.src = imgEl.currentSrc || imgEl.src;
      await img.decode().catch(() => undefined);

      const off = document.createElement("canvas");
      off.width = img.naturalWidth || 2145;
      off.height = img.naturalHeight || 689;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const local: Pt[] = [];
      const step = Math.max(4, Math.floor(off.width / 160));
      for (let x = 0; x < off.width; x += step) {
        const ys: number[] = [];
        for (let y = 0; y < off.height; y += 2) {
          if (data[(y * off.width + x) * 4 + 3] > 70) ys.push(y);
        }
        if (ys.length) {
          const y = ys[Math.floor(ys.length / 2)];
          local.push({ x, y });
        }
      }
      const br = mark.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const scale = sr.width / 1920;
      const left = (br.left - sr.left) / scale;
      const top = (br.top - sr.top) / scale;
      const w = br.width / scale;
      const h = br.height / scale;
      path = local.map((p) => ({
        x: left + (p.x / off.width) * w,
        y: top + (p.y / off.height) * h,
      }));
    };

    const tick = (now: number) => {
      if (!running) return;
      if (!cycleStart) cycleStart = now;
      const elapsed = now - cycleStart;
      ctx.clearRect(0, 0, 1920, 1080);

      let extraSpin = 0;
      let alpha = 1;
      if (elapsed < T_TRACE) {
        phase = "trace";
        phaseT = elapsed / T_TRACE;
      } else if (elapsed < T_TRACE + T_REWIND) {
        phase = "rewind";
        phaseT = 1 - (elapsed - T_TRACE) / T_REWIND;
        extraSpin = 0.28;
      } else if (elapsed < T_TRACE + T_REWIND + T_DASH) {
        phase = "dash";
        const u = (elapsed - T_TRACE - T_REWIND) / T_DASH;
        phaseT = 1 - Math.pow(1 - u, 3);
        extraSpin = 0.18;
      } else if (elapsed < T_TRACE + T_REWIND + T_DASH + T_SCATTER) {
        if (phase !== "scatter") {
          phase = "scatter";
          for (const s of stars) {
            const dir = Math.atan2(s.y - 540, s.x - 960) + (Math.random() - 0.5) * 1.4;
            const sp = 3.2 + Math.random() * 7.5;
            s.vx = Math.cos(dir) * sp * (Math.random() > 0.5 ? 1 : -1) + (Math.random() - 0.5) * 8;
            s.vy = Math.sin(dir) * sp + (Math.random() - 0.5) * 7;
            s.vz = (Math.random() - 0.5) * 9;
            s.spinV = 0.08 + Math.random() * 0.14;
          }
        }
        const scatT = (elapsed - T_TRACE - T_REWIND - T_DASH) / T_SCATTER;
        alpha = 1;
        if (scatT > 1) {
          phase = "drift";
        }
      } else {
        phase = "drift";
        alpha = 1;
      }

      if (phase !== "scatter" && phase !== "drift") {
        for (const s of stars) placeOnPath(s, phaseT, extraSpin);
      } else {
        for (const s of stars) {
          s.x += s.vx;
          s.y += s.vy;
          s.z += s.vz;
          if (phase === "drift") {
            s.vx = s.vx * 0.96 + (Math.random() - 0.5) * 0.04;
            s.vy = s.vy * 0.96 + (Math.random() - 0.5) * 0.04;
            s.vz *= 0.98;
            s.spinV = 0.018;
            if (s.x < -40) s.x = 1960;
            if (s.x > 1960) s.x = -40;
            if (s.y < -40) s.y = 1120;
            if (s.y > 1120) s.y = -40;
          } else {
            s.vx *= 0.992;
            s.vy *= 0.992;
          }
          s.spin += s.spinV;
          s.rx += phase === "drift" ? 0.02 : 0.08;
          s.ry += phase === "drift" ? 0.015 : 0.05;
        }
      }

      const ordered = [...stars].sort((a, b) => b.z - a.z);
      for (const s of ordered) drawStar(s, alpha);

      raf = requestAnimationFrame(tick);
    };

    spawn();
    void samplePath().then(() => {
      if (!running) return;
      cycleStart = performance.now();
      raf = requestAnimationFrame(tick);
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={1920}
      height={1080}
      className="pointer-events-none absolute inset-0 z-[25]"
      aria-hidden
    />
  );
}
