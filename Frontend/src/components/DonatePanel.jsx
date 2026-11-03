import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { post } from '../api'
import { useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { Paragraphs } from './ui'

// Bank details, UPI QR code and a receipt-request form. Used inside the site-wide dialog (Layout.jsx) and inline
// on the Cause page. All wording and account details come from the admin "Donations" content group; the bank
// block stays hidden until all four bank fields are filled in, and the UPI block until a UPI ID is set.

function CopyButton({ value }) {
  const t = useT()
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard unavailable */ }
  }
  return <button type="button" className="copy" onClick={copy} aria-label={`${t('donate.copy')}: ${value}`}>{done ? t('donate.copied') : t('donate.copy')}</button>
}

function ReceiptForm() {
  const t = useT()
  const thanks = useContent('donate.thanks')
  const [form, setForm] = useState({ name: '', email: '', amount: '', reference: '', message: '' })
  const [state, setState] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setState('sending'); setError('')
    try {
      await post('/enquiries', { kind: 'donation', ...form })
      setState('sent')
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? t('contact.offline') : err.message)
      setState('idle')
    }
  }

  if (state === 'sent') return <p className="font-serif text-lg text-terracotta" role="status">{thanks}</p>

  const f = (name, label, props = {}) => (
    <div>
      <label htmlFor={'dn-' + name}>{label}</label>
      <input id={'dn-' + name} name={name} value={form[name]} onChange={change} className="input mt-1" {...props} />
    </div>
  )
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {f('name', t('contact.name'), { required: true, autoComplete: 'name' })}
        {f('email', t('contact.email'), { type: 'email', required: true, autoComplete: 'email' })}
        {f('amount', t('donate.amount'), { inputMode: 'numeric' })}
        {f('reference', t('donate.reference'))}
      </div>
      <div>
        <label htmlFor="dn-message">{t('donate.note')}</label>
        <textarea id="dn-message" name="message" rows="2" value={form.message} onChange={change} className="input mt-1" />
      </div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <button className="btn fill" disabled={state === 'sending'}>{state === 'sending' ? t('contact.sending') : t('donate.request')}</button>
    </form>
  )
}

export default function DonatePanel({ heading = 'h2' }) {
  const t = useT()
  const c = {
    title: useContent('donate.title'), intro: useContent('donate.intro'),
    accountName: useContent('donate.accountName'), bank: useContent('donate.bank'),
    accountNumber: useContent('donate.accountNumber'), ifsc: useContent('donate.ifsc'),
    upi: useContent('donate.upi'), payeeName: useContent('donate.payeeName'),
    taxNote: useContent('donate.taxNote'), receiptTitle: useContent('donate.receiptTitle'), pending: useContent('donate.pending'),
  }
  const bankOk = [c.accountName, c.bank, c.accountNumber, c.ifsc].every((v) => typeof v === 'string' && v.trim())
  const upi = (c.upi || '').trim()
  const upiLink = upi ? `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent((c.payeeName || 'Kalpana Jagtap').trim())}&cu=INR` : ''
  const [qr, setQr] = useState('')
  const H = heading

  // The QR encoder is loaded only when a UPI ID exists, and only on the pages that show the panel.
  useEffect(() => {
    if (!upiLink) return // nothing to encode; the UPI block (and with it the image) is not rendered
    let live = true
    import('qrcode')
      .then((m) => m.toDataURL(upiLink, { margin: 1, width: 320, errorCorrectionLevel: 'M', color: { dark: '#1B1917', light: '#FFFFFF' } }))
      .then((url) => { if (live) setQr(url) })
      .catch(() => { if (live) setQr('') })
    return () => { live = false }
  }, [upiLink])

  return (
    <div className="donate">
      <H className="donate-title">{c.title}</H>
      <p className="donate-intro">{c.intro}</p>

      {!bankOk && !upi && <div className="donate-pending"><Paragraphs text={c.pending} /> <Link to="/contact?subject=donation" className="underline">{t('nav.contact')}</Link></div>}

      <div className="donate-grid">
        {bankOk && (
          <section className="donate-box" aria-labelledby="dn-bank">
            <h3 id="dn-bank" className="eyebrow">{t('donate.bankTitle')}</h3>
            <dl>
              <div><dt>{t('donate.accountName')}</dt><dd>{c.accountName}</dd></div>
              <div><dt>{t('donate.bank')}</dt><dd>{c.bank}</dd></div>
              <div><dt>{t('donate.accountNumber')}</dt><dd><span className="mono">{c.accountNumber}</span><CopyButton value={c.accountNumber} /></dd></div>
              <div><dt>{t('donate.ifsc')}</dt><dd><span className="mono">{c.ifsc}</span><CopyButton value={c.ifsc} /></dd></div>
            </dl>
          </section>
        )}
        {upi && (
          <section className="donate-box donate-upi" aria-labelledby="dn-upi">
            <h3 id="dn-upi" className="eyebrow">{t('donate.upiTitle')}</h3>
            {qr && <img src={qr} alt={t('donate.qrAlt')} width={160} height={160} className="qr" />}
            <p className="text-sm text-mut">{t('donate.upiScan')}</p>
            <p className="mono flex items-center gap-2 flex-wrap"><span className="text-xs uppercase tracking-[0.18em] text-mut">{t('donate.upiId')}</span>{upi}<CopyButton value={upi} /></p>
            <a className="btn" href={upiLink}>{t('donate.upiOpen')}</a>
          </section>
        )}
      </div>

      {(bankOk || upi) && c.taxNote && <p className="donate-tax">{c.taxNote}</p>}

      <section className="donate-receipt" aria-labelledby="dn-receipt">
        <h3 id="dn-receipt" className="font-serif text-2xl mb-4">{c.receiptTitle}</h3>
        <ReceiptForm />
      </section>
    </div>
  )
}
