"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Message {
  id: string;
  sender: "peer" | "user";
  author: string;
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "peer",
    author: "Alpha",
    text: "Relay connection online. Full-duplex WebSocket stream active.",
    time: "10:14",
  },
  {
    id: "m-2",
    sender: "user",
    author: "You",
    text: "Sub-50ms dispatch confirmed across concurrent channels.",
    time: "10:15",
  },
  {
    id: "m-3",
    sender: "peer",
    author: "Alpha",
    text: "Clean. Type a message below to test the local response pipeline.",
    time: "10:15",
  },
];

const PROCESS_STAGES = [
  {
    num: "01",
    title: "Think",
    badge: "STAGE 01 / DECONSTRUCTION",
    desc: "Interrogate assumptions. Identify the true bottleneck and human friction point before committing a single line of architecture.",
    detail: "Every great piece of software solves one genuine human need with zero ambiguity.",
  },
  {
    num: "02",
    title: "Design",
    badge: "STAGE 02 / COMPOSITION",
    desc: "Form amplifies function. Sculpt high-contrast typography, restrained visual depth, and tactile micro-interactions that feel natural.",
    detail: "Negative space is an active design decision, not empty emptiness.",
  },
  {
    num: "03",
    title: "Build",
    badge: "STAGE 03 / SYNTHESIS",
    desc: "High-concurrency Go relay handlers, persistent bidirectional WebSockets, and type-safe Next.js interfaces engineered for resilience.",
    detail: "Code built for production throughput and verifiable reliability.",
  },
  {
    num: "04",
    title: "Repeat",
    badge: "STAGE 04 / EVOLUTION",
    desc: "Profile latency, tighten transitions, and ruthlessly prune complexity. Great software is never finished—it continually evolves.",
    detail: "Refine until every interaction feels instantaneous and intuitive.",
  },
];

export default function AlwaysBuildingLanding() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Nav contrast & active section tracking
  const [navCream, setNavCream] = useState(false);
  const [activeSection, setActiveSection] = useState("opening");

  // Scene 2 Pinned Stage state
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  // Scene 3 Interactive Demo state
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local interactive chat message handler
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      author: "You",
      text: trimmed,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsReplying(true);

    setTimeout(() => {
      const replyMsg: Message = {
        id: `peer-${Date.now()}`,
        sender: "peer",
        author: "Alpha",
        text: "Message verified in local buffer. Relay state dispatch nominal.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, replyMsg]);
      setIsReplying(false);
    }, 600);
  };

  const handleResetDemo = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText("");
    setIsReplying(false);
  };

  // GSAP ScrollTrigger master animation orchestration
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 992;

    const ctx = gsap.context(() => {
      // Nav theme detection triggers
      ScrollTrigger.create({
        trigger: "#process",
        start: "top 60px",
        end: "bottom 60px",
        onEnter: () => setNavCream(true),
        onLeave: () => setNavCream(false),
        onEnterBack: () => setNavCream(true),
        onLeaveBack: () => setNavCream(false),
      });

      ScrollTrigger.create({
        trigger: "#work",
        start: "top 60px",
        end: "bottom 60px",
        onEnter: () => setNavCream(true),
        onLeave: () => setNavCream(false),
        onEnterBack: () => setNavCream(true),
        onLeaveBack: () => setNavCream(false),
      });

      // Section tracker for nav links
      ["opening", "process", "product", "engineering", "work", "closing"].forEach((sec) => {
        ScrollTrigger.create({
          trigger: `#${sec}`,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActiveSection(sec);
          },
        });
      });

      if (!isReduced) {
        // ── Scene 1: Hero entrance and scroll-driven typography scaling & parallax
        const heroWords = gsap.utils.toArray<HTMLElement>(".ab-split-word");
        gsap.from(heroWords, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.08,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.2,
        });

        gsap.from(".ab-hero-lead", {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power2.out",
          delay: 0.7,
        });

        // Scrubbing parallax on hero
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#opening",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        heroTl
          // The whole hero copy (tag, headline, lead, buttons, scroll cue)
          // lifts and dissolves as the idea is left behind.
          .to(
            ".ab-hero .ab-container",
            { y: -110, opacity: 0, ease: "power1.in" },
            0
          )
          // Headline zooms toward the viewer and splits apart.
          .to(
            ".ab-hero-h1",
            { scale: 1.42, y: -50, transformOrigin: "center top", ease: "none" },
            0
          )
          .to(".ab-split-word-left", { x: -120 }, 0)
          .to(".ab-split-word-right", { x: 120 }, 0)
          // The amber idea-orb sinks and fades into the background.
          .to(".ab-orb-container", { y: 280, scale: 1.6, opacity: 0 }, 0);

        // ── Scene 2: Pinned Process Stages
        if (!isMobile) {
          const processTl = gsap.timeline({
            scrollTrigger: {
              trigger: "#process",
              start: "top top",
              end: "+=2600",
              pin: true,
              scrub: 0.8,
              onUpdate: (self) => {
                const progress = self.progress;
                const idx = Math.min(3, Math.floor(progress * 4));
                setCurrentStageIdx(idx);
              },
            },
          });

          processTl
            .fromTo(
              ".ab-process-stage-card",
              { scale: 0.94, opacity: 0.8 },
              { scale: 1, opacity: 1, duration: 1 }
            )
            .to(".ab-meter-fill", { width: "100%", duration: 4, ease: "none" }, 0);
        }

        // ── Scene 3: Magnetic Assembly of the Product Chat Interface
        const productTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#product",
            start: "top 75%",
            end: "top 25%",
            scrub: 1,
          },
        });

        productTl
          .fromTo(
            ".ab-chat-topbar",
            { y: -50, x: -30, rotateX: 18, opacity: 0 },
            { y: 0, x: 0, rotateX: 0, opacity: 1, ease: "power2.out" }
          )
          .fromTo(
            ".ab-msg-bubble--peer",
            { x: -90, rotateZ: -4, opacity: 0 },
            { x: 0, rotateZ: 0, opacity: 1, stagger: 0.15 },
            0.1
          )
          .fromTo(
            ".ab-msg-bubble--user",
            { x: 90, rotateZ: 4, opacity: 0 },
            { x: 0, rotateZ: 0, opacity: 1 },
            0.15
          )
          .fromTo(
            ".ab-chat-input-bar",
            { y: 60, scale: 0.9, opacity: 0 },
            { y: 0, scale: 1, opacity: 1 },
            0.2
          );

        // ── Scene 4: Architectural Flow & SVG Connection Trace
        const archTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#engineering",
            start: "top 70%",
            end: "bottom 80%",
            scrub: 0.8,
          },
        });

        archTl
          .fromTo(".ab-arch-card", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2 })
          .to(".ab-pipeline-path-glow", { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut" }, 0.2);

        // ── Scene 5: Pinned Horizontal Project Track
        if (!isMobile) {
          const workTrack = document.querySelector(".ab-work-track") as HTMLElement;
          if (workTrack) {
            const scrollDistance = workTrack.scrollWidth - window.innerWidth + 180;
            gsap.to(workTrack, {
              x: -scrollDistance,
              ease: "none",
              scrollTrigger: {
                trigger: "#work",
                start: "top top",
                end: `+=${Math.max(1600, scrollDistance)}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }
        }

        // ── Scene 6: Closing Headline & Ambient Orb
        gsap.from(".ab-closing-h1", {
          scrollTrigger: {
            trigger: "#closing",
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
          },
          scale: 0.85,
          letterSpacing: "0.08em",
          opacity: 0.3,
        });

        gsap.from(".ab-closing-orb", {
          scrollTrigger: {
            trigger: "#closing",
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
          scale: 0.6,
          opacity: 0.1,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const activeStage = PROCESS_STAGES[currentStageIdx];

  return (
    <div className="ab-page" ref={rootRef}>
      {/* Subtle Grain Overlay */}
      <div className="ab-noise" aria-hidden="true" />

      {/* Navigation */}
      <nav className={`ab-nav ${navCream ? "ab-nav--cream" : ""}`} aria-label="Main Navigation">
        <Link href="/" className="ab-nav-brand">
          <span className="ab-nav-logo">Onechat</span>
          <span className="ab-nav-badge">Always Building</span>
        </Link>

        <div className="ab-nav-links">
          <a href="#process" className={`ab-nav-link ${activeSection === "process" ? "active" : ""}`}>
            Process
          </a>
          <a href="#product" className={`ab-nav-link ${activeSection === "product" ? "active" : ""}`}>
            Product
          </a>
          <a
            href="#engineering"
            className={`ab-nav-link ${activeSection === "engineering" ? "active" : ""}`}
          >
            Architecture
          </a>
          <a href="#work" className={`ab-nav-link ${activeSection === "work" ? "active" : ""}`}>
            Projects
          </a>
        </div>

        <div className="ab-nav-actions">
          <Link href="/login" className="ab-btn-text">
            Sign in
          </Link>
          <Link href="/signup" className="ab-btn-primary">
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── SCENE 1: THE IDEA (CINEMATIC OPENING) ───────────── */}
      <section className="ab-section ab-hero" id="opening">
        <div className="ab-orb-container" aria-hidden="true">
          <div className="ab-orb" />
        </div>

        <div className="ab-container">
          <div className="ab-tag">01 / Creative Engineering</div>
          <div className="ab-hero-headline-wrap">
            <h1 className="ab-h1 ab-hero-h1">
              <span className="ab-split-word ab-split-word-left">Everything</span>{" "}
              <span className="ab-split-word">starts</span>{" "}
              <span className="ab-split-word">with</span>{" "}
              <span className="ab-split-word">an</span>{" "}
              <span className="ab-split-word ab-split-word-right" style={{ color: "var(--ab-amber)" }}>
                idea.
              </span>
            </h1>
          </div>

          <p className="ab-hero-lead">
            An idea begins as nothing. Through disciplined craft, bold creative intuition, and rigorous
            systems engineering, it transforms into software people genuinely love to use.
          </p>

          <div className="ab-hero-actions">
            <a href="#process" className="ab-btn-primary">
              Explore the Craft ↓
            </a>
            <a href="#product" className="ab-btn-text">
              See the Product →
            </a>
          </div>

          <div className="ab-hero-cue" aria-hidden="true">
            <span className="ab-cue-line" />
            <span>Scroll to deconstruct the process</span>
          </div>
        </div>
      </section>

      {/* ── SCENE 2: THE PROCESS (PINNED SEQUENCE) ───────────── */}
      <section className="ab-process-pin-wrapper" id="process">
        <div className="ab-process-viewport">
          <div className="ab-container">
            <div className="ab-process-layout">
              {/* Left Column: Fixed Headline & Progression */}
              <div className="ab-process-left">
                <div className="ab-tag">02 / Methodology</div>
                <h2 className="ab-h2">
                  Break things down.
                  <br />
                  Build them up.
                </h2>
                <p style={{ color: "var(--ab-cream-muted)", fontSize: "16px", maxWidth: "42ch" }}>
                  Every build moves through a rigorous loop of deconstruction and synthesis, shedding
                  extraneous friction until only clarity remains.
                </p>

                {/* Progress Meter */}
                <div className="ab-process-meter">
                  <div className="ab-meter-track">
                    <div
                      className="ab-meter-fill"
                      style={{ width: `${((currentStageIdx + 1) / 4) * 100}%` }}
                    />
                  </div>
                  <span>
                    0{currentStageIdx + 1} / 04 — {activeStage.title.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Right Column: Morphing Stage Card */}
              <div className="ab-process-right">
                <div className="ab-process-stage-card">
                  <span className="ab-stage-badge">{activeStage.badge}</span>
                  <h3 className="ab-stage-title-text">{activeStage.title}</h3>
                  <p className="ab-stage-body-text">{activeStage.desc}</p>

                  <div className="ab-stage-graphic">
                    <span
                      style={{
                        fontFamily: "var(--ab-font-mono)",
                        fontSize: "12px",
                        letterSpacing: "0.08em",
                        color: "#a05a1b",
                      }}
                    >
                      ✦ {activeStage.detail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 3: THE PRODUCT (MAGNETIC ASSEMBLY & DEMO) ─── */}
      <section className="ab-section ab-product-section" id="product">
        <div className="ab-container">
          <div className="ab-product-grid">
            {/* Info */}
            <div>
              <div className="ab-tag">03 / The Product</div>
              <h2 className="ab-h2">
                Made to
                <br />
                <span style={{ color: "var(--ab-amber)" }}>connect.</span>
              </h2>
              <p className="ab-product-desc">
                <strong>Onechat</strong> strips away endless notification clutter, algorithmic feeds,
                and corporate bloat. It provides pure, instant, conversational intimacy through a
                high-performance Go communication pipeline.
              </p>

              <div className="ab-specs-list">
                <div className="ab-spec-card">
                  <div className="ab-spec-k">Relay Protocol</div>
                  <div className="ab-spec-v">WebSocket Full-Duplex</div>
                </div>
                <div className="ab-spec-card">
                  <div className="ab-spec-k">Backend Engine</div>
                  <div className="ab-spec-v">Go Microservices</div>
                </div>
                <div className="ab-spec-card">
                  <div className="ab-spec-k">Persistence</div>
                  <div className="ab-spec-v">PostgreSQL (Indexed)</div>
                </div>
                <div className="ab-spec-card">
                  <div className="ab-spec-k">Client Architecture</div>
                  <div className="ab-spec-v">Next.js 16 + React 19</div>
                </div>
              </div>
            </div>

            {/* Assembling Chat Box */}
            <div className="ab-assembly-stage">
              <div className="ab-chat-box" role="region" aria-label="Interactive Local Chat Demonstration">
                {/* Assembled Topbar */}
                <div className="ab-chat-topbar">
                  <div className="ab-live-indicator">
                    <span className="ab-live-dot" />
                    <span>Channel: Onechat_Relay</span>
                  </div>
                  <span className="ab-local-chip">Local Interactive Demo</span>
                </div>

                {/* Message Scroll View */}
                <div className="ab-chat-scroll-area" data-lenis-prevent>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`ab-msg-bubble ${
                        m.sender === "user" ? "ab-msg-bubble--user" : "ab-msg-bubble--peer"
                      }`}
                    >
                      <span className="ab-msg-meta">
                        {m.author} · {m.time}
                      </span>
                      {m.text}
                    </div>
                  ))}
                  {isReplying && (
                    <div className="ab-msg-bubble ab-msg-bubble--peer" style={{ opacity: 0.75 }}>
                      <span className="ab-msg-meta">Alpha · Typing…</span>
                      <span style={{ fontSize: "12px", fontStyle: "italic" }}>
                        Synthesizing local response…
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form className="ab-chat-input-bar" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type a demo message to test the pipeline..."
                    className="ab-chat-field"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    aria-label="Demo message input"
                  />
                  <button type="submit" className="ab-chat-btn-send">
                    Send
                  </button>
                  <button
                    type="button"
                    className="ab-chat-btn-reset"
                    onClick={handleResetDemo}
                    title="Reset sample conversation"
                  >
                    Reset
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 4: THE ENGINEERING (SYSTEM PIPELINE) ──────── */}
      <section className="ab-section ab-engineering-section" id="engineering">
        <div className="ab-container">
          <div className="ab-tag">04 / System Architecture</div>
          <h2 className="ab-h2">
            Beautiful outside.
            <br />
            Thoughtful inside.
          </h2>
          <p className="ab-hero-lead">
            Visual polish is only convincing when backed by rock-solid architecture. Onechat is built
            around high-concurrency Go goroutine channels and persistent event relay brokers.
          </p>

          {/* Architecture 4-Node Flow */}
          <div className="ab-arch-grid">
            <div className="ab-arch-card">
              <span className="ab-arch-idx">01 / CLIENT</span>
              <h3 className="ab-arch-name">Next.js</h3>
              <p className="ab-arch-text">
                App Router with server-rendered layouts, optimistic client updates, and fluid typography.
              </p>
            </div>

            <div className="ab-arch-card">
              <span className="ab-arch-idx">02 / INGESTION</span>
              <h3 className="ab-arch-name">Go Handlers</h3>
              <p className="ab-arch-text">
                Lightweight HTTP/2 multiplexing, session JWT validation, and WebSocket connection upgrades.
              </p>
            </div>

            <div className="ab-arch-card">
              <span className="ab-arch-idx">03 / CORE RELAY</span>
              <h3 className="ab-arch-name">Services</h3>
              <p className="ab-arch-text">
                Goroutine channel hubs, subscriber registries, and transactional broadcast dispatchers.
              </p>
            </div>

            <div className="ab-arch-card">
              <span className="ab-arch-idx">04 / STORAGE</span>
              <h3 className="ab-arch-name">PostgreSQL</h3>
              <p className="ab-arch-text">
                ACID relational persistence with compound indexes for instant conversation pagination.
              </p>
            </div>
          </div>

          {/* SVG Connection Trace Line */}
          <svg className="ab-pipeline-canvas" viewBox="0 0 1000 36" preserveAspectRatio="none">
            <line x1="125" y1="18" x2="875" y2="18" className="ab-pipeline-path" />
            <line x1="125" y1="18" x2="875" y2="18" className="ab-pipeline-path-glow" />
          </svg>

          {/* WebSocket Duplex Bridge Banner */}
          <div className="ab-ws-panel">
            <div className="ab-ws-left">
              <span className="ab-ws-pulse" />
              <span className="ab-ws-text-bold">WebSocket Real-Time Duplex Bridge</span>
            </div>
            <span className="ab-ws-text-muted">
              Direct full-duplex socket between Next.js client and Go daemon enabling sub-millisecond dispatch.
            </span>
          </div>
        </div>
      </section>

      {/* ── SCENE 5: THE WORK (PINNED HORIZONTAL TRACK) ─────── */}
      <section className="ab-work-pin-wrapper" id="work">
        <div className="ab-work-viewport">
          <div className="ab-container">
            <div className="ab-work-head">
              <div className="ab-tag">05 / Portfolio</div>
              <h2 className="ab-h2">
                One project is never
                <br />
                the whole story.
              </h2>
              <p style={{ color: "var(--ab-cream-muted)", fontSize: "16px", maxWidth: "50ch" }}>
                Crafting tools, communication relays, and curated visual engines.
              </p>
            </div>

            {/* Horizontal Projects Track */}
            <div className="ab-work-track">
              {/* Project 1: Onechat */}
              <div className="ab-project-panel">
                <div>
                  <h3 className="ab-project-h3">Onechat</h3>
                  <div className="ab-project-meta-stack">Next.js · Go Relay · WebSockets · Postgres</div>
                  <p className="ab-project-info-text">
                    A deliberate real-time communication platform built for conversational clarity.
                    Features custom Go WebSocket hubs, sub-50ms message delivery, and an uncluttered
                    aesthetic free of algorithmic feeds.
                  </p>
                </div>
                <Link href="/signup" className="ab-project-cta-btn">
                  Launch Onechat →
                </Link>
              </div>

              {/* Project 2: Wallix */}
              <div className="ab-project-panel">
                <div>
                  <h3 className="ab-project-h3">Wallix</h3>
                  <div className="ab-project-meta-stack">Next.js · TypeScript · Cloud Media</div>
                  <p className="ab-project-info-text">
                    A curated digital artwork and ultra-high-resolution wallpaper platform.
                    Engineered with fluid editorial typography, instant media delivery, and an
                    aesthetic interface built for design-conscious creators.
                  </p>
                </div>
                <a
                  href="#work"
                  className="ab-project-cta-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Wallix repository and showcase link will be available soon.");
                  }}
                >
                  View Case Study
                </a>
              </div>

              {/* Project 3: Core Protocols */}
              <div className="ab-project-panel">
                <div>
                  <h3 className="ab-project-h3">Open Craft</h3>
                  <div className="ab-project-meta-stack">Go · Concurrency · Micro-frontends</div>
                  <p className="ab-project-info-text">
                    Exploring the boundaries between performance and elegance: low-overhead WebSocket
                    multiplexers, design tokens, and modular real-time infrastructure.
                  </p>
                </div>
                <a
                  href="https://github.com/Adii9669"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-project-cta-btn"
                >
                  GitHub Profile ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCENE 6: THE CLOSING (CINEMATIC FINALE) ──────────── */}
      <section className="ab-section ab-closing-section" id="closing">
        <div className="ab-closing-orb" aria-hidden="true" />

        <div className="ab-container">
          <div className="ab-tag">06 / Epilogue</div>
          <h2 className="ab-h1 ab-closing-h1">
            There is always
            <br />
            <span style={{ color: "var(--ab-amber)" }}>more to build.</span>
          </h2>
          <p className="ab-closing-lead">
            Design with intent. Engineer for resilience. Whether it is real-time communication
            or creative tooling, the standard remains uncompromising.
          </p>

          <div className="ab-closing-actions">
            <Link href="/signup" className="ab-btn-primary">
              Create an Account →
            </Link>
            <Link href="/login" className="ab-btn-text">
              Sign In to Onechat
            </Link>
            <a
              href="https://github.com/Adii9669"
              target="_blank"
              rel="noopener noreferrer"
              className="ab-btn-text"
            >
              GitHub Profile ↗
            </a>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="ab-footer">
        <div>© 2026 ADITYA RAJ SINGH · ONECHAT. ALWAYS BUILDING.</div>
        <div className="ab-footer-links">
          <a href="#opening" className="ab-footer-link">
            Top ↑
          </a>
          <a href="#process" className="ab-footer-link">
            Process
          </a>
          <a href="#product" className="ab-footer-link">
            Product
          </a>
          <a href="#engineering" className="ab-footer-link">
            Architecture
          </a>
          <a href="#work" className="ab-footer-link">
            Projects
          </a>
          <Link href="/login" className="ab-footer-link">
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
