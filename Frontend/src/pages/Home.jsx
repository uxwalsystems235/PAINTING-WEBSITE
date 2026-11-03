import { Link } from 'react-router-dom'
import { canBuy, isPrint, priceLabel } from '../data/artworks'
import HeroStage from '../components/HeroStage'
import { useArtTitle, useArtwork, useArtworks, useContent, usePoem } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import { useUi } from '../lib/UiContext'
import { usePageMeta } from '../lib/usePageMeta'
import PaintingArt from '../components/PaintingArt'
import Newsletter from '../components/Newsletter'
import { Arrow, ArrowLink, SectionHead } from '../components/ui'
import { useCart } from '../context/CartContext'
import '../home.css'

function GalleryLabel({ art }) {
  const { items, add, saved, toggleSaved } = useCart()
  const { t } = useLang()
  const title = useArtTitle()
  const inCart = items.some((i) => i.slug === art.slug)
  const isSaved = saved.includes(art.slug)
  const save = <button className="btn" onClick={() => toggleSaved(art.slug)}>{isSaved ? t('work.saved') : t('work.save')}</button>

  return (
    <div className="lab">
      <b>{title(art)}</b>
      <span>{art.medium} · {art.dimensions}</span>
      <em>{priceLabel(art, t)}</em>
      <div className="row">
        {isPrint(art) && <Link className="btn fill" to={`/art/${art.slug}`}>{t('work.chooseSize')}</Link>}
        {canBuy(art) && !isPrint(art) && <button className="btn fill" onClick={() => add({ slug: art.slug, title: art.title, type: art.type, price: art.price })}>{inCart ? t('work.added') : t('work.addToCart')}</button>}
        {!art.available && <Link className="btn" to={`/custom-art?ref=${encodeURIComponent(art.title)}`}>{t('work.commissionSimilar')}</Link>}
        {art.available && art.price == null && !isPrint(art) && <Link className="btn fill" to={`/contact?subject=acquisition&artwork=${art.slug}`}>{t('work.enquire')}</Link>}
        {art.available && save}
      </div>
    </div>
  )
}

// The admin lists painting slugs for the hero slides; unknown slugs are skipped. Empty → the first three works.
function useFeatured(artworks, slugs) {
  const picked = String(slugs || '').split(',').map((x) => x.trim()).filter(Boolean)
    .map((slug) => artworks.find((a) => a.slug === slug)).filter(Boolean)
  return picked.length ? picked : artworks.slice(0, 3)
}

// Where each of the three pillars leads.
const PILLAR_LINKS = ['/about', '/poetry', '/cause']

// The featured poem: its first lines, so the home page gives a taste of the journal without the whole poem.
function FeaturedPoem({ poem, caption, linkLabel }) {
  const { t } = useLang()
  const lines = poem.body.split('\n').filter((l) => l.trim()).slice(0, 4)
  return (
    <div className="poem-quote" data-reveal>
      <span className="eyebrow">{t('home.featured')}</span>
      <h2 lang={poem.lang} className="poem-title">{poem.title}</h2>
      <p lang={poem.lang} className="poem-excerpt">{lines.map((l, i) => <span key={i} className="block">{l}</span>)}</p>
      <small>{caption}</small>
      <div className="poem-links">
        <ArrowLink to={`/poetry/${poem.slug}`}>{t('home.readPoem')}</ArrowLink>
        <ArrowLink to="/poetry">{linkLabel}</ArrowLink>
      </div>
    </div>
  )
}

export default function Home() {
  const { artworks } = useArtworks()
  const { t } = useLang()
  const { openDonate } = useUi()
  const title = useArtTitle()
  const hero = useArtwork('butterflies') ?? artworks[0]
  const c = {
    eyebrow: useContent('home.heroEyebrow'), heroTitle: useContent('home.heroTitle'), heroText: useContent('home.heroText'),
    announcement: useContent('global.announcement'),
    cta1: useContent('home.heroCta1'), cta2: useContent('home.heroCta2'),
    galleryHeading: useContent('home.galleryHeading'), galleryLead: useContent('home.galleryLead'),
    zoomHeading: useContent('home.zoomHeading'), zoomLead: useContent('home.zoomLead'),
    aboutHeading: useContent('home.aboutHeading'), aboutText: useContent('home.aboutText'), aboutCta: useContent('home.aboutCta'),
    pillars: useContent('home.pillars'),
    infoHeading: useContent('home.infoHeading'), infoText: useContent('home.infoText'), infoRows: useContent('home.infoRows'),
    big: useContent('home.purposeBig'), purposeHeading: useContent('home.purposeHeading'), purposeText: useContent('home.purposeText'),
    pills: useContent('home.purposePills'), purposeCta: useContent('home.purposeCta'),
    featured: useContent('home.featuredPoem'),
    quote: useContent('home.poemQuote'), caption: useContent('home.poemCaption'), poemLink: useContent('home.poemLink'),
    newsletter: useContent('home.newsletterHeading'),
  }
  const featured = usePoem(String(c.featured || '').trim())
  usePageMeta('', c.heroText)

  const slides = useFeatured(artworks, useContent('home.heroSlugs'))

  return (
    <div>
      <HeroStage featured={slides} c={c} />

      {/* Ribbon of themes; decorative, so hidden from assistive tech (the pillars below carry the same words). */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => <span key={k}>{[c.eyebrow, ...c.pillars.map((p) => p.name), c.galleryHeading].filter(Boolean).map((w, i) => <span key={i}>{w}</span>)}</span>)}
        </div>
      </div>

      <section id="about" className="section welcome">
        <div className="welcome-grid">
          <div data-reveal>
            <span className="eyebrow">{t('home.theArtist')}</span>
            <h2>{c.aboutHeading}</h2>
            <p>{c.aboutText}</p>
            <ArrowLink to="/about">{c.aboutCta}</ArrowLink>
          </div>
          <div className="sketch" data-reveal>
            {/* Continuous-line portrait (public/img/portrait-line.webp); replace with an approved likeness if preferred. */}
            <img src="/img/portrait-line.webp" alt="Line drawing of Kalpana Jagtap, seated, hands folded" width={1200} height={1607} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <section id="pillars" className="section" style={{ paddingTop: 0 }}>
        <div className="pillars">
          {c.pillars.map((p, i) => (
            <Link key={(p.name || '') + i} to={PILLAR_LINKS[i] || '/about'} className="pillar" data-reveal>
              <span className="num">0{i + 1}</span><div className="pillar-head"><h3>{p.name}</h3><Arrow /></div><p>{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="gallery" className="section collection">
        <div className="container">
          <SectionHead title={c.galleryHeading} data-reveal><ArrowLink to="/art">{t('home.viewAll')}</ArrowLink></SectionHead>
          <p className="lead" data-reveal>{c.galleryLead}</p>
          <div className="masonry">
            {artworks.map((a) => (
              <div key={a.slug} className="work" data-reveal>
                <Link to={`/art/${a.slug}`} className="cv" aria-label={`${title(a)} — ${t('work.view')}`}>
                  <span className="cv-art" style={{ aspectRatio: a.ar }}><PaintingArt art={a} /></span>
                  {!a.available && <span className="badge">{t('work.privateCollection')}</span>}
                </Link>
                <GalleryLabel art={a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {hero && (
        <section id="zoom" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <span className="eyebrow" data-reveal>{t('home.detail')}</span>
            <h2 data-reveal style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)' }}>{c.zoomHeading}</h2>
            <p className="lead" data-reveal style={{ marginTop: '1rem' }}>{c.zoomLead}</p>
            <div className="closeup" data-reveal>
              <div className="closeup-art"><PaintingArt art={hero} /></div>
              <ArrowLink to={`/art/${hero.slug}`}>{t('home.open')} {title(hero)}</ArrowLink>
            </div>
          </div>
        </section>
      )}

      <section id="collect" className="info">
        <div className="info-img">
          {/* Studio photograph (public/img/studio.webp): brushes and palette; swap for Kalpana's own studio when available. */}
          <img src="/img/studio.webp" alt="Brushes, a palette and an easel in a painter's studio" width={1200} height={1800} loading="lazy" decoding="async" />
        </div>
        <div className="info-body" data-reveal>
          <span className="eyebrow">{t('home.collecting')}</span>
          <h2>{c.infoHeading}</h2>
          <p>{c.infoText}</p>
          <dl>
            {c.infoRows.map((r, i) => <div key={(r.label || '') + i} className="contents"><dt>{r.label}</dt><dd>{r.value}</dd></div>)}
          </dl>
          <ArrowLink to="/shipping-returns">{t('home.shipping')}</ArrowLink>
        </div>
      </section>

      <section id="purpose" className="section purpose">
        <span className="eyebrow" data-reveal>{t('home.purpose')}</span>
        <div className="big" data-reveal>{c.big}</div>
        <h2 data-reveal>{c.purposeHeading}</h2>
        <p data-reveal>{c.purposeText}</p>
        <div className="pts" data-reveal>{c.pills.map((p, i) => <span key={(p.text || '') + i}>{p.text}</span>)}</div>
        <div className="cta" data-reveal>
          <Link className="btn fill" to="/cause">{c.purposeCta}</Link>
          <button type="button" className="btn" onClick={openDonate}>{t('home.donate')}</button>
        </div>
      </section>

      <section id="poetry" className="section poetry">
        {featured ? <FeaturedPoem poem={featured} caption={c.caption} linkLabel={c.poemLink} /> : (
          <div className="poem-quote" data-reveal>
            <span className="eyebrow">{t('home.artPoetry')}</span>
            <p>“{c.quote}”</p>
            <small>{c.caption}</small>
            <ArrowLink to="/poetry">{c.poemLink}</ArrowLink>
          </div>
        )}
      </section>

      <section id="newsletter" className="news">
        <div className="news-grid">
          <div data-reveal><span className="eyebrow">{t('home.newsletter')}</span><h2>{c.newsletter}</h2></div>
          <Newsletter />
        </div>
      </section>
    </div>
  )
}
