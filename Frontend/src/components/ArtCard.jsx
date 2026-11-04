import { Link } from 'react-router-dom'
import { hasPrints, inr, isPreorder, isPrint, printFrom, printsPreorder, priceLabel } from '../data/artworks'
import { useArtTitle, useArtwork } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'
import PaintingArt from './PaintingArt'

// Accepts a catalogue entry or a cart line (looked up by slug so both render the same picture).
export function ArtImage({ art, className = '', eager = false, sizes }) {
  const full = useArtwork(art.slug) || art
  return <PaintingArt art={full} className={className} eager={eager} sizes={sizes} />
}

export function Badge({ art }) {
  const { t } = useLang()
  const pre = isPreorder(art)
  const label = !art.available ? t('work.privateCollection') : pre ? t('work.preorder') : isPrint(art) ? t('work.print') : art.price == null ? t('work.onEnquiry') : t('work.original')
  return <span className={'badge' + (pre ? ' badge-pre' : '')}>{label}</span>
}

// Card image is roughly a quarter of a 76rem container at the widest, so these sizes cover the masonry columns.
const CARD_SIZES = '(min-width: 1200px) 290px, (min-width: 900px) 30vw, (min-width: 560px) 45vw, 88vw'

// Each work hangs at its true proportions inside the masonry (see .masonry / .work in index.css).
export default function ArtCard({ art, eager = false }) {
  const { t } = useLang()
  const title = useArtTitle()
  const meta = [art.medium, art.dimensions].filter(Boolean).join(' · ')
  const sub = [art.series, art.year].filter(Boolean).join(', ')
  return (
    <div className="work" data-reveal>
      <Link to={`/art/${art.slug}`} className="cv" aria-label={`${title(art)} — ${t('work.view')}`}>
        <span className="cv-art" style={{ aspectRatio: art.ar }}><ArtImage art={art} eager={eager} sizes={CARD_SIZES} /></span>
        <Badge art={art} />
      </Link>
      <div className="lab">
        <Link to={`/art/${art.slug}`} className="no-underline"><b>{title(art)}</b></Link>
        <span>{meta}</span>
        {sub && <span className="series">{sub}</span>}
        <em>{priceLabel(art, t)}</em>
        {!isPrint(art) && hasPrints(art) && <span className="print-tag">{t('work.printsFrom')} {inr(printFrom(art))}{printsPreorder(art) && <> · {t('work.preorder')}</>}</span>}
      </div>
    </div>
  )
}
