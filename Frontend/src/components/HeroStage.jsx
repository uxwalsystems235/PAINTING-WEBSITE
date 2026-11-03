import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { priceLabel } from '../data/artworks'
import { useArtTitle } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import PaintingArt from './PaintingArt'
import { ArrowLink } from './ui'

// Pinned, scroll-driven slideshow (styles: .hero-stage in home.css). Slide 0 is the site introduction over the
// gallery photograph; the rest are featured paintings. Each slide gets one viewport of scroll: during the first
// quarter it sits still, then its title zooms toward the viewer and fades while the next slide arrives from a blur.
// Everything is driven from the scroll position (no library), so the sequence is fully reversible.

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
const ease = (t) => t * t * (3 - 2 * t)

// Scroll distance given to each slide, as a multiple of the stage height. More = slower, calmer transitions.
const PER = 1.25
// How quickly the eased position follows the real scroll position (per 60fps frame). Lower = more inertia.
const FOLLOW = 0.11

// d = slide position relative to the eased scroll: 0 = settled, 1 = fully gone, -1 = not yet arrived.
function paint(slide, d) {
  const img = slide.firstElementChild
  const copy = slide.lastElementChild
  if (d <= -0.75 || d >= 1) { if (slide.style.visibility !== 'hidden') slide.style.visibility = 'hidden'; return }
  slide.style.visibility = 'visible'
  let io, ib, is, co, cb, cs
  if (d < 0) { // arriving: d -0.75 → 0
    const t = ease((d + 0.75) / 0.75)
    slide.style.zIndex = 2
    io = t; ib = (1 - t) * 10; is = 1.08 - 0.08 * t
    co = t; cb = (1 - t) * 8; cs = 0.7 + 0.3 * t
  } else if (d < 0.3) { // settled: a slow drift only
    slide.style.zIndex = 2
    io = 1; ib = 0; is = 1 + d * 0.12
    co = 1; cb = 0; cs = 1 + d * 0.25
  } else { // leaving: d 0.3 → 1, the title zooms through the viewer
    const t = ease((d - 0.3) / 0.7)
    slide.style.zIndex = 3
    io = 1 - t; ib = t * 8; is = 1.036 + t * 0.1
    co = 1 - clamp(t * 1.4, 0, 1); cb = t * 5; cs = 1.075 + t * 3.2
  }
  img.style.opacity = io.toFixed(3); img.style.filter = ib > 0.05 ? `blur(${ib.toFixed(1)}px)` : 'none'; img.style.transform = `translate3d(0,0,0) scale(${is.toFixed(4)})`
  copy.style.opacity = co.toFixed(3); copy.style.filter = cb > 0.05 ? `blur(${cb.toFixed(1)}px)` : 'none'; copy.style.transform = `translate3d(0,0,0) scale(${cs.toFixed(4)})`
}

export default function HeroStage({ featured, c }) {
  const root = useRef(null)
  const counter = useRef(null)
  const { t } = useLang()
  const title = useArtTitle()
  const count = featured.length + 1
  const motion = typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

  useEffect(() => {
    const el = root.current
    if (!el || !motion) return
    const stage = el.firstElementChild
    const slides = [...stage.querySelectorAll('.slide')]
    const bar = stage.querySelector('.stage-progress')
    const last = slides.length - 1
    let raf = 0, target = 0, current = 0, lastTime = 0, first = true

    // The section is sized so each slide owns PER viewports of scroll, plus a short hold at the end.
    const size = () => {
      const h = stage.offsetHeight || window.innerHeight
      el.style.height = `${Math.round(h * (last * PER + 1) + h * 0.12)}px`
      return h
    }
    const read = () => { const h = size(); target = clamp(-el.getBoundingClientRect().top / (h * PER), 0, last) }

    const draw = (p) => {
      slides.forEach((s, i) => paint(s, p - i))
      if (bar) bar.style.transform = `scaleX(${(last ? p / last : 1).toFixed(4)})`
      if (counter.current) counter.current.textContent = `${String(Math.min(Math.round(p) + 1, slides.length)).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
      // While the stage is pinned the floating back-to-top button stays out of the way (see home.css).
      document.documentElement.classList.toggle('hero-pinned', p < last + 0.05)
    }

    // The eased position chases the real one every frame, so wheel steps and flicks become one continuous glide.
    const tick = (now) => {
      raf = 0
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7
      lastTime = now
      const k = 1 - Math.pow(1 - FOLLOW, dt / 16.7)
      current += (target - current) * k
      if (Math.abs(target - current) < 0.0004) { current = target; draw(current); lastTime = 0; return }
      draw(current)
      raf = requestAnimationFrame(tick)
    }
    const schedule = () => {
      read()
      if (first) { first = false; current = target } // a reload mid-sequence starts in place, not from the top
      if (!raf) raf = requestAnimationFrame(tick)
    }
    schedule()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => {
      removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(raf)
      document.documentElement.classList.remove('hero-pinned'); el.style.height = ''
    }
  }, [motion, count])

  // The round button advances one slide; after the last slide it scrolls on to the next section.
  const next = () => {
    const el = root.current
    const per = (el.firstElementChild.offsetHeight || window.innerHeight) * PER
    const p = -el.getBoundingClientRect().top / per
    const target = motion && p < count - 1 - 0.02 ? window.scrollY + per * (Math.floor(p + 0.02) + 1 - p) : el.getBoundingClientRect().bottom + window.scrollY
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <header id="top" className="hero-stage" ref={root} style={{ '--slides': count }}>
      <div className="stage">
        <div className="slide">
          <div className="slide-img"><img src="/img/hero-gallery.webp" alt="" width={2000} height={836} fetchPriority="high" decoding="async" /></div>
          <div className="slide-copy">
            {c.eyebrow && <span className="eyebrow" style={{ '--i': 0 }}>{c.eyebrow}</span>}
            <h1 className="slide-title" style={{ '--i': 1 }}>{c.heroTitle}</h1>
            <p style={{ '--i': 2 }}>{c.heroText}</p>
            <div className="cta" style={{ '--i': 3 }}><a className="btn fill" href="#gallery">{c.cta1}</a><Link className="btn" to="/about">{c.cta2}</Link></div>
          </div>
        </div>
        {featured.map((a, i) => (
          <div className="slide" key={a.slug} aria-hidden={!motion}>
            <div className="slide-img"><PaintingArt art={a} sizes="100vw" /></div>
            <div className="slide-copy">
              <span className="eyebrow">{String(i + 1).padStart(2, '0')} · {a.available ? t('work.original') : t('work.privateCollection')}</span>
              <div className="slide-row">
                <h2 className="slide-title">{title(a)}</h2>
                <div className="slide-aside"><i>{priceLabel(a, t)}</i><small>{a.medium}{a.dimensions ? ` · ${a.dimensions}` : ''}</small></div>
              </div>
              <ArrowLink to={`/art/${a.slug}`}>{t('home.open')} {title(a)}</ArrowLink>
            </div>
          </div>
        ))}
        {motion && <div className="stage-progress" aria-hidden="true" />}
        <div className="stage-foot">
          <p className="meta"><b>Kalpana Jagtap</b><span>{c.announcement}</span></p>
          {motion && <span className="counter" ref={counter} aria-live="polite">01 / {String(count).padStart(2, '0')}</span>}
          <button type="button" className="next-btn" onClick={next} aria-label={t('home.open')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 4v16M5 13l7 7 7-7" /></svg>
          </button>
        </div>
      </div>
    </header>
  )
}
