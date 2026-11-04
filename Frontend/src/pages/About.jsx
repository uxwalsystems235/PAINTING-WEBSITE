import { Link } from 'react-router-dom'
import { Paragraphs } from '../components/ui'
import PortraitReveal from '../components/PortraitReveal'
import { useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'
import '../about.css'

// The flowing watercolour background comes from the layout (components/WashFlow.jsx); the cards below reuse its washes.
const WASHES = ['ochre', 'blush', 'blue', 'blush']

export default function About() {
  const t = useT()
  const subtitle = useContent('about.subtitle')
  const quote = useContent('about.quote')
  const areasTitle = useContent('about.areasTitle')
  const areas = useContent('about.areas')
  const cta = [useContent('about.cta1'), useContent('about.cta2'), useContent('about.cta3')]
  const [first, last] = ['Kalpana', 'Jagtap']
  usePageMeta(t('about.eyebrow'), `Kalpana Jagtap: ${subtitle}.`)

  return (
    <div className="about">

      <header className="about-hero">
        <div className="about-hero-copy" data-reveal>
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h1 className="about-name"><span>{first}</span><span>{last}</span></h1>
          <p className="about-sub">{subtitle}</p>
        </div>
        <figure className="about-portrait" data-reveal>
          {/* Line portrait over an ochre wash; hovering (or tapping) it reveals her photograph. */}
          <PortraitReveal eager />
        </figure>
      </header>

      <figure className="about-studio" data-reveal>
        {/* Studio photograph (public/img/studio.webp). */}
        <img src="/img/studio.webp" alt="Brushes, a palette and a blank canvas on an easel" width={1200} height={1800} loading="lazy" decoding="async" />
        <figcaption>{t('about.studio')}</figcaption>
      </figure>

      {quote && quote.trim() && (
        <blockquote className="about-quote" data-reveal>
          <p>“{quote.trim()}”</p>
          <footer>Kalpana Jagtap</footer>
        </blockquote>
      )}

      <div className="about-story">
        <Section n="01" k="about.story" />
        <Section n="02" k="about.journey" />
        <Section n="03" k="about.role" />
        <Section n="04" k="about.giving" />
      </div>

      {areas.length > 0 && (
        <section className="about-areas" aria-labelledby="about-areas">
          <span className="eyebrow" data-reveal>{t('about.areas')}</span>
          <h2 id="about-areas" data-reveal>{areasTitle}</h2>
          <div className="areas">
            {areas.map((a, i) => (
              <div key={(a.name || '') + i} className={`area wash-${WASHES[i % WASHES.length]}`} data-reveal>
                <span className="num">0{i + 1}</span>
                <h3>{a.name}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="about-cta" data-reveal>
        <Link to="/art" className="btn fill">{cta[0]}</Link>
        <Link to="/poetry" className="btn">{cta[1]}</Link>
        <Link to="/contact" className="btn">{cta[2]}</Link>
      </div>
    </div>
  )
}

function Section({ n, k }) {
  const title = useContent(k + '.title')
  const text = useContent(k + '.text')
  return (
    <section className="story" data-reveal>
      <div className="story-head">
        <span className="num">{n}</span>
        <h2>{title}</h2>
      </div>
      <div className="story-text"><Paragraphs text={text} /></div>
    </section>
  )
}
