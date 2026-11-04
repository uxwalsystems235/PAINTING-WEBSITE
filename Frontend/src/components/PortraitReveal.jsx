import { useState } from 'react'
import { useLang } from '../lib/LangContext'

// The continuous-line sketch of Kalpana (public/img/portrait-line.webp) that reveals her photograph
// (public/img/portrait-photo.webp) on hover or keyboard focus; on touch screens a tap toggles it.
export default function PortraitReveal({ eager = false }) {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  return (
    <div className={'portrait-swap' + (show ? ' show' : '')} role="button" tabIndex={0} aria-pressed={show}
      aria-label={t('about.seePhoto')} onClick={() => setShow((s) => !s)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShow((s) => !s) } }}>
      <img className="line" src="/img/portrait-line.webp" alt="Line drawing of Kalpana Jagtap, seated, hands folded" width={1000} height={1607} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <img className="photo" src="/img/portrait-photo.webp" alt="Kalpana Jagtap, seated at her desk, smiling" width={960} height={1200} loading="lazy" decoding="async" />
      <span className="hint" aria-hidden="true">{t('about.seePhoto')}</span>
    </div>
  )
}
