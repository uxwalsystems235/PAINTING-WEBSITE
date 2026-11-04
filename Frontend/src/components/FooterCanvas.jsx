import { useEffect, useRef } from 'react'
import { motionOn } from '../lib/smooth'

// An open canvas across the footer: moving the pointer over it lays down a soft gold brush stroke that holds
// for a few seconds and then fades away, like a wash drying. Decorative only (pointer events pass through to
// the links). Skipped for visitors who asked for reduced motion.
const HOLD = 3200   // ms a stroke stays at full strength
const FADE = 1800   // ms it takes to fade out
const SPACING = 5   // px between dabs along the stroke
const MAX = 900     // dabs kept at once

function makeDab(size, color) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const r = size / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, `rgb(${color} / 0.9)`)
  grad.addColorStop(0.45, `rgb(${color} / 0.55)`)
  grad.addColorStop(1, `rgb(${color} / 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export default function FooterCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host || !motionOn()) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const dab = makeDab(150, '53 49 46') // #35312E
    const dots = []
    let raf = 0, last = null

    const size = () => {
      const r = host.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr)
      canvas.style.width = `${r.width}px`; canvas.style.height = `${r.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(host)

    const draw = (now) => {
      raf = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const d of dots) {
        const age = now - d.t
        const a = age < HOLD ? 1 : Math.max(0, 1 - (age - HOLD) / FADE)
        if (a <= 0) continue
        alive = true
        ctx.globalAlpha = a * d.k
        ctx.drawImage(dab, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2)
      }
      ctx.globalAlpha = 1
      while (dots.length && now - dots[0].t > HOLD + FADE) dots.shift()
      if (alive || dots.length) raf = requestAnimationFrame(draw)
    }
    const start = () => { if (!raf) raf = requestAnimationFrame(draw) }

    // Dabs are laid along the pointer's path at a fixed spacing, so quick sweeps stay continuous. Speed thins
    // the stroke a little, like a brush lifting as it moves faster.
    const move = (e) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.x, y = e.clientY - r.y, t = performance.now()
      if (last) {
        const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy)
        const speed = Math.min(dist / Math.max(t - last.t, 1), 3)
        const n = Math.max(1, Math.floor(dist / SPACING))
        for (let i = 1; i <= n; i++) {
          const f = i / n
          dots.push({ x: last.x + dx * f, y: last.y + dy * f, t, r: 18 - speed * 3 + Math.random() * 4, k: 0.55 - speed * 0.08 })
        }
      } else dots.push({ x, y, t, r: 20, k: 0.6 })
      if (dots.length > MAX) dots.splice(0, dots.length - MAX)
      last = { x, y, t }
      start()
    }
    const leave = () => { last = null }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); ro.disconnect(); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className="foot-canvas" aria-hidden="true" />
}
