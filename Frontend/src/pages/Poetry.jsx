import { Link, useSearchParams } from 'react-router-dom'
import { Arrow, PageHead } from '../components/ui'
import { useContent, usePoems } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

const langs = [['', 'poetry.all'], ['en', 'poetry.english'], ['mr', 'poetry.marathi']]

export default function Poetry() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const { poems } = usePoems()
  const heading = useContent('poetry.heading')
  const intro = useContent('poetry.intro')
  const lang = params.get('lang') || ''
  const list = poems.filter((p) => !lang || p.lang === lang)
  usePageMeta(heading, intro)

  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageHead eyebrow={t('poetry.journal')} title={heading} lead={intro} />
      <div className="max-w-3xl mx-auto">
        <div className="mt-10 view-toggle" role="group" aria-label={t('poetry.language')}>
          {langs.map(([v, l]) => (
            <button key={v} onClick={() => setParams(v ? { lang: v } : {})} aria-pressed={lang === v} lang={v === 'mr' ? 'mr' : undefined}>{t(l)}</button>
          ))}
        </div>

        <ul className="mt-10 border-t border-charcoal">
          {list.map((p, i) => (
            <li key={p.slug} className="border-b border-sand" data-reveal>
              <Link to={`/poetry/${p.slug}`} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 py-7 no-underline">
                <span className="text-xs tracking-[0.22em] text-terracotta font-medium">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span lang={p.lang} className="block font-serif text-3xl md:text-4xl leading-tight">{p.title}</span>
                  <span className="block mt-1 text-xs uppercase tracking-[0.18em] text-mut">{p.lang === 'mr' ? t('poetry.marathi') : t('poetry.english')}{p.theme ? ` · ${p.theme}` : ''}</span>
                </span>
                <Arrow className="transition-transform group-hover:translate-x-1.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
