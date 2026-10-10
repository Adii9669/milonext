'use client'

import { useEffect, useRef } from 'react'

/**
 * Orbit: a dotted rotating sphere, three dotted rings and people drifting along them.
 * No dependencies. Colors come from CSS variables so one component works in both themes:
 *   --orbit-ink (sphere, text)   --orbit-ring (rings)   --orbit-dim (small labels)   --orbit-avatar (avatar fill)
 * Set them on a parent, e.g. :root { --orbit-ink:#0F141B; ... } and .dark { --orbit-ink:#F2F5F9; ... }
 */

export type OrbitPerson = {
  initial: string
  label: string
  ring: 0 | 1 | 2 // 0 = inner, 2 = outer
  angle: number // starting angle in degrees
  speed?: number // degrees per second (negative = other direction)
}

export type OrbitProps = {
  people?: OrbitPerson[]
  marks?: { ring: 0 | 1 | 2; angle: number; label: string }[]
  animate?: boolean
  className?: string
  title?: string // pass a title to expose the graphic to screen readers
}

const C = 380
const RINGS = [170, 250, 340]
const N = 480
const R = 105
const TILT = (24 * Math.PI) / 180

const DEFAULT_PEOPLE: OrbitPerson[] = [
  { initial: 'M', label: 'MAYA · TYPING...', ring: 1, angle: -62, speed: 1.2 },
  { initial: 'J', label: 'JULES · 9:41', ring: 2, angle: 28, speed: -0.8 },
  { initial: 'A', label: 'ALEX · ONLINE', ring: 0, angle: 155, speed: 1.8 },
]
const DEFAULT_MARKS = [
  { ring: 1 as const, angle: 100, label: 'SEEN BY 3' },
  { ring: 2 as const, angle: 200, label: 'NEW PLAN · SAT 7PM' },
]

// Evenly spread points on a sphere (Fibonacci lattice)
const BASE = Array.from({ length: N }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / N
  const r = Math.sqrt(1 - y * y)
  const th = Math.PI * (3 - Math.sqrt(5)) * i
  return [r * Math.cos(th), y, r * Math.sin(th)] as const
})

// Six depth buckets: far dots are small and faint, near dots larger and brighter
function sphere(rot: number): string[] {
  const out: string[] = ['', '', '', '', '', '']
  const cr = Math.cos(rot), sr = Math.sin(rot)
  const ct = Math.cos(TILT), st = Math.sin(TILT)
  for (const [x0, y0, z0] of BASE) {
    const x = x0 * cr + z0 * sr
    const z1 = -x0 * sr + z0 * cr
    const y = y0 * ct - z1 * st
    const z = y0 * st + z1 * ct
    const b = Math.min(5, Math.max(0, Math.floor(((z + 1) / 2) * 6)))
    out[b] += `M${(C + R * x).toFixed(1)} ${(C + R * y).toFixed(1)}h0`
  }
  return out
}

const pos = (ring: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [C + RINGS[ring] * Math.cos(a), C + RINGS[ring] * Math.sin(a)] as const
}

export default function Orbit({
  people = DEFAULT_PEOPLE,
  marks = DEFAULT_MARKS,
  animate = true,
  className,
  title,
}: OrbitProps) {
  const dotRefs = useRef<(SVGPathElement | null)[]>([])
  const personRefs = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    if (!animate) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = (now - t0) / 1000
      sphere(t * 0.25).forEach((d, i) => dotRefs.current[i]?.setAttribute('d', d)) // ~25s per turn
      people.forEach((p, i) => {
        const [x, y] = pos(p.ring, p.angle + t * (p.speed ?? 1))
        personRefs.current[i]?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, people])

  const initial = sphere(0)

  return (
    <svg
      viewBox="0 0 760 760"
      className={className}
      style={{ overflow: 'visible' }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      <g stroke="var(--orbit-ring, #5B6574)" strokeLinecap="round" strokeWidth="2.2" strokeDasharray="0.1 9">
        {RINGS.map((r) => (
          <circle key={r} cx={C} cy={C} r={r} />
        ))}
      </g>

      <g stroke="var(--orbit-ink, currentColor)" strokeLinecap="round">
        {initial.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el
            }}
            d={d}
            strokeWidth={1.4 + i * 0.5}
            opacity={0.12 + i * 0.17}
          />
        ))}
      </g>

      {marks.map((m) => {
        const [x, y] = pos(m.ring, m.angle)
        return (
          <g key={m.label} transform={`translate(${x} ${y})`}>
            <path d="M-6 0h12M0 -6v12" stroke="var(--orbit-ink, currentColor)" strokeWidth="1.2" />
            <text x="12" y="4" fontSize="11" letterSpacing="1" fill="var(--orbit-dim, #8B95A3)" fontFamily="var(--font-mono, ui-monospace, monospace)">
              {m.label}
            </text>
          </g>
        )
      })}

      {people.map((p, i) => {
        const [x, y] = pos(p.ring, p.angle)
        return (
          <g
            key={p.initial + i}
            ref={(el) => {
              personRefs.current[i] = el
            }}
            transform={`translate(${x} ${y})`}
          >
            <circle r="18" fill="var(--orbit-avatar, #212833)" stroke="var(--orbit-ring, #5B6574)" strokeWidth="1.2" />
            <text y="4" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--orbit-ink, currentColor)">
              {p.initial}
            </text>
            <text x="28" y="4" fontSize="11" letterSpacing="1" fill="var(--orbit-dim, #8B95A3)" fontFamily="var(--font-mono, ui-monospace, monospace)">
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
