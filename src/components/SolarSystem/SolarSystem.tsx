"use client";
import { useEffect, useRef } from "react";

const PLANETS = [
  { orbit: 0.10, size: 3,   color: "#9E9E9E", speed: 1.607, angle: 0.5,  tilt: 0.18 },
  { orbit: 0.16, size: 5,   color: "#E8C97A", speed: 1.174, angle: 1.2,  tilt: 0.15 },
  { orbit: 0.22, size: 5.5, color: "#5B9BF5", speed: 1.0,   angle: 2.1,  tilt: 0.13 },
  { orbit: 0.29, size: 4,   color: "#E0603A", speed: 0.802, angle: 0.8,  tilt: 0.12 },
  { orbit: 0.40, size: 12,  color: "#C89BB5", speed: 0.434, angle: 3.4,  tilt: 0.10 },
  { orbit: 0.50, size: 10,  color: "#E8D5A0", speed: 0.323, angle: 1.9,  tilt: 0.09, ring: true },
  { orbit: 0.60, size: 7,   color: "#7FD8E0", speed: 0.228, angle: 4.1,  tilt: 0.08 },
  { orbit: 0.70, size: 6.5, color: "#3A7BF5", speed: 0.182, angle: 0.3,  tilt: 0.07 },
];

const STARS = Array.from({ length: 220 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.3 + 0.2,
  a: Math.random() * 0.5 + 0.15,
  tw: Math.random() * Math.PI * 2,
}));

export default function SolarSystemBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    function draw() {
      t += 0.008;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      for (const s of STARS) {
        const tw = 0.6 + 0.4 * Math.sin(t * 0.8 + s.tw);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
        ctx.fill();
      }

      const sunR = Math.min(W, H) * 0.07;
      ctx.save();
      ctx.translate(cx, cy);

      for (const p of PLANETS) {
        const rx = Math.min(W, H) * 0.5 * p.orbit;
        const ry = rx * p.tilt;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(200,155,181,0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (const p of PLANETS) {
        const rx = Math.min(W, H) * 0.5 * p.orbit;
        const ry = rx * p.tilt;
        const angle = p.angle + t * p.speed * 0.4;
        const px = Math.cos(angle) * rx;
        const py = Math.sin(angle) * ry;

        if (p.ring) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle * 0.3 + 0.4);
          ctx.scale(1, 0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2.2, p.size * 2.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${p.color}55`;
          ctx.lineWidth = p.size * 0.55;
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
        glow.addColorStop(0, `${p.color}44`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      const sp = 1 + 0.03 * Math.sin(t * 1.5);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, sunR * 3.5 * sp);
      sg.addColorStop(0, "rgba(255,220,120,0.55)");
      sg.addColorStop(0.35, "rgba(255,160,60,0.18)");
      sg.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(0, 0, sunR * 3.5 * sp, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      const sc = ctx.createRadialGradient(0, 0, 0, 0, 0, sunR * sp);
      sc.addColorStop(0, "#FFF5CC");
      sc.addColorStop(0.4, "#FFD060");
      sc.addColorStop(1, "#FF8020");
      ctx.beginPath();
      ctx.arc(0, 0, sunR * sp, 0, Math.PI * 2);
      ctx.fillStyle = sc;
      ctx.fill();

      ctx.restore();
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}