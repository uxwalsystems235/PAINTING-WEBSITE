import { Link, useSearchParams } from 'react-router-dom'
import ArtCard from '../components/ArtCard'
import { PageHead } from '../components/ui'
import { useArtworks, useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

// Gallery with two small filters: availability (all / available / private collection) and series.
// Both live in the URL (?show=available&series=...) so a filtered view can be shared or bookmarked.
export default function Art() {
  const t = useT()
  const { artworks } = useArtworks()
  const heading = useContent('art.heading')
  const intro = useContent('art.intro')
  const customText = useContent('art.customText')
  const customLink = useContent('art.customLink')
  const [params, setParams] = useSearchParams()
  usePageMeta(heading, intro)

  const show = ['available', 'sold'].includes(params.get('show')) ? params.get('show') : ''
  const seriesList = [...new Set(artworks.map((a) => a.series).filter(Boolean))]
  const series = seriesList.includes(params.get('series')) ? params.get('series') : ''

  const update = (patch) => {
    const n = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k) })
    setParams(n, { replace: true })
  }

  const list = artworks.filter((a) =>
    (show === '' || (show === 'available' ? a.available : !a.available)) && (series === '' || a.series === series))
  const soldCount = artworks.filter((a) => !a.available).length

  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageHead eyebrow={t('art.eyebrow')} title={heading} lead={intro} />
      <div className="container">
        <div className="filters mt-12" data-reveal>
          <div className="filter-group" role="group" aria-label={t('art.show')}>
            <span className="filter-label">{t('art.show')}</span>
            <div className="view-toggle">
              <button type="button" onClick={() => update({ show: '' })} aria-pressed={show === ''}>{t('art.all')} <small>{artworks.length}</small></button>
              <button type="button" onClick={() => update({ show: 'available' })} aria-pressed={show === 'available'}>{t('art.available')} <small>{artworks.length - soldCount}</small></button>
              {soldCount > 0 && <button type="button" onClick={() => update({ show: 'sold' })} aria-pressed={show === 'sold'}>{t('work.privateCollection')} <small>{soldCount}</small></button>}
            </div>
          </div>
          {seriesList.length > 1 && (
            <div className="filter-group" role="group" aria-label={t('art.series')}>
              <span className="filter-label">{t('art.series')}</span>
              <div className="chips">
                <button type="button" className="chip" onClick={() => update({ series: '' })} aria-pressed={series === ''}>{t('art.all')}</button>
                {seriesList.map((s) => <button key={s} type="button" className="chip" onClick={() => update({ series: s })} aria-pressed={series === s}>{s}</button>)}
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-mut" aria-live="polite">
          {list.length} {list.length === 1 ? t('art.work') : t('art.works')}{series ? ` · ${series}` : ''}
        </p>

        {list.length === 0 ? (
          <div className="mt-10 border-t border-charcoal pt-8">
            <p className="font-serif text-2xl">{t('art.none')}</p>
            <button type="button" className="btn mt-6" onClick={() => setParams({}, { replace: true })}>{t('art.clear')}</button>
          </div>
        ) : (
          // Each work keeps its true proportions and hangs in a masonry, like a gallery wall.
          <div className="masonry mt-8" key={show + '|' + series}>
            {list.map((a, i) => <ArtCard key={a.slug} art={a} eager={i < 3} />)}
          </div>
        )}

        <p className="mt-16 text-center text-mut font-serif text-xl" data-reveal>
          {customText} <Link to="/custom-art" className="text-terracotta underline">{customLink}</Link>.
        </p>
      </div>
    </div>
  )
}
