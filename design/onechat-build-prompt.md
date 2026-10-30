# TASK: Build the Onechat landing page exactly as specified

You are building a single-page, scroll-driven landing page for a chat app called **Onechat**. A complete working reference implementation (plain HTML/CSS/JS) is included at the bottom of this prompt. It is the **source of truth**. Your job is to reproduce it faithfully as a Next.js page, not to redesign it.

## Rules (read first)
1. **Do not invent anything.** No extra sections, features, copy, colors, fonts, animations, images, icons, libraries or backend calls beyond what is specified here or in the reference code.
2. **Do not rewrite the copy.** Every string must match the spec and reference exactly (including punctuation and capitalization).
3. If something is not specified, **ask me** or leave a clearly marked `TODO`. Do not guess.
4. Where the spec and the reference code disagree, **the reference code wins**. Tell me about the disagreement.
5. Keep it dependency-free: use CSS and a `<canvas>`. No animation libraries, no UI kits, no Tailwind-style rewrites of the look. No external fonts, no images (the portrait is an inline SVG).
6. Placeholders stay placeholders: skill-bar levels and footer links (see "Open items").

## Stack
- **Next.js (App Router), TypeScript.** One route: `/`.
- Client component(s) for the scroll logic. No backend. The chat in scene 3 is a **front-end mock** only (the real Go backend comes later; do not build or call any API).
- Global CSS (or CSS modules) reproducing the reference styles. Use the CSS variables below.

## Concept
"One Night on the Line." The visitor is a radio operator on night shift. The page is the night, 0400 to 0600. Scrolling is time passing. It starts in silence, becomes static, then a voice comes through, then the product is explained, then the builder is introduced, then dawn arrives with a call to action. Mood: dark military-radio (olive, charcoal, amber), terse, typed-log voice that warms up at the end.

## Design tokens
- `--bg:#12150f` · `--fg:#d9dcc8` · `--acc:#ffb23e` (amber) · `--card:#2b3322` · `--ln:#3d4730` · `--dim:#8a9172`
- Headline font: `Impact, "Arial Narrow"`, uppercase, `font-weight:700`, line-height ~.96–1.02. Sizes: h1 `clamp(40px,8.5vw,104px)`; h2 `clamp(30px,5.6vw,64px)`, max-width 16ch.
- Body font: `"Courier New", monospace`. Small labels use letter-spacing .2–.3em.
- Accent words inside headings use `<em>` (no italics, amber color).
- Global CRT scanline overlay: fixed full-screen `repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)`, `pointer-events:none`, z-index 9.
- Fixed amber radial glow (center 70% 35%, `rgba(255,178,62,.16)`) that pulses opacity (4s, ease-in-out, infinite).
- Fixed "dawn" layer `linear-gradient(#3a2208,#ffb23e)` behind everything, opacity 0 until the final scene.
- Sections: `min-height:100vh`, `max-width:980px`, centered, padding `100px 8vw 60px`, flex column centered vertically, `scroll-snap-align:start`; `html{scroll-snap-type:y proximity}`.

## Fixed UI (always visible)
- **Top nav:** left `ONECHAT` (amber, bold), right frequency readout `FREQ 14.000 MHz` (updates while scrolling, see tuning). 12px, letter-spacing .2em.
- **Side clock:** vertical text on the right edge, vertically centered, shows `0400 HRS` etc.
- **Progress bar:** 3px amber bar at the top, width = scroll progress.
- Clock label = `["0400","0412","0420","0435","0445","0500","0530","0600"][min(7, round(scrollY / innerHeight))] + " HRS"`.

## Scenes (8 sections, in this exact order, exact copy)

### 1 · 0400 HRS · SILENCE
- Tag: `0400 HRS · SILENCE`
- H1 (two lines): `One voice.` / `One chat.` (the word `chat.` in amber)
- Lead: `A place where a conversation never has to wait.`
- Typed log (typewriter, 45ms per character, blinking amber block cursor `▌`): `04:00. Night shift. Every channel quiet. Hours since anyone said a word.`
- Hint: `▼ SCROLL TO TUNE IN`
- Visual: a **radar** on the right (width `min(36vw,340px)`, square, vertically centered): 3 concentric amber rings expanding from scale .1 to 1 while fading (4s loop, delays 0 / 1.3s / 2.6s), a glowing amber center dot, and a conic-gradient sweep beam rotating 360° every 5s. On screens ≤700px: opacity .3 and shifted right (`right:-10vw`).

### 2 · 0412 HRS · STATIC
- Tag: `0412 HRS · STATIC`
- Visual: a `<canvas>` waveform (max-width 560px, height 120px, amber 2px line).
- Tuning text (monospace, bold, amber, `clamp(22px,4.6vw,50px)`): scrambles into `HELLO? IS ANYONE OUT THERE?`; when locked it switches to `SOMEONE IS LISTENING.` (pale `#fff3c4` with amber glow).
- Status line: `TUNING… {freq} MHz` and when locked `SIGNAL LOCKED · {freq} MHz`.
- Signal bar: 6px track, max-width 440px, amber fill = progress.
- Lead: `Between the noise and the silence, there's always a frequency where someone is listening. You only have to tune in.`
- **Tuning logic (scroll-driven):** `p = clamp((innerHeight*0.9 - section.top) / (innerHeight*0.8), 0, 1)`. Locked when `p > 0.96`. Before lock, each character of the call string at index `n` is shown if it is a space or `n/length < p*1.15`, otherwise replaced by a random char from `▒▓#@%&░`. Frequency = `(14 + p*0.205).toFixed(3)`. Waveform per x (step 3px): `y = h/2 + sin(x/28)*34*p + (random-.5)*90*(1-p)*(.4+random*.6)` (noise at p=0, clean sine at p=1). Redraw on every scroll frame.

### 3 · 0420 HRS · CONTACT (interactive mock chat)
- Tag: `0420 HRS · CONTACT`
- H2: `You're not alone on the line.` (`line.` amber)
- Avatars row: circle `ALPHA` (outlined amber) — animated amber pulse line — filled amber circle `YOU`. Circles 46px.
- Chat bubbles (cards, 1px `--ln` border, `--card` bg). First bubble (fades in on view): small label `ALPHA · 04:20`, text `Finally. I've been calling for hours.`
- Two reply buttons (amber outline, hover fills amber): `I'm here. Go ahead.` and `Loud and clear.`
- On click (either): remove buttons; append a right-aligned bubble labelled `YOU · 04:21 ✓✓` with the chosen text (amber border, bg `#2a2415`); after 900ms append `ALPHA · 04:21` / `Didn't think anyone would pick up.`; after 1900ms total, fade in the lead: `That's the whole idea. Pick up, and the conversation begins.`

### 4 · 0435 HRS · THE PROBLEM
- Tag: `0435 HRS · THE PROBLEM`
- H2: `Most chats are loud, slow and forgetful.` (`forgetful.` amber)
- Three items, each a bold struck-through (amber strikethrough) word followed by a dim description, sliding in from the left sequentially (delays 0 / .3s / .6s):
  - `delayed` — `the reply that came too late`
  - `dropped` — `the message that never made it`
  - `buried` — `the one lost under a hundred others`
- Visuals: faint vertical white static stripes fade in over the section; six small amber-outlined rectangles (16×11px) fall down the screen continuously (5s linear, `left` at 8/22/41/58/73/90%, delays 0/1.2/.6/2.4/1.8/3.1s).

### 5 · 0445 HRS · THE SOLUTION
- Tag: `0445 HRS · THE SOLUTION`
- H2: `Onechat carries every word.` (`word.` amber)
- Lead: `Fast enough to feel like talking. Reliable enough that you forget it's software. Every message, in order, instantly.` — `in order` and `instantly` start as black redaction bars and reveal as amber bold text when the section enters view (1s, 0.4s delay).
- Visual: six small numbered packets `01`–`06` (48×32, amber outline) sliding in from the left in order (stagger .15s).

### 6 · 0500 HRS · THE SQUAD
- Tag: `0500 HRS · THE SQUAD`
- H2: `Units reporting.` (`reporting.` amber)
- Four cards (grid, min 200px, 12px gap), staggered slide-up reveal (0/.2/.4/.6s):
  - `RELAY` — `Written in Go. Every message in, every message out, nothing dropped.`
  - `REAL-TIME` — `Sent and seen in the same breath.`
  - `SECURE` — `Your conversations stay between the people in them.`
  - `ROOMS` — `Two people or twenty, the line stays clear.`
- Pipe visual: `YOU` — animated pulse line — `RELAY · GO` — animated pulse line — `THEM` (boxes amber-outlined, 11px, letter-spacing .2em).

### 7 · 0530 HRS · SERVICE RECORD
- Tag: `0530 HRS · SERVICE RECORD`
- H2: `Built by an engineer who stays on the problem.` (`problem.` amber)
- Dossier card (max-width 580px) with a rotated amber-outlined stamp `VERIFIED` at top-right (Impact 18px, rotate 4deg):
  - Round headset-silhouette portrait (inline SVG, 64px) + name `Aditya Raj Singh` (Impact 30px, uppercase)
  - Bio: `Software developer, 2 years in the field. Doesn't settle for the quick fix. Hunts for the best solution, then builds it.`
  - Skill bars (label 130px column, 8px bar, fill animates to value over 1.4s when in view): `NEXT.JS` 80 · `GO · BACKEND` 75 · `REAL-TIME` 70 · `PROBLEM-SOLVING` 90 (**placeholder values**)
  - Footer line (amber, 11px): `BUILT WITH · NEXT.JS FRONT END · GO RELAY · REAL-TIME MESSAGING`

### 8 · 0600 HRS · FIRST LIGHT
- Tag: `0600 HRS · FIRST LIGHT`
- H2: `The night is over. The channel is open.` (`open.` amber)
- Lead: `The only thing missing is your first message.`
- Button: `PICK UP THE LINE` (solid amber bg, dark text, bold, letter-spacing .2em, padding 16px 30px)
- Footer: `© 2026 ADITYA RAJ SINGH · GITHUB · X · INSTAGRAM` (links are placeholders, see Open items)
- Dawn logic: `d = max(0, (scrollY - innerHeight*6.2) / (innerHeight*0.8))`. Dawn layer opacity = `min(1,d)`. A 340px radial-gradient sun (`#fff3c4 → #ffb23e → transparent`) sits at the bottom center of this section with opacity `min(1,d)` and `translateY(-d*150px)`. When `d > 0.6`, add a `light` class that switches the tag, heading and lead text to dark `#1b1206` (amber `em` words become white) and the footer to `#3a2208`.

## Shared behavior
- Sections 3–7 have class `obs`. An IntersectionObserver (threshold .35) adds `on` when visible; `on` triggers the reveals (strike-through slide-ins, redaction reveals, packets, cards, skill-bar fills, first chat bubble, static stripes).
- All scroll-driven values update in one scroll handler (also run once on load). Handle canvas width via `clientWidth` on each draw.
- Respect `prefers-reduced-motion`: disable the radar, falling packets, pulse lines and the scramble (show final text). (This is the only addition allowed beyond the reference.)

## Open items (leave as placeholders, do not invent)
- Skill bar levels: placeholders (80/75/70/90). I will confirm real values.
- Footer links (GitHub, X, Instagram): render as plain text for now with `href="#"` and a `TODO` comment. I will provide URLs.
- The `PICK UP THE LINE` button has no destination yet: `href="#"` with a `TODO`.
- Sound toggle, custom crosshair cursor, and the real Go chat backend are **future work**. Do not build them.

## Acceptance checklist (verify before you finish)
- [ ] 8 sections, same order, tags, headings and copy as above, character for character.
- [ ] Colors and fonts match the tokens; scanlines and glow present.
- [ ] Tuning scene scrambles then resolves, switches to `SOMEONE IS LISTENING.` when locked; waveform goes from noise to sine; frequency in nav updates.
- [ ] Chat mock behaves exactly as described, including the 900ms and 1900ms timings.
- [ ] Side clock and progress bar update on scroll.
- [ ] Dawn transition and sun rise only in the last scene; text switches to dark when `d > .6`.
- [ ] Mobile (≤700px): single column, radar faded, no horizontal scroll, buttons still tappable.
- [ ] No extra dependencies, images, sections or copy.
- [ ] Tell me every place you deviated from the reference and why.

---

# REFERENCE IMPLEMENTATION (source of truth)

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Onechat — One Night on the Line</title>
<style>
:root{--bg:#12150f;--fg:#d9dcc8;--acc:#ffb23e;--card:#2b3322;--ln:#3d4730;--dim:#8a9172}
*{box-sizing:border-box;margin:0}
html{scroll-snap-type:y proximity}
body{background:var(--bg);color:var(--fg);font-family:"Courier New",monospace;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:9;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
#dawn{position:fixed;inset:0;z-index:-1;background:linear-gradient(#3a2208,#ffb23e);opacity:0}
.glow{position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 70% 35%,rgba(255,178,62,.16),transparent 50%);animation:p 4s ease-in-out infinite}
@keyframes p{50%{opacity:.4}}
nav{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:16px 6vw;font-size:12px;letter-spacing:.2em;color:var(--dim);z-index:5}
nav b{color:var(--acc)}
.clock{position:fixed;right:16px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;font-size:11px;letter-spacing:.3em;color:var(--dim);z-index:5}
.prog{position:fixed;left:0;top:0;height:3px;background:var(--acc);z-index:6;width:0}
section{min-height:100vh;padding:100px 8vw 60px;display:flex;flex-direction:column;justify-content:center;max-width:980px;margin:0 auto;scroll-snap-align:start;position:relative}
.tag{font-size:12px;letter-spacing:.3em;color:var(--acc);margin-bottom:16px}
h1,h2{font:700 clamp(40px,8.5vw,104px)/.96 Impact,"Arial Narrow",sans-serif;text-transform:uppercase}
h2{font-size:clamp(30px,5.6vw,64px);line-height:1.02;max-width:16ch}
em{font-style:normal;color:var(--acc)}
.lead{margin-top:20px;max-width:46ch;font-size:clamp(14px,1.7vw,17px);line-height:1.8;color:var(--dim)}
.cur:after{content:"▌";color:var(--acc);animation:b 1s steps(2) infinite}@keyframes b{50%{opacity:0}}
.type{margin-top:22px;color:var(--dim);min-height:3em;max-width:46ch;line-height:1.7}
.hint{margin-top:26px;font-size:12px;letter-spacing:.3em;color:var(--dim)}
/* radar */
.radar{position:absolute;right:8vw;top:50%;width:min(36vw,340px);aspect-ratio:1;transform:translateY(-50%);pointer-events:none}
.radar i{position:absolute;inset:0;border:1px solid var(--acc);border-radius:50%;opacity:0;animation:rg 4s ease-out infinite}
.radar i:nth-child(2){animation-delay:1.3s}.radar i:nth-child(3){animation-delay:2.6s}
@keyframes rg{from{transform:scale(.1);opacity:.7}to{transform:scale(1);opacity:0}}
.radar:before{content:"";position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;border-radius:50%;background:var(--acc);box-shadow:0 0 24px var(--acc);z-index:1}
.radar:after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,178,62,.28),transparent 25%);animation:sw 5s linear infinite}
@keyframes sw{to{transform:rotate(360deg)}}
@media(max-width:700px){.radar{opacity:.3;right:-10vw}}
/* tune */
#wave{width:100%;max-width:560px;height:120px;display:block;margin-bottom:14px}
#tune{font:700 clamp(22px,4.6vw,50px)/1.2 "Courier New";color:var(--acc);min-height:2.5em;letter-spacing:.03em;transition:color .4s}
#tune.lock{color:#fff3c4;text-shadow:0 0 22px var(--acc)}
.bar{height:6px;background:var(--ln);margin-top:16px;max-width:440px}.bar i{display:block;height:100%;width:0;background:var(--acc)}
.freq{margin-top:12px;font-size:12px;letter-spacing:.25em;color:var(--dim)}
/* chat */
.peers{display:flex;align-items:center;max-width:430px;margin-top:22px}
.av{width:46px;height:46px;border-radius:50%;border:2px solid var(--acc);display:grid;place-items:center;color:var(--acc);font-size:10px;background:var(--card)}
.av.me{background:var(--acc);color:var(--bg)}
.line{flex:1;height:2px;background:var(--ln);position:relative;overflow:hidden;margin:0 8px}
.line:after{content:"";position:absolute;left:-30%;width:30%;height:100%;background:var(--acc);animation:mv 1.6s linear infinite}@keyframes mv{to{left:100%}}
.chat{display:grid;gap:10px;max-width:430px;margin-top:20px}
.m{padding:12px 16px;border:1px solid var(--ln);background:var(--card);font-size:14px;max-width:86%;opacity:0;transform:translateY(10px);transition:.5s}
.m.show{opacity:1;transform:none}
.m small{display:block;font-size:10px;letter-spacing:.2em;color:var(--dim);margin-bottom:3px}
.m.me{margin-left:auto;border-color:var(--acc);background:#2a2415}
.reply{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap}
.reply button,.go{background:none;border:1px solid var(--acc);color:var(--acc);padding:10px 16px;font:12px "Courier New";letter-spacing:.12em;cursor:pointer}
.reply button:hover{background:var(--acc);color:var(--bg)}
.after{opacity:0;transition:1s;margin-top:18px}.after.show{opacity:1}
/* problem */
.noise{position:absolute;inset:0;pointer-events:none;opacity:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 7px);transition:1s}
.on .noise{opacity:1}
.drops{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.drops i{position:absolute;top:-20px;width:16px;height:11px;border:1px solid var(--acc);opacity:.6;animation:fl 5s linear infinite}
@keyframes fl{to{transform:translateY(110vh) rotate(25deg);opacity:0}}
.fail{display:grid;gap:14px;margin-top:24px;max-width:46ch}
.fail span{font-size:clamp(14px,1.8vw,17px);color:var(--dim);line-height:1.5;opacity:0;transform:translateX(-30px);transition:.6s}
.fail b{color:var(--fg);font-size:clamp(20px,3vw,28px);text-decoration:line-through;text-decoration-color:var(--acc);margin-right:10px}
.on .fail span{opacity:1;transform:none}.on .fail span:nth-child(2){transition-delay:.3s}.on .fail span:nth-child(3){transition-delay:.6s}
/* solution */
.r{background:var(--fg);color:transparent;padding:0 4px;transition:1s .4s}
.on .r{background:none;color:var(--acc);font-weight:700}
.pk{display:flex;gap:8px;margin-top:26px;flex-wrap:wrap}
.pk i{width:48px;height:32px;border:1px solid var(--acc);display:grid;place-items:center;font:normal 11px "Courier New";color:var(--acc);opacity:0;transform:translateX(-30px);transition:.5s}
.on .pk i{opacity:1;transform:none}
/* squad */
.units{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:24px}
.u{border:1px solid var(--ln);background:var(--card);padding:16px;opacity:0;transform:translateY(26px);transition:.6s}
.on .u{opacity:1;transform:none}.on .u:nth-child(2){transition-delay:.2s}.on .u:nth-child(3){transition-delay:.4s}.on .u:nth-child(4){transition-delay:.6s}
.u b{display:block;color:var(--acc);font-size:12px;letter-spacing:.2em;margin-bottom:8px}.u span{font-size:13px;color:var(--dim);line-height:1.6}
.pipe{margin-top:26px;display:flex;align-items:center;max-width:520px;font-size:11px;letter-spacing:.2em}
.node{border:1px solid var(--acc);padding:8px 12px;color:var(--acc)}
.pipe .line{margin:0}
/* record */
.file{max-width:580px;border:1px solid var(--ln);background:var(--card);padding:26px;position:relative;margin-top:26px}
.st{position:absolute;right:16px;top:-16px;border:3px solid var(--acc);color:var(--acc);background:var(--bg);padding:2px 12px;font:700 18px Impact;letter-spacing:.1em;transform:rotate(4deg)}
.file h3{font:700 30px Impact;text-transform:uppercase;letter-spacing:.05em}
.file p{color:var(--dim);font-size:13px;line-height:1.8;margin:12px 0 16px}
.sk{display:grid;grid-template-columns:130px 1fr;gap:12px;align-items:center;font-size:12px;letter-spacing:.12em;margin:10px 0}
.sk .bar{margin:0;max-width:none;height:8px}.sk i{transition:width 1.4s}
.built{margin-top:16px;font-size:11px;letter-spacing:.18em;color:var(--acc)}
/* dawn */
.sun{position:absolute;left:50%;bottom:-170px;width:340px;height:340px;margin-left:-170px;border-radius:50%;background:radial-gradient(circle,#fff3c4,#ffb23e 55%,transparent 70%);opacity:0;pointer-events:none}
#s8>*:not(.sun){position:relative;z-index:1}
.light h2,.light .tag,.light .lead{color:#1b1206}.light h2 em{color:#fff}
.go{background:var(--acc);color:#12150f;font-weight:700;width:max-content;margin-top:28px;padding:16px 30px;font-size:14px;letter-spacing:.2em}
footer{margin-top:60px;font-size:12px;letter-spacing:.15em;color:var(--dim)}
.light footer{color:#3a2208}
</style></head><body>
<div id="dawn"></div><div class="glow"></div><div class="prog" id="prog"></div>
<nav><b>ONECHAT</b><span id="hz">FREQ 14.000 MHz</span></nav>
<div class="clock" id="clock">0400 HRS</div>

<!-- 0400 SILENCE -->
<section><div class="radar"><i></i><i></i><i></i></div>
<div class="tag">0400 HRS · SILENCE</div>
<h1>One voice.<br>One <em>chat.</em></h1>
<p class="lead">A place where a conversation never has to wait.</p>
<div class="type cur" id="ty"></div>
<div class="hint">▼ SCROLL TO TUNE IN</div></section>

<!-- 0412 STATIC -->
<section id="s2"><div class="tag">0412 HRS · STATIC</div>
<canvas id="wave" height="120"></canvas>
<div id="tune"></div>
<div class="freq" id="fq">TUNING…</div>
<div class="bar"><i id="sig"></i></div>
<p class="lead">Between the noise and the silence, there's always a frequency where someone is listening. You only have to tune in.</p></section>

<!-- 0420 CONTACT -->
<section class="obs"><div class="tag">0420 HRS · CONTACT</div>
<h2>You're not alone on the <em>line.</em></h2>
<div class="peers"><div class="av">ALPHA</div><span class="line"></span><div class="av me">YOU</div></div>
<div class="chat" id="chat"><div class="m"><small>ALPHA · 04:20</small>Finally. I've been calling for hours.</div></div>
<div class="reply" id="rep"><button data-r="I'm here. Go ahead.">I'm here. Go ahead.</button><button data-r="Loud and clear.">Loud and clear.</button></div>
<p class="lead after" id="aft">That's the whole idea. Pick up, and the conversation begins.</p></section>

<!-- 0435 PROBLEM -->
<section class="obs"><div class="noise"></div>
<div class="drops"><i style="left:8%"></i><i style="left:22%;animation-delay:1.2s"></i><i style="left:41%;animation-delay:.6s"></i><i style="left:58%;animation-delay:2.4s"></i><i style="left:73%;animation-delay:1.8s"></i><i style="left:90%;animation-delay:3.1s"></i></div>
<div class="tag">0435 HRS · THE PROBLEM</div>
<h2>Most chats are loud, slow and <em>forgetful.</em></h2>
<div class="fail">
<span><b>delayed</b>the reply that came too late</span>
<span><b>dropped</b>the message that never made it</span>
<span><b>buried</b>the one lost under a hundred others</span></div></section>

<!-- 0445 SOLUTION -->
<section class="obs"><div class="tag">0445 HRS · THE SOLUTION</div>
<h2>Onechat carries every <em>word.</em></h2>
<p class="lead">Fast enough to feel like talking. Reliable enough that you forget it's software. Every message, <span class="r">in order</span>, <span class="r">instantly</span>.</p>
<div class="pk"><i>01</i><i style="transition-delay:.15s">02</i><i style="transition-delay:.3s">03</i><i style="transition-delay:.45s">04</i><i style="transition-delay:.6s">05</i><i style="transition-delay:.75s">06</i></div></section>

<!-- 0500 SQUAD -->
<section class="obs"><div class="tag">0500 HRS · THE SQUAD</div>
<h2>Units <em>reporting.</em></h2>
<div class="units">
<div class="u"><b>RELAY</b><span>Written in Go. Every message in, every message out, nothing dropped.</span></div>
<div class="u"><b>REAL-TIME</b><span>Sent and seen in the same breath.</span></div>
<div class="u"><b>SECURE</b><span>Your conversations stay between the people in them.</span></div>
<div class="u"><b>ROOMS</b><span>Two people or twenty, the line stays clear.</span></div></div>
<div class="pipe"><span class="node">YOU</span><span class="line"></span><span class="node">RELAY · GO</span><span class="line"></span><span class="node">THEM</span></div></section>

<!-- 0530 RECORD -->
<section class="obs" id="s7"><div class="tag">0530 HRS · SERVICE RECORD</div>
<h2>Built by an engineer who stays on the <em>problem.</em></h2>
<div class="file"><div class="st">VERIFIED</div>
<div style="display:flex;gap:16px;align-items:center"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#12150f" stroke="#ffb23e" stroke-width="2"/><circle cx="32" cy="25" r="10" fill="#ffb23e"/><path d="M12 58c2-14 10-18 20-18s18 4 20 18z" fill="#ffb23e"/><path d="M20 25a12 12 0 0 1 24 0" fill="none" stroke="#12150f" stroke-width="3"/></svg><h3>Aditya Raj Singh</h3></div>
<p>Software developer, 2 years in the field. Doesn't settle for the quick fix. Hunts for the best solution, then builds it.</p>
<div class="sk"><span>NEXT.JS</span><div class="bar"><i data-w="80"></i></div></div>
<div class="sk"><span>GO · BACKEND</span><div class="bar"><i data-w="75"></i></div></div>
<div class="sk"><span>REAL-TIME</span><div class="bar"><i data-w="70"></i></div></div>
<div class="sk"><span>PROBLEM-SOLVING</span><div class="bar"><i data-w="90"></i></div></div>
<div class="built">BUILT WITH · NEXT.JS FRONT END · GO RELAY · REAL-TIME MESSAGING</div></div></section>

<!-- 0600 FIRST LIGHT -->
<section id="s8"><div class="sun" id="sun"></div>
<div class="tag">0600 HRS · FIRST LIGHT</div>
<h2>The night is over. The channel is <em>open.</em></h2>
<p class="lead">The only thing missing is your first message.</p>
<button class="go">PICK UP THE LINE</button>
<footer>© 2026 ADITYA RAJ SINGH · GITHUB · X · INSTAGRAM</footer></section>

<script>
const $=id=>document.getElementById(id),secs=[...document.querySelectorAll('section')];
// typed log
const t1="04:00. Night shift. Every channel quiet. Hours since anyone said a word.";let i=0;
(function k(){$('ty').textContent=t1.slice(0,i++);if(i<=t1.length)setTimeout(k,45)})();
// tuning
const call="HELLO? IS ANYONE OUT THERE?",answer="SOMEONE IS LISTENING.",g="▒▓#@%&░",s2=$('s2');
const cv=$('wave'),cx=cv.getContext('2d');
function wave(p){cv.width=cv.clientWidth;const w=cv.width,h=cv.height;cx.clearRect(0,0,w,h);cx.strokeStyle='#ffb23e';cx.lineWidth=2;cx.beginPath();
 for(let x=0;x<w;x+=3){const y=h/2+Math.sin(x/28)*34*p+(Math.random()-.5)*90*(1-p)*(.4+Math.random()*.6);x?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}
const hrs=['0400','0412','0420','0435','0445','0500','0530','0600'];
function frame(){
 const r=s2.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.9-r.top)/(innerHeight*.8)));
 const locked=p>.96,t=$('tune');
 t.textContent=locked?answer:[...call].map((c,n)=>c==' '||n/call.length<p*1.15?c:g[Math.random()*g.length|0]).join('');
 t.classList.toggle('lock',locked);
 const f=(14+p*.205).toFixed(3);$('hz').textContent='FREQ '+f+' MHz';
 $('fq').textContent=locked?'SIGNAL LOCKED · '+f+' MHz':'TUNING… '+f+' MHz';$('sig').style.width=p*100+'%';wave(p);
 $('clock').textContent=hrs[Math.min(7,Math.round(scrollY/innerHeight))]+' HRS';
 $('prog').style.width=scrollY/(document.body.scrollHeight-innerHeight)*100+'%';
 const d=Math.max(0,(scrollY-innerHeight*6.2)/(innerHeight*.8));
 $('dawn').style.opacity=Math.min(1,d);$('sun').style.opacity=Math.min(1,d);$('sun').style.transform='translateY('+(-d*150)+'px)';
 secs[7].classList.toggle('light',d>.6);
}
addEventListener('scroll',frame);frame();
// reveal on scroll
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){const s=x.target;s.classList.add('on');
 s.querySelectorAll('i[data-w]').forEach(b=>b.style.width=b.dataset.w+'%');s.querySelectorAll('.m').forEach(m=>m.classList.add('show'))}}),{threshold:.35});
document.querySelectorAll('.obs').forEach(s=>io.observe(s));
// chat reply
document.querySelectorAll('#rep button').forEach(b=>b.onclick=()=>{
 const c=$('chat');c.insertAdjacentHTML('beforeend','<div class="m me show"><small>YOU · 04:21 ✓✓</small>'+b.dataset.r+'</div>');$('rep').remove();
 setTimeout(()=>c.insertAdjacentHTML('beforeend','<div class="m show"><small>ALPHA · 04:21</small>Didn\'t think anyone would pick up.</div>'),900);
 setTimeout(()=>$('aft').classList.add('show'),1900)});
</script></body></html>

```
