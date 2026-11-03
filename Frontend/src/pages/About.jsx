import { Link } from 'react-router-dom'
import { PageHead, Paragraphs } from '../components/ui'
import { useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

export default function About() {
  const t = useT()
  const subtitle = useContent('about.subtitle')
  const quote = useContent('about.quote')
  const areasTitle = useContent('about.areasTitle')
  const areas = useContent('about.areas')
  const cta = [useContent('about.cta1'), useContent('about.cta2'), useContent('about.cta3')]
  usePageMeta(t('about.eyebrow'), `Kalpana Jagtap: ${subtitle}.`)

  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageHead eyebrow={t('about.eyebrow')} title="Kalpana Jagtap">
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-mut">{subtitle}</p>
      </PageHead>

      <div className="container mt-12 grid gap-6 md:grid-cols-[3fr_2fr] items-end" data-reveal>
        {/* Studio photograph (public/img/studio.webp) and a continuous-line portrait (public/img/portrait-line.webp).
            Replace with approved photographs of Kalpana when they are available. */}
        <img src="/img/studio.webp" alt="Brushes, a palette and a blank canvas on an easel" width={1200} height={1800} loading="eager" decoding="async" className="w-full aspect-[4/3] object-cover bg-panel" />
        <div className="relative aspect-[4/5] bg-panel overflow-hidden">
          <img src="/img/portrait-line.webp" alt="Line drawing of Kalpana Jagtap" width={1200} height={1607} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply dark:mix-blend-screen dark:invert" />
        </div>
      </div>

      {quote && quote.trim() && (
        <blockquote className="container mt-14 max-w-3xl font-serif italic text-2xl md:text-4xl leading-snug" data-reveal>
          “{quote.trim()}”
          <footer className="mt-4 not-italic text-xs uppercase tracking-[0.22em] text-mut">Kalpana Jagtap</footer>
        </blockquote>
      )}

      <div className="max-w-2xl mx-auto">
        <Section n="01" k="about.story" />
        <Section n="02" k="about.journey" />
        <Section n="03" k="about.role" />
        <Section n="04" k="about.giving" />
      </div>

      {areas.length > 0 && (
        <section className="container mt-20" aria-labelledby="about-areas">
          <span className="eyebrow" data-reveal>{t('about.areas')}</span>
          <h2 id="about-areas" className="sr-only">{areasTitle}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((a, i) => (
              <div key={(a.name || '') + i} className="border-t border-charcoal pt-5" data-reveal>
                <span className="block text-xs tracking-[0.22em] text-terracotta font-medium mb-3">0{i + 1}</span>
                <h3 className="text-2xl">{a.name}</h3>
                <p className="mt-3 text-mut">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-2xl mx-auto mt-16 flex flex-wrap gap-4">
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
    <section className="mt-16 pt-8 border-t border-charcoal" data-reveal>
      <span className="eyebrow">{n}</span>
      <h2 className="text-4xl">{title}</h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-mut font-serif"><Paragraphs text={text} /></div>
    </section>
  )
}
