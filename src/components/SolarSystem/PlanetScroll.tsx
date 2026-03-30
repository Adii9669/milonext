"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLANETS = [
  {
    name: "DM",
    sub: "Our Star · Milky Way",
    fact: "1.3 million Earths could fit inside the Sun.",
    color: "#FFD060",
    glow: "rgba(255,200,80,0.5)",
    size: 0.13,
    rings: false,
    moons: 0,
  },
  {
    name: "CREWS",
    sub: "1st Planet · Closest to Sun",
    fact: "Temperatures swing from -180°C to 430°C.",
    color: "#A0A0A8",
    glow: "rgba(160,160,168,0.3)",
    size: 0.055,
    rings: false,
    moons: 0,
  },
  {
    name: "ENCRYPTION",
    sub: "2nd Planet · Evening Star",
    fact: "Hotter than Mercury — runaway greenhouse effect.",
    color: "#E8C97A",
    glow: "rgba(232,201,122,0.35)",
    size: 0.075,
    rings: false,
    moons: 0,
  },
  {
    name: "Earth",
    sub: "3rd Planet · Our Home",
    fact: "The only known planet with liquid water and life.",
    color: "#4A8FF0",
    glow: "rgba(74,143,240,0.35)",
    size: 0.08,
    rings: false,
    moons: 1,
  },
  {
    name: "Mars",
    sub: "4th Planet · Red Planet",
    fact: "Olympus Mons is the tallest volcano in the solar system.",
    color: "#D85A32",
    glow: "rgba(216,90,50,0.35)",
    size: 0.065,
    rings: false,
    moons: 2,
  },
  {
    name: "Jupiter",
    sub: "5th Planet · Gas Giant",
    fact: "The Great Red Spot storm has raged for over 350 years.",
    color: "#C89BB5",
    glow: "rgba(200,155,181,0.4)",
    size: 0.16,
    rings: false,
    moons: 95,
  },
  {
    name: "Saturn",
    sub: "6th Planet · Ringed World",
    fact: "Its rings stretch 282,000 km wide.",
    color: "#E8D090",
    glow: "rgba(232,208,144,0.35)",
    size: 0.13,
    rings: true,
    moons: 146,
  },
  {
    name: "Uranus",
    sub: "7th Planet · Ice Giant",
    fact: "Rotates on its side — axis tilted 98°.",
    color: "#72D8E2",
    glow: "rgba(114,216,226,0.35)",
    size: 0.1,
    rings: false,
    moons: 27,
  },
  {
    name: "Neptune",
    sub: "8th Planet · Farthest World",
    fact: "Winds reach 2,100 km/h — fastest in the solar system.",
    color: "#2E6EE8",
    glow: "rgba(46,110,232,0.35)",
    size: 0.095,
    rings: false,
    moons: 16,
  },
];

const STARS = Array.from({ length: 220 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.3 + 0.1,
  a: Math.random() * 0.5 + 0.1,
  tw: Math.random() * Math.PI * 2,
  sp: Math.random() * 0.6 + 0.3,
}));

export default function PlanetScrollBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number,
      t = 0;
    let W = 0,
      H = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
    }

    function getProgress() {
      const scrollTop = window.scrollY;
      const maxScroll = container.offsetHeight - window.innerHeight;
      return Math.max(0, Math.min(1, scrollTop / maxScroll));
    }

    function drawPlanet(
      p: (typeof PLANETS)[0],
      cx: number,
      cy: number,
      scale: number,
      alpha: number,
      tVal: number,
    ) {
      if (alpha < 0.01) return;
      const r = Math.min(W, H) * p.size * scale;
      ctx.globalAlpha = alpha;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.5);
      g.addColorStop(0, p.glow);
      g.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      if (p.name === "The Sun") {
        const pulse = 1 + 0.03 * Math.sin(tVal * 1.4);
        const corona = ctx.createRadialGradient(
          cx,
          cy,
          r * 0.4,
          cx,
          cy,
          r * 2.5 * pulse,
        );
        corona.addColorStop(0, "rgba(255,220,100,0.6)");
        corona.addColorStop(0.4, "rgba(255,160,40,0.2)");
        corona.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = corona;
        ctx.fill();
        const sg = ctx.createRadialGradient(
          cx - r * 0.2,
          cy - r * 0.2,
          0,
          cx,
          cy,
          r,
        );
        sg.addColorStop(0, "#FFFAE0");
        sg.addColorStop(0.45, "#FFD050");
        sg.addColorStop(1, "#FF7010");
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (p.rings) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(1, 0.28);
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 2.3, r * 2.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${p.color}60`;
          ctx.lineWidth = r * 0.65;
          ctx.stroke();
          ctx.restore();
        }
        if (p.moons > 0) {
          const ma = tVal * 0.8;
          const mr = r * (p.moons > 10 ? 1.7 : 1.45);
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(ma) * mr,
            cy + Math.sin(ma) * mr * 0.4,
            r * 0.14,
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = "rgba(220,220,220,0.7)";
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function draw() {
      t += 0.012;
      ctx.clearRect(0, 0, W, H);

      for (const s of STARS) {
        const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.tw);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.a * tw).toFixed(3)})`;
        ctx.fill();
      }

      const p = getProgress();
      const rawIdx = p * (PLANETS.length - 1);
      const fromIdx = Math.floor(rawIdx);
      const toIdx = Math.min(PLANETS.length - 1, fromIdx + 1);
      const blend = rawIdx - fromIdx;
      const eased =
        blend < 0.5 ? 2 * blend * blend : 1 - Math.pow(-2 * blend + 2, 2) / 2;

      const cx = W * 0.62,
        cy = H * 0.5;

      if (fromIdx !== toIdx) {
        drawPlanet(PLANETS[fromIdx], cx, cy, 1 + eased * 0.6, 1 - eased, t);
        drawPlanet(PLANETS[toIdx], cx, cy, 0.3 + eased * 0.7, eased, t);
      } else {
        drawPlanet(PLANETS[fromIdx], cx, cy, 1, 1, t);
      }

      setActiveIdx(Math.round(rawIdx));
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

  const pl = PLANETS[activeIdx];

  return (
    <div
      ref={containerRef}
      style={{ blockSize: `${PLANETS.length * 100}vh` }}
      className="relative"
    >
      {/* sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        />

        {/* Planet info — bottom left */}
        <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p
                className="text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ color: "#00E5FF" }}
              >
                {pl.sub}
              </p>
              <h2
                className="text-[clamp(28px,6vw,58px)] font-black uppercase tracking-widest leading-none"
                style={{
                  color: "#C89BB5",
                  textShadow: "0 0 40px rgba(200,155,181,0.4)",
                }}
              >
                {pl.name}
              </h2>
              <p
                className="mt-3 text-[13px] max-w-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {pl.fact}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot nav — right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 pointer-events-none">
          {PLANETS.map((p, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                inlineSize: i === activeIdx ? "8px" : "5px",
                blockSize: i === activeIdx ? "8px" : "5px",
                background:
                  i === activeIdx ? "#C89BB5" : "rgba(200,155,181,0.25)",
                transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-2px z-10 transition-all"
          style={{
            inlineSize: `${(activeIdx / (PLANETS.length - 1)) * 100}%`,
            background: "linear-gradient(90deg,#00E5FF,#C89BB5,#f472b6)",
          }}
        />
      </div>
    </div>
  );
}
