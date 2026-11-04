import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArtImage } from './ArtCard'
import { bulkPercent, inr, printSizesOf, printsPreorder, unitPrice } from '../data/artworks'
import { useArtTitle, useSettings } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import { useCart } from '../context/CartContext'

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k])

// Size, quantity and bulk pricing for a print: of an original (art.printSizes) or a stand-alone print (variants).
// The unit price follows the site-wide bulk tiers exactly as the server recomputes it at checkout.
// `sheet` adds a matted preview of the painting beside the options (used in the "Order a print" dialog).
export default function PrintOptions({ art, soldOriginal = false, onAdded, sheet = false }) {
  const { t } = useLang()
  const title = useArtTitle()
  const { prints } = useSettings()
  const { add, items } = useCart()
  const sizes = printSizesOf(art)
  const [pick, setPick] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  if (!sizes.length) return null

  const size = sizes[Math.min(pick, sizes.length - 1)]
  const n = Math.min(Math.max(qty, 1), prints.maxQty)
  const pct = bulkPercent(prints.bulk, n)
  const unit = unitPrice(size.price, n, prints.bulk)
  const inCart = items.some((i) => i.slug === art.slug && i.type === 'print' && i.variant === size.label)
  const ofOriginal = art.type === 'original'
  // Tiers that are not reached yet tell the visitor how many more copies unlock them.
  const nextTier = prints.bulk.find((b) => n < b.minQty)
  const pre = printsPreorder(art)

  const addLine = () => {
    add({ slug: art.slug, title: art.title, type: 'print', kind: 'print', variant: size.label, price: size.price, listPrice: size.price }, n)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    if (onAdded) onAdded()
  }

  return (
    <section id="print" className={'print-opts' + (sheet ? ' sheet' : '')} aria-labelledby="print-h">
      {sheet && (
        <div className="print-preview" aria-hidden="true">
          <span className="print-frame"><span className="print-mat" style={{ aspectRatio: art.ar }}><ArtImage art={art} sizes="(min-width: 900px) 30vw, 80vw" /></span></span>
          <span className="print-preview-cap"><b>{title(art)}</b>{art.printNote && <span>{art.printNote}</span>}</span>
        </div>
      )}
      <div className="print-body">
        <span className="eyebrow">{ofOriginal ? t('detail.printOf') : t('detail.print')}</span>
        <h2 id="print-h" className="print-title">{t('detail.printOrder')}</h2>
        {soldOriginal && <p className="print-note">{t('detail.printSold')}</p>}
        {pre && <p className="preorder-info"><span className="badge-pre-inline">{t('work.preorder')}</span>{t('detail.preorderPrintInfo')}{art.preorderNote && <b> {art.preorderNote}</b>}</p>}
        {!sheet && art.printNote && <p className="print-note">{art.printNote}</p>}

        <div className="print-field">
          <span className="print-label">{t('detail.size')}</span>
          <div className="size-chips" role="radiogroup" aria-label={t('detail.size')}>
            {sizes.map((v, i) => (
              <button key={v.label} type="button" role="radio" aria-checked={i === pick} className="size-chip" onClick={() => setPick(i)}>
                <b>{v.label}</b><span>{inr(v.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="print-field">
          <span className="print-label">{t('detail.qty')}</span>
          <div className="qty-row">
            <span className="qty">
              <button type="button" aria-label="−" onClick={() => setQty(Math.max(1, n - 1))} disabled={n <= 1}>−</button>
              <input type="number" inputMode="numeric" min="1" max={prints.maxQty} value={n} onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)} aria-label={t('detail.qty')} />
              <button type="button" aria-label="+" onClick={() => setQty(Math.min(prints.maxQty, n + 1))} disabled={n >= prints.maxQty}>+</button>
            </span>
            {prints.bulk.length > 0 && (
              <ul className="tiers" aria-label={t('detail.bulk')}>
                {prints.bulk.map((b) => (
                  <li key={b.minQty} className={n >= b.minQty ? 'on' : ''}>
                    <b>{fill(t('detail.bulkTier'), { n: b.minQty })}</b><span>{fill(t('detail.bulkOff'), { p: b.percentOff })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {nextTier && <p className="tier-hint">{fill(t('detail.tierHint'), { n: nextTier.minQty - n, p: nextTier.percentOff })}</p>}
        </div>

        <div className="print-summary">
          <div className="print-total">
            <span className="print-label">{t('detail.total')}</span>
            <span className="sum">{inr(unit * n)}</span>
            <small>{n} × {inr(unit)}{pct > 0 && <> · <s>{inr(size.price)}</s> · −{pct}%</>}</small>
          </div>
          <button type="button" className="btn fill print-add" onClick={addLine}>
            {added ? t('detail.printAdded') : inCart ? `${t('work.inCart')} · ${pre ? t('detail.preorderPrint') : t('detail.addPrint')}` : pre ? t('detail.preorderPrint') : t('detail.addPrint')}
          </button>
        </div>
        <Link className="arrow-link print-bulk-link" to={`/contact?subject=bulk&artwork=${art.slug}`}>{fill(t('detail.bulkMore'), { n: prints.maxQty })} {t('detail.bulkEnquire')}</Link>
      </div>
    </section>
  )
}
