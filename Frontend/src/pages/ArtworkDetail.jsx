import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArtImage, Badge } from '../components/ArtCard'
import ZoomViewer from '../components/ZoomViewer'
import { canBuy, inr, isPrint, priceLabel } from '../data/artworks'
import { useArtTitle, useArtwork, useArtworks, useContent, usePoem } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import { useUi } from '../lib/UiContext'
import { usePageMeta } from '../lib/usePageMeta'
import { useCart } from '../context/CartContext'

// The picture area of the living-room photograph is about 0.70 wide to tall (see .room-art in site.css);
// works wider than that fill the frame's width, taller ones fill its height, leaving a white mat around them.
const FRAME_RATIO = 0.7

export default function ArtworkDetail() {
  const { slug } = useParams()
  const art = useArtwork(slug)
  const { loading } = useArtworks()
  const poem = usePoem(art?.poemSlug)
  const note = useContent('art.detailNote')
  const { t, lang } = useLang()
  const title = useArtTitle()
  const { openDonate } = useUi()
  const { add, items, saved, toggleSaved } = useCart()
  const [pick, setPick] = useState(0)
  // ?view=room opens the room preview directly (shareable link); otherwise the artwork itself shows first.
  const [params] = useSearchParams()
  const [view, setView] = useState(params.get('view') === 'room' ? 'room' : 'art')
  usePageMeta(art ? title(art) : '', art?.description)

  // Not in the bundled data but the API may still be loading: wait rather than flash "not found".
  if (!art && loading) return <div className="max-w-3xl mx-auto px-5 py-24" aria-busy="true" />
  if (!art) return <div className="max-w-3xl mx-auto px-5 py-24"><h1 className="text-4xl">{t('detail.notFound')}</h1><Link to="/art" className="back-link mt-6">{t('detail.backToGallery')}</Link></div>

  const print = isPrint(art)
  const variant = print ? art.variants[Math.min(pick, art.variants.length - 1)] : null
  const price = print ? variant.price : art.price
  const line = print
    ? { slug: art.slug, title: art.title, type: 'print', variant: variant.label, price }
    : { slug: art.slug, title: art.title, type: art.type, price }
  const inCart = items.some((i) => i.slug === art.slug && (i.variant || '') === (variant?.label || ''))
  const dt = 'text-xs uppercase tracking-[0.18em] text-mut self-center'
  const otherTitle = lang === 'mr' ? art.title : art.titleMr // the title in the other language, shown small

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16 grid gap-10 md:gap-16 md:grid-cols-[3fr_2fr] items-start">
      {/* The painting stays in view while the details scroll beside it. */}
      <div className="md:sticky md:top-24">
        <div className="view-toggle" role="group" aria-label="View">
          <button onClick={() => setView('art')} aria-pressed={view === 'art'}>{t('detail.artwork')}</button>
          <button onClick={() => setView('room')} aria-pressed={view === 'room'}>{t('detail.room')}</button>
        </div>
        {view === 'room' ? (
          <div className="room">
            <img src="/img/room-living.webp" alt="" width={1600} height={1067} decoding="async" />
            <div className="room-art" aria-label={`${title(art)} shown framed on a living-room wall`} role="img">
              <div style={art.ar >= FRAME_RATIO ? { width: '86%', aspectRatio: art.ar } : { height: '86%', aspectRatio: art.ar }}><ArtImage art={art} /></div>
            </div>
          </div>
        ) : (
          <div className="relative bg-panel p-3 md:p-8">
            <ZoomViewer art={art}>
              <div className="mx-auto overflow-hidden" style={{ aspectRatio: art.ar, maxHeight: '78vh' }}>
                <ArtImage art={art} eager />
              </div>
            </ZoomViewer>
            <Badge art={art} />
          </div>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-mut">{view === 'room' ? t('detail.scale') : t('detail.enlarge')}</p>
      </div>

      <div>
        <Link to="/art" className="back-link">← {t('detail.back')}</Link>
        <span className="eyebrow mt-6">{print ? t('detail.print') : t('detail.original')}{art.series ? ` · ${art.series}` : ''}</span>
        <h1 className="text-5xl md:text-6xl">{title(art)}</h1>
        {otherTitle && <p lang={lang === 'mr' ? 'en' : 'mr'} className="mt-2 font-serif text-2xl text-mut">{otherTitle}</p>}
        <p className="mt-4 text-2xl font-serif">{print && art.available ? inr(price) : priceLabel(art, t)}</p>
        <p className="mt-6 text-mut leading-relaxed text-lg font-serif">{art.description}</p>

        <dl className="mt-8 text-sm grid grid-cols-[7rem_1fr] gap-y-2.5 border-t border-charcoal pt-6">
          <dt className={dt}>{t('detail.type')}</dt><dd>{print ? t('detail.print') : t('detail.oneOfOne')}</dd>
          <dt className={dt}>{t('detail.medium')}</dt><dd>{art.medium}</dd>
          <dt className={dt}>{t('detail.size')}</dt><dd>{art.dimensions}</dd>
          {art.series && <><dt className={dt}>{t('detail.series')}</dt><dd><Link to={`/art?series=${encodeURIComponent(art.series)}`} className="underline">{art.series}</Link></dd></>}
          {art.year && <><dt className={dt}>{t('detail.year')}</dt><dd>{art.year}</dd></>}
          {canBuy(art) && <><dt className={dt}>{t('detail.dispatch')}</dt><dd>{art.dispatch}</dd></>}
        </dl>

        {print && art.available && (
          <div className="mt-6">
            <label htmlFor="variant">{t('detail.size')}</label>
            <select id="variant" className="input mt-1 max-w-xs" value={pick} onChange={(e) => setPick(+e.target.value)}>
              {art.variants.map((v, i) => <option key={v.label} value={i}>{v.label} — {inr(v.price)}</option>)}
            </select>
          </div>
        )}

        {!art.available && <p className="mt-8 font-serif text-lg">{t('detail.soldNote')}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {canBuy(art) && (
            <button className="btn fill" disabled={inCart} onClick={() => add(line)}>
              {inCart ? t('work.inCart') : t('work.addToCart')}
            </button>
          )}
          {art.available && !print && art.price == null && <Link to={`/contact?subject=acquisition&artwork=${art.slug}`} className="btn fill">{t('work.enquire')}</Link>}
          {!art.available && <>
            <Link to={`/custom-art?ref=${encodeURIComponent(art.title)}`} className="btn fill">{t('work.commissionSimilar')}</Link>
            <button type="button" className="btn" onClick={openDonate}>{t('work.supportInstead')}</button>
          </>}
          {art.available && <button className="btn" onClick={() => toggleSaved(art.slug)}>{saved.includes(art.slug) ? t('work.saved') : t('work.save')}</button>}
        </div>

        <p className="mt-8 text-sm text-mut">
          {note}{' '}
          {t('detail.delivery')} <Link to="/shipping-returns" className="underline">{t('foot.shipping')}</Link>.
        </p>

        {poem && (
          <aside className="mt-10 border-t border-sand pt-6">
            <span className="eyebrow">{t('detail.relatedPoem')}</span>
            <Link to={`/poetry/${poem.slug}`} lang={poem.lang} className="font-serif text-3xl text-terracotta underline">{poem.title}</Link>
          </aside>
        )}
      </div>
    </div>
  )
}
