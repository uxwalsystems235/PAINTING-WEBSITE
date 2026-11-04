import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import { priceLabel } from '../data/artworks'
import { useArtTitle } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import PaintingArt from './PaintingArt'
import { ArrowLink } from './ui'
import { ScrollTrigger, gsap, motionOn, scrollToY } from '../lib/smooth'

// Pinned, scroll-driven slideshow (styles: .hero-stage in home.css). Slide 0 is the site introduction over the
// gallery photograph; the rest are featured paintings. Each slide gets one viewport of scroll: during the first
// quarter it sits still, then its title zooms toward the viewer and fades while the next slide arrives from a blur.
// GSAP ScrollTrigger pins the stage and scrubs a proxy value through the slides; ScrollSmoother (Layout.jsx)
// supplies the glide, so the sequence is smooth and fully reversible.

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
const ease = (t) => t * t * (3 - 2 * t)

// Scroll distance given to each slide, as a multiple of the stage height. More = slower, calmer transitions.
const PER = 1.25

// d = slide position relative to the eased scroll: 0 = settled, 1 = fully gone, -1 = not yet arrived.
// Only opacity and transform are animated on the full-screen image layers: both are composited on the GPU for
// free. A per-frame blur() on a viewport-sized layer is what made scrolling stutter, so the image no longer blurs
// and the title keeps only a light blur as it passes through the viewer.
function paint(slide, d) {
  const img = slide.firstElementChild
  const copy = slide.lastElementChild
  if (d <= -0.75 || d >= 1) { if (slide.style.visibility !== 'hidden') slide.style.visibility = 'hidden'; return }
  if (slide.style.visibility !== 'visible') slide.style.visibility = 'visible'
  let io, is, co, cb, cs, z
  if (d < 0) { // arriving: d -0.75 → 0
    const t = ease((d + 0.75) / 0.75)
    z = 2
    io = t; is = 1.1 - 0.1 * t
    co = t; cb = (1 - t) * 3; cs = 0.7 + 0.3 * t
  } else if (d < 0.3) { // settled: a slow drift only
    z = 2
    io = 1; is = 1 + d * 0.12
    co = 1; cb = 0; cs = 1 + d * 0.25
  } else { // leaving: d 0.3 → 1, the title zooms through the viewer
    const t = ease((d - 0.3) / 0.7)
    z = 3
    io = 1 - t; is = 1.036 + t * 0.1
    co = 1 - clamp(t * 1.4, 0, 1); cb = t * 3; cs = 1.075 + t * 3.2
  }
  if (slide.style.zIndex !== String(z)) slide.style.zIndex = z
  img.style.opacity = io.toFixed(3); img.style.transform = `scale(${is.toFixed(4)})`
  copy.style.opacity = co.toFixed(3); copy.style.filter = cb > 0.3 ? `blur(${cb.toFixed(1)}px)` : 'none'; copy.style.transform = `scale(${cs.toFixed(4)})`
}

export default function HeroStage({ featured, c }) {
  const root = useRef(null)
  const counter = useRef(null)
  const { t } = useLang()
  const title = useArtTitle()
  const count = featured.length + 1
  const motion = motionOn()
  const trigger = useRef(null)

  useGSAP(() => {
    const el = root.current
    if (!el || !motion) return
    const stage = el.querySelector('.stage')
    const slides = [...stage.querySelectorAll('.slide')]
    const bar = stage.querySelector('.stage-progress')
    const last = slides.length - 1
    // Scroll after the last slide settles, as a fraction of one slide's distance: a short hold before release.
    const HOLD = 0.12 / PER

    // The section is sized so each slide owns PER viewports of scroll, plus the hold. ScrollTrigger re-runs this
    // before every refresh (resize, fonts, route change), so there is no measuring in the scroll path at all.
    const size = () => {
      const h = stage.offsetHeight || window.innerHeight
      el.style.height = `${Math.round(h * (last * PER + 1) + h * 0.12)}px`
    }

    const draw = (p) => {
      slides.forEach((s, i) => paint(s, p - i))
      if (bar) bar.style.transform = `scaleX(${(last ? p / last : 1).toFixed(4)})`
      if (counter.current) counter.current.textContent = `${String(Math.min(Math.round(p) + 1, slides.length)).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
      // While the stage is pinned the floating back-to-top button stays out of the way (see home.css).
      document.documentElement.classList.toggle('hero-pinned', p < last + 0.05)
    }

    // A proxy value scrubbed from 0 to the end of the sequence; ScrollTrigger pins the stage for the section's
    // whole height. scrub: true follows the (already smoothed) scroll position directly, so there is no double lag.
    size()
    const pos = { p: 0 }
    const tween = gsap.to(pos, { p: last + HOLD, ease: 'none', onUpdate: () => draw(Math.min(pos.p, last)) })
    trigger.current = ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom bottom', pin: stage, pinSpacing: false, animation: tween, scrub: true,
      invalidateOnRefresh: true, onRefreshInit: size,
      onToggle: (self) => document.documentElement.classList.toggle('hero-pinned', self.isActive),
    })
    draw(0)
    // Fonts and the gallery image can shift the stage a little after the first paint: measure once more then.
    const settle = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => { clearTimeout(settle); trigger.current = null; document.documentElement.classList.remove('hero-pinned'); el.style.height = '' }
  }, { scope: root, dependencies: [motion, count] })

  // The round button advances one slide; after the last slide it scrolls on to the next section.
  const next = () => {
    const el = root.current
    const st = trigger.current
    const stage = el.querySelector('.stage')
    const per = (stage.offsetHeight || window.innerHeight) * PER
    if (!st) { scrollToY(el.getBoundingClientRect().bottom + window.scrollY, true); return }
    const p = (window.scrollY - st.start) / per
    scrollToY(p < count - 1 - 0.02 ? st.start + per * (Math.floor(p + 0.02) + 1) : st.end + per * 0.02, true)
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
