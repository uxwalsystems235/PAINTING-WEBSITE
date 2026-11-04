import { Link } from 'react-router-dom'
import DonatePanel from '../components/DonatePanel'
import { Arrow, PageHead, Paragraphs } from '../components/ui'
import { useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { useUi } from '../lib/UiContext'
import { usePageMeta } from '../lib/usePageMeta'
import { scrollToY } from '../lib/smooth'
import '../cause.css'

// Where each "way to help" card leads, in the order of the admin list (cause.ways).
const WAY_LINKS = ['/art', '#donate', '/contact?subject=collaboration', '/custom-art']

export default function Cause() {
  const t = useT()
  const { openDonate } = useUi()
  const c = {
    eyebrow: useContent('cause.eyebrow'), heading: useContent('cause.heading'), lead: useContent('cause.lead'),
    stats: useContent('cause.stats'), initiatives: useContent('cause.initiatives'),
    storyTitle: useContent('cause.storyTitle'), story: useContent('cause.story'),
    howTitle: useContent('cause.howTitle'), howSteps: useContent('cause.howSteps'),
    ways: useContent('cause.ways'), note: useContent('cause.note'),
    reviewsTitle: useContent('cause.reviewsTitle'), reviews: useContent('cause.reviews').filter((r) => r.quote),
  }
  usePageMeta(c.eyebrow, c.lead)

  const scrollToDonate = (e) => {
    const el = document.getElementById('donate')
    if (el) { e.preventDefault(); scrollToY(el, true) } else openDonate()
  }

  return (
    <div className="section cause" style={{ paddingTop: 0 }}>
      <PageHead eyebrow={c.eyebrow} title={c.heading} lead={c.lead}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#donate" className="btn fill" onClick={scrollToDonate}>{t('cause.donateBtn')}</a>
          <Link to="/art" className="btn">{t('cause.browse')}</Link>
        </div>
      </PageHead>

      {c.stats.length > 0 && (
        <section className="container cause-stats" aria-label={t('cause.impact')}>
          {c.stats.map((s, i) => (
            <div key={(s.value || '') + i} className="stat" data-reveal>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </section>
      )}

      {c.initiatives.length > 0 && (
        <section className="container cause-block" aria-labelledby="cause-funds">
          <span className="eyebrow" data-reveal>{t('cause.funds')}</span>
          <h2 id="cause-funds" className="sr-only">{t('cause.funds')}</h2>
          <div className="cause-cards">
            {c.initiatives.map((it, i) => (
              <article key={(it.name || '') + i} className="cause-card" data-reveal>
                <span className="num">0{i + 1}</span>
                <h3>{it.name}</h3>
                <p>{it.desc}</p>
                {it.metric && <p className="metric">{it.metric}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="container cause-story" aria-labelledby="cause-story">
        <div data-reveal>
          <span className="eyebrow">{t('cause.story')}</span>
          <h2 id="cause-story">{c.storyTitle}</h2>
        </div>
        <div className="prose" data-reveal><Paragraphs text={c.story} /></div>
      </section>

      {c.howSteps.length > 0 && (
        <section className="cause-how" aria-labelledby="cause-how">
          <div className="container">
            <span className="eyebrow" data-reveal>{t('cause.how')}</span>
            <h2 id="cause-how" data-reveal>{c.howTitle}</h2>
            <ol className="steps">
              {c.howSteps.map((s, i) => (
                <li key={(s.title || '') + i} data-reveal>
                  <span className="num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {c.ways.length > 0 && (
        <section className="container cause-block" aria-labelledby="cause-ways">
          <span className="eyebrow" data-reveal>{t('cause.ways')}</span>
          <h2 id="cause-ways" className="sr-only">{t('cause.ways')}</h2>
          <div className="cause-ways">
            {c.ways.map((w, i) => {
              const to = WAY_LINKS[i] || '/contact'
              const body = <><div className="way-head"><h3>{w.title}</h3><Arrow /></div><p>{w.desc}</p></>
              return to.startsWith('#')
                ? <a key={(w.title || '') + i} href={to} className="way" onClick={scrollToDonate} data-reveal>{body}</a>
                : <Link key={(w.title || '') + i} to={to} className="way" data-reveal>{body}</Link>
            })}
          </div>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="container cause-block" aria-labelledby="cause-reviews">
          <span className="eyebrow" data-reveal>{t('cause.reviews')}</span>
          <h2 id="cause-reviews" data-reveal>{c.reviewsTitle}</h2>
          <ul className="cause-reviews">
            {c.reviews.map((r, i) => (
              <li key={(r.name || '') + i} className="review" data-reveal>
                <blockquote>
                  <p>{r.quote}</p>
                  <footer><b>{r.name}</b>{r.role && <span>{r.role}</span>}</footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="donate" className="container cause-donate" aria-label={t('cause.support')} data-reveal>
        <DonatePanel heading="h2" />
      </section>

      {c.note && <div className="container cause-note" data-reveal><Paragraphs text={c.note} /></div>}
    </div>
  )
}
