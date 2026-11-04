import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArtImage, Badge } from '../components/ArtCard'
import ZoomViewer from '../components/ZoomViewer'
import PrintOptions from '../components/PrintOptions'
import RoomView from '../components/RoomView'
import { canBuy, hasPrints, isPreorder, isPrint, priceLabel } from '../data/artworks'
import { useArtTitle, useArtwork, useArtworks, useContent, usePoem } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import { useUi } from '../lib/UiContext'
import { usePageMeta } from '../lib/usePageMeta'
import { useCart } from '../context/CartContext'

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
  // ?view=room opens the room preview directly (shareable link); otherwise the artwork itself shows first.
  const [params] = useSearchParams()
  const { hash } = useLocation()
  // "Order a print" opens the print options in a dialog; arriving with #print (home page links) opens it at once.
  const printDialog = useRef(null)
  const openPrints = () => { const d = printDialog.current; if (d && !d.open) d.showModal() }
  useEffect(() => { if (hash === '#print') setTimeout(openPrints, 100) }, [hash, slug])
  const [view, setView] = useState(params.get('view') === 'room' ? 'room' : 'art')
  usePageMeta(art ? title(art) : '', art?.description)

  // Not in the bundled data but the API may still be loading: wait rather than flash "not found".
  if (!art && loading) return <div className="max-w-3xl mx-auto px-5 py-24" aria-busy="true" />
  if (!art) return <div className="max-w-3xl mx-auto px-5 py-24"><h1 className="text-4xl">{t('detail.notFound')}</h1><Link to="/art" className="back-link mt-6">{t('detail.backToGallery')}</Link></div>

  const print = isPrint(art)
  // Prints (stand-alone or of this original) are added through PrintOptions; this line is the original itself.
  const line = { slug: art.slug, title: art.title, type: art.type, price: art.price }
  const inCart = items.some((i) => i.slug === art.slug && i.type === 'original')
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
          <RoomView art={art} title={title(art)} />
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
        <p className="mt-4 text-2xl font-serif">{priceLabel(art, t)}</p>
        <p className="mt-6 text-mut leading-relaxed text-lg font-serif">{art.description}</p>

        <dl className="mt-8 text-sm grid grid-cols-[7rem_1fr] gap-y-2.5 border-t border-charcoal pt-6">
          <dt className={dt}>{t('detail.type')}</dt><dd>{print ? t('detail.print') : t('detail.oneOfOne')}</dd>
          <dt className={dt}>{t('detail.medium')}</dt><dd>{art.medium}</dd>
          <dt className={dt}>{t('detail.size')}</dt><dd>{art.dimensions}</dd>
          {art.series && <><dt className={dt}>{t('detail.series')}</dt><dd><Link to={`/art?series=${encodeURIComponent(art.series)}`} className="underline">{art.series}</Link></dd></>}
          {art.year && <><dt className={dt}>{t('detail.year')}</dt><dd>{art.year}</dd></>}
          {canBuy(art) && <><dt className={dt}>{isPreorder(art) ? t('detail.expected') : t('detail.dispatch')}</dt><dd>{isPreorder(art) && art.preorderNote ? art.preorderNote : art.dispatch}</dd></>}
        </dl>

        {!art.available && !print && <p className="mt-8 font-serif text-lg">{t('detail.soldNote')}</p>}
        {isPreorder(art) && !print && (
          <p className="preorder-info"><span className="badge-pre-inline">{t('work.preorder')}</span>{t('detail.preorderInfo')}{art.preorderNote && <b> {art.preorderNote}</b>}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {canBuy(art) && !print && (
            <button className="btn fill" disabled={inCart} onClick={() => add(line)}>
              {inCart ? t('work.inCart') : isPreorder(art) ? t('work.preorderNow') : t('work.addToCart')}
            </button>
          )}
          {!print && hasPrints(art) && <button type="button" className="btn" onClick={openPrints}>{t('work.choosePrint')}</button>}
          {art.available && !print && art.price == null && <Link to={`/contact?subject=acquisition&artwork=${art.slug}`} className="btn fill">{t('work.enquire')}</Link>}
          {!art.available && <>
            <Link to={`/custom-art?ref=${encodeURIComponent(art.title)}`} className="btn fill">{t('work.commissionSimilar')}</Link>
            <button type="button" className="btn" onClick={openDonate}>{t('work.supportInstead')}</button>
          </>}
          {art.available && <button className="btn" onClick={() => toggleSaved(art.slug)}>{saved.includes(art.slug) ? t('work.saved') : t('work.save')}</button>}
        </div>

        {/* Prints: a stand-alone print sells from its options inline; prints of an original open in a dialog
            from the "Order a print" button (closed again once a print is added so the cart drawer can show). */}
        {print ? <PrintOptions art={art} /> : hasPrints(art) && (
          <dialog ref={printDialog} className="print-dialog" aria-label={`${title(art)}: ${t('detail.printOrder')}`}
            onClick={(e) => { if (e.target === printDialog.current) printDialog.current.close() }}>
            <PrintOptions art={art} soldOriginal={!art.available} sheet onAdded={() => printDialog.current?.close()} />
            <button type="button" className="dialog-x" onClick={() => printDialog.current.close()} aria-label={t('cart.close')}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </dialog>
        )}

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
