import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArtworks, usePoems } from '../lib/ContentContext'
import { ArtImage } from '../components/ArtCard'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

export default function PoemDetail() {
  const t = useT()
  const { slug } = useParams()
  const { poems, loading } = usePoems()
  const { artworks } = useArtworks()
  const idx = poems.findIndex((p) => p.slug === slug)
  const [copied, setCopied] = useState(false)
  const found = idx >= 0 ? poems[idx] : null
  usePageMeta(found ? found.title : '', found ? found.body.split('\n').filter(Boolean).slice(0, 2).join(' ') : undefined)

  if (idx < 0 && loading) return <div className="max-w-3xl mx-auto px-5 py-24" aria-busy="true" />
  if (idx < 0) return <div className="max-w-3xl mx-auto px-5 py-24"><h1 className="text-4xl">{t('poetry.notFound')}</h1><Link to="/poetry" className="back-link mt-6">← {t('poetry.back')}</Link></div>

  const poem = poems[idx]
  const prev = poems[idx - 1]
  const next = poems[idx + 1]
  const art = artworks.find((a) => a.poemSlug === poem.slug)

  const share = async () => {
    const data = { title: poem.title, url: window.location.href }
    if (navigator.share) { try { await navigator.share(data) } catch { /* cancelled */ } return }
    try { await navigator.clipboard.writeText(data.url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard unavailable */ }
  }

  return (
    <article className="mx-auto px-5 py-12 md:py-20" style={{ maxWidth: 'calc(var(--measure-poem) + 2.5rem)' }} lang={poem.lang}>
      <Link to={`/poetry?lang=${poem.lang}`} lang="en" className="back-link">← {t('poetry.back')}</Link>
      <span className="eyebrow mt-8" lang="en">{poem.lang === 'mr' ? t('poetry.marathi') : t('poetry.english')}{poem.theme ? ` · ${poem.theme}` : ''}</span>
      <h1 className="text-5xl md:text-6xl mb-12">{poem.title}</h1>
      <div className="poem-text">
        {poem.body.split('\n').map((line, i) => line === ''
          ? <span key={i} className="block h-8" aria-hidden="true" />
          : <span key={i} className="poem-line block" style={{ '--i': i }}>{line}</span>)}
      </div>

      <div className="mt-14" lang="en">
        <button className="btn" onClick={share}>{copied ? t('poetry.copied') : t('poetry.share')}</button>
      </div>

      {art && (
        <Link to={`/art/${art.slug}`} lang="en" className="mt-16 flex gap-5 items-center border-t border-b border-sand py-5 no-underline">
          <div className="w-20 shrink-0 overflow-hidden" style={{ aspectRatio: art.ar }}><ArtImage art={art} /></div>
          <div>
            <span className="eyebrow" style={{ marginBottom: '0.4rem' }}>{t('poetry.related')}</span>
            <p className="font-serif text-3xl">{art.title}</p>
          </div>
        </Link>
      )}

      <nav className="mt-16 flex justify-between gap-4 text-base" lang="en" aria-label="Poem navigation">
        {prev ? <Link to={`/poetry/${prev.slug}`} className="underline inline-block py-3 font-serif text-lg">← <span lang={prev.lang}>{prev.title}</span></Link> : <span />}
        {next ? <Link to={`/poetry/${next.slug}`} className="underline inline-block py-3 font-serif text-lg"><span lang={next.lang}>{next.title}</span> →</Link> : <span />}
      </nav>
    </article>
  )
}
