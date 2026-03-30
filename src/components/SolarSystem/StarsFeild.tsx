"use client";
import { useEffect, useRef } from "react";

const LAYERS = [
  { count: 90, rMin: 0.15, rMax: 0.7, aMin: 0.08, aMax: 0.3, speed: 0.25 },
  { count: 70, rMin: 0.4, rMax: 1.1, aMin: 0.15, aMax: 0.5, speed: 0.55 },
  { count: 35, rMin: 0.8, rMax: 1.8, aMin: 0.3, aMax: 0.75, speed: 1.0 },
  { count: 12, rMin: 1.4, rMax: 2.8, aMin: 0.5, aMax: 1.0, speed: 1.6 },
];

function rand(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

export default function StarfieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;
    let stars: any[] = [];

    function build() {
      stars = [];
      for (const L of LAYERS) {
        for (let i = 0; i < L.count; i++) {
          stars.push({
            x: Math.random(),
            y: Math.random(),
            r: rand(L.rMin, L.rMax),
            baseA: rand(L.aMin, L.aMax),
            phase: rand(0, Math.PI * 2),
            speed: L.speed,
            hue:
              Math.random() < 0.15
                ? Math.random() < 0.5
                  ? rand(195, 220)
                  : rand(310, 340)
                : 0,
            sat: Math.random() < 0.15 ? rand(40, 80) : 0,
          });
        }
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      // full document height so stars cover the WHOLE page
      const W = document.documentElement.scrollWidth;
      const H = document.documentElement.scrollHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
      build();
    }

    function draw() {
      t += 0.012;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const alpha = s.baseA * (0.4 + 0.6 * tw);
        const color = s.hue
          ? `hsla(${s.hue},${s.sat}%,85%,${alpha.toFixed(3)})`
          : `rgba(255,255,255,${alpha.toFixed(3)})`;

        if (s.r > 1.2) {
          const g = ctx.createRadialGradient(
            s.x * W,
            s.y * H,
            0,
            s.x * W,
            s.y * H,
            s.r * 4,
          );
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
