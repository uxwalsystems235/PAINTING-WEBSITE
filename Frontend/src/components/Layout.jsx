import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import WashFlow from './WashFlow'
import FooterCanvas from './FooterCanvas'
import { useGSAP } from '@gsap/react'
import { ScrollSmoother, ScrollTrigger, motionOn, scrollToY } from '../lib/smooth'
import { useCart } from '../context/CartContext'
import { inr } from '../data/artworks'
import { safeUrl } from '../data/shipping'
import { useContent, useSettings } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import { UiProvider } from '../lib/UiContext'
import DonatePanel from './DonatePanel'
import { SvgDefs } from './PaintingArt'
import '../site.css'

// Links sit either side of the centred name, museum-style; on small screens they collapse into one menu.
const LEFT = [['/art', 'nav.gallery'], ['/about', 'nav.about'], ['/poetry', 'nav.poetry']]
const RIGHT = [['/cause', 'nav.cause'], ['/contact', 'nav.contact']]

function NavLinks({ links, pathname, t }) {
  return links.map(([to, key]) => (
    <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{t(key)}</Link>
  ))
}

function LangToggle({ className = '' }) {
  const { lang, toggle, t } = useLang()
  // The button names the language it switches TO, in that language.
  return (
    <button type="button" className={'lang-btn ' + className} onClick={toggle} lang={lang === 'mr' ? 'en' : 'mr'} aria-label={t('lang.switch')} title={t('lang.switch')}>
      {t('lang.other')}
    </button>
  )
}

function Nav({ openDonate }) {
  const { count, saved, openDrawer } = useCart()
  const { pathname } = useLocation()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  // Over the home hero the bar is transparent until the visitor scrolls (see .nav.glass in site.css).
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  const glass = pathname === '/' && !scrolled && !open

  // The mobile menu closes when a link inside it is chosen (click handler below) and on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav className={"nav" + (glass ? " glass" : "")} aria-label="Main">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-ivory focus:text-charcoal focus:px-3 focus:py-2 focus:z-50">{t('nav.skip')}</a>
      <div className="nav-left">
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}>{open ? '✕' : '☰'}</button>
        <div className="links"><NavLinks links={LEFT} pathname={pathname} t={t} /></div>
      </div>
      <Link to="/" className="logo">Kalpana Jagtap</Link>
      <div className="nav-right">
        <div className="links"><NavLinks links={RIGHT} pathname={pathname} t={t} /></div>
        <div className="icons">
          <LangToggle className="desk" />
          <button type="button" className="support" onClick={openDonate}>{t('nav.support')}</button>
          <span className="tag">{t('nav.wishlist')}<span className="count">{saved.length}</span></span>
          <button onClick={openDrawer}>{t('nav.cart')}<span className="count">{count}</span></button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="mobile-menu" onClick={(e) => { if (e.target.closest('a')) setOpen(false) }}>
          <NavLinks links={[...LEFT, ...RIGHT]} pathname={pathname} t={t} />
          <Link to="/art">{t('nav.wishlist')} ({saved.length})</Link>
          <div className="mobile-row">
            <button type="button" className="btn" onClick={() => { setOpen(false); openDonate() }}>{t('nav.support')}</button>
            <LangToggle />
          </div>
        </div>
      )}
    </nav>
  )
}

function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, remove } = useCart()
  const { checkoutEnabled } = useSettings()
  const { t } = useLang()
  return (
    <aside className={'drawer' + (drawerOpen ? ' open' : '')} aria-label={t('cart.title')} aria-hidden={!drawerOpen}>
      <button className="x" onClick={closeDrawer}>{t('cart.close')}</button>
      <h3>{t('cart.title')}</h3>
      <div className="flex-1 overflow-auto">
        {items.length === 0
          ? <p className="text-mut">{t('cart.empty')}</p>
          : items.map((i) => (
            <div key={i.key} className="it">
              <span className="font-serif text-lg leading-snug">{i.title}{i.variant ? ` (${i.variant})` : ''}{i.qty > 1 ? ` × ${i.qty}` : ''}<br />
                <button className="text-xs uppercase tracking-[0.18em] font-sans underline text-mut mt-1" onClick={() => remove(i.key)}>{t('cart.remove')}</button></span>
              <span>{inr(i.price * i.qty)}</span>
            </div>
          ))}
      </div>
      {items.length > 0 && <p className="flex justify-between font-serif text-xl"><span>{t('cart.subtotal')}</span><span>{inr(subtotal)}</span></p>}
      {items.length > 0 && !checkoutEnabled && <p className="text-sm text-mut mt-3">{t('cart.paused')}</p>}
      <Link to={items.length ? '/checkout' : '/art'} onClick={closeDrawer} className="btn fill mt-auto">
        {items.length ? t('cart.checkout') : t('cart.browse')}
      </Link>
    </aside>
  )
}

// Site-wide donation dialog: native <dialog>, so focus is trapped and Esc closes it. Opened from the Support
// button, the purpose section on the home page, sold artworks, and any link to "#donate".
function DonateDialog({ dialogRef }) {
  const { t } = useLang()
  return (
    <dialog ref={dialogRef} className="donate-dialog" aria-label={t('nav.support')}
      onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current.close() }}>
      <div className="donate-dialog-bar">
        <span className="eyebrow" style={{ margin: 0 }}>{t('cause.support')}</span>
        <button type="button" className="btn" onClick={() => dialogRef.current.close()}>{t('donate.close')}</button>
      </div>
      <div className="donate-dialog-body"><DonatePanel heading="h2" /></div>
    </dialog>
  )
}

function BackToTop() {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; setShow(window.scrollY > 900) })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return (
    <button type="button" className={'to-top' + (show ? ' show' : '')} tabIndex={show ? 0 : -1} aria-hidden={!show}
      onClick={() => { scrollToY(0, motionOn()); document.getElementById('main')?.focus?.() }}>
      <span aria-hidden="true">↑</span> {t('top')}
    </button>
  )
}

function FooterCol({ title, links: ls }) {
  return (
    <div>
      <h2>{title}</h2>
      <ul className="space-y-2.5">
        {ls.map(([to, label]) => <li key={to + label}><Link to={to}>{label}</Link></li>)}
      </ul>
    </div>
  )
}

function Footer({ openDonate }) {
  const tagline = useContent('global.footerTagline')
  const socials = useContent('global.social').filter((s) => s.name && safeUrl(s.url))
  const { t } = useLang()
  return (
    <footer className="foot">
      {/* Open canvas: moving the pointer over the footer paints a stroke that fades after a few seconds. */}
      <FooterCanvas />
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <p className="brand">Kalpana Jagtap</p>
          <p className="mt-4 font-serif text-lg max-w-xs">{tagline}</p>
          <button type="button" className="btn mt-6" onClick={openDonate}>{t('foot.donate')}</button>
        </div>
        <FooterCol title={t('foot.explore')} links={[['/about', t('foot.aboutK')], ['/art', t('nav.gallery')], ['/poetry', t('foot.poetry')], ['/cause', t('nav.cause')]]} />
        <FooterCol title={t('foot.store')} links={[['/custom-art', t('foot.custom')], ['/cart', t('foot.bag')], ['/track', t('foot.track')]]} />
        <FooterCol title={t('foot.help')} links={[['/shipping-returns', t('foot.shipping')], ['/faqs', t('foot.faqs')], ['/privacy', t('foot.privacy')], ['/terms', t('foot.terms')]]} />
      </div>
      <div className="foot-bottom max-w-6xl mx-auto">
        <ul>
          {socials.map((s, i) => <li key={s.name + i}><a href={safeUrl(s.url)} target="_blank" rel="noreferrer">{s.name}</a></li>)}
        </ul>
        <p>© {new Date().getFullYear()} Kalpana Jagtap. {t('foot.rights')}</p>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  const announcement = useContent('global.announcement')
  const donateRef = useRef(null)
  // Stable object for the UiContext; the dialog ref is only read inside the handler, never during render.
  const ui = useMemo(() => ({ openDonate: () => { const d = donateRef.current; if (d && !d.open) d.showModal() } }), [])

  // Hash links (e.g. /#purpose) scroll to the section once the page has rendered; other routes start at the top.
  // "#donate" with no such section on the page opens the donation dialog instead (the Cause page has one inline).
  useEffect(() => {
    // The page's height changes with the route, so the scroll plugins re-measure once the new page has rendered.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 80)
    if (!hash) { scrollToY(0, false); return () => clearTimeout(refresh) }
    const id = hash.slice(1)
    const t = setTimeout(() => {
      const el = document.getElementById(id)
      if (el) scrollToY(el, false)
      else if (id === 'donate') ui.openDonate()
    }, 50)
    return () => { clearTimeout(t); clearTimeout(refresh) }
  }, [pathname, hash, ui])

  // Smooth scrolling (GSAP ScrollSmoother): the wrapper/content pair below is translated to lag gently behind the
  // native scroll position. Only for visitors who have not asked for reduced motion. The header, cart drawer and
  // back-to-top button sit outside the wrapper because fixed and sticky elements cannot live inside smoothed content.
  useGSAP(() => {
    if (!motionOn()) return
    ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, smoothTouch: 0.1, effects: false })
  }, [])

  // The fixed header's height (announcement bar + nav) becomes --head-h, which the content pads itself by.
  const headRef = useRef(null)
  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const set = () => document.documentElement.style.setProperty('--head-h', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [announcement])

  // One shared, quiet reveal: anything marked data-reveal fades up once as it scrolls into view.
  // Uses IntersectionObserver + CSS transitions (see index.css), so it costs no layout reads and no JS library.
  // Without the `motion` class on <html> (reduced motion, or no JS) nothing is hidden in the first place.
  useEffect(() => {
    if (!document.documentElement.classList.contains('motion')) return
    const io = new IntersectionObserver((entries) => {
      let n = 0
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.style.transitionDelay = `calc(${n++} * 0.12s * var(--motion-speed))`
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 })
    const watch = (root) => {
      const found = root.matches?.('[data-reveal]') ? [root] : []
      found.push(...root.querySelectorAll('[data-reveal]'))
      found.forEach((el) => { if (!el.classList.contains('is-in')) io.observe(el) })
    }
    watch(document)
    // Content that appears later (lazy route chunk, or API data replacing the bundled fallback) is picked up too,
    // so nothing rendered after the first pass is left hidden.
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) watch(n) })))
    const main = document.getElementById('main')
    if (main) mo.observe(main, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [pathname])

  return (
    <UiProvider value={ui}>
      <SvgDefs />
      <div className="site-head" ref={headRef}>
        {announcement && <div className="bar" role="region" aria-label="Announcement">{announcement}</div>}
        <Nav openDonate={ui.openDonate} />
      </div>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {/* Every page but the home page sits on the shared watercolour flow (.washed / WashFlow). */}
          <main id="main" className={'min-h-[70vh]' + (pathname === '/' ? '' : ' washed')} tabIndex={-1}>{pathname !== '/' && <WashFlow />}<Outlet /></main>
          <Footer openDonate={ui.openDonate} />
        </div>
      </div>
      <CartDrawer />
      <DonateDialog dialogRef={donateRef} />
      <BackToTop />
    </UiProvider>
  )
}
