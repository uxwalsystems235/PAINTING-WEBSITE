import { useRef } from 'react'
import { ArtImage } from './ArtCard'
import { useLang } from '../lib/LangContext'

// The picture area of the living-room photograph is about 0.70 wide to tall (see .room-art in site.css);
// works wider than that fill the frame's width, taller ones fill its height, leaving a white mat around them.
const FRAME_RATIO = 0.7

function Room({ art, label, className = '' }) {
  return (
    <div className={'room ' + className}>
      <img src="/img/room-living.webp" alt="" width={1600} height={1067} decoding="async" />
      <div className="room-art" aria-label={label} role="img">
        <div style={art.ar >= FRAME_RATIO ? { width: '86%', aspectRatio: art.ar } : { height: '86%', aspectRatio: art.ar }}><ArtImage art={art} /></div>
      </div>
    </div>
  )
}

// "In a room" preview with an expand button that opens the same mock-up in a full-screen dialog
// (native <dialog>: Esc closes it and focus stays inside without extra code).
export default function RoomView({ art, title }) {
  const { t } = useLang()
  const dialog = useRef(null)
  const label = `${title} shown framed on a living-room wall`
  return (
    <div className="room-wrap">
      <Room art={art} label={label} />
      <button type="button" className="room-expand" onClick={() => dialog.current.showModal()} aria-label={t('detail.expand')} title={t('detail.expand')}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>
      <dialog ref={dialog} className="room-dialog" aria-label={`${title}, ${t('detail.room')}`}
        onClick={(e) => { if (e.target === dialog.current) dialog.current.close() }}>
        <Room art={art} label={label} className="room-full" />
        <p className="room-caption"><b>{title}</b><span>{art.dimensions}</span><span>{t('detail.scale')}</span></p>
        <button type="button" className="room-close" onClick={() => dialog.current.close()} aria-label={t('cart.close')}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      </dialog>
    </div>
  )
}
