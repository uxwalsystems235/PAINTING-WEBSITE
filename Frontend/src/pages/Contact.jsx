import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { post } from '../api'
import { useArtwork, useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

// Subjects on the contact page. Each one is an enquiry `kind` the admin panel sorts into its own tab.
const SUBJECTS = ['general', 'acquisition', 'bulk', 'collaboration', 'donation']

// One form component serves the contact page (with a subject) and the custom-art enquiry.
function EnquiryForm({ kind: fixedKind, initialSubject = 'general', artworkTitle = '', similarTo = '' }) {
  const t = useT()
  const custom = fixedKind === 'custom'
  const [subject, setSubject] = useState(SUBJECTS.includes(initialSubject) ? initialSubject : 'general')
  const [form, setForm] = useState({
    name: '', email: '', style: similarTo ? `Similar to “${similarTo}”` : '', size: '', budget: '', artwork: artworkTitle, message: '',
  })
  const [state, setState] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setState('sending'); setError('')
    try {
      await post('/enquiries', { kind: custom ? 'custom' : subject, ...form })
      setState('sent')
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? t('contact.offline') : err.message)
      setState('idle')
    }
  }

  if (state === 'sent') return <p className="mt-8 text-terracotta text-lg font-serif" role="status">{t('contact.thanks')}</p>

  const f = (name, label, props = {}) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={form[name]} onChange={change} className="input mt-1" {...props} />
    </div>
  )
  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {!custom && (
        <div>
          <label htmlFor="subject">{t('contact.subject')}</label>
          <select id="subject" name="subject" className="input mt-1" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{t('contact.subj.' + s)}</option>)}
          </select>
          {subject === 'donation' && <p className="mt-2 text-sm text-mut">{t('contact.donationHint')} <Link to="/cause#donate" className="underline">{t('contact.donationLink')}</Link>.</p>}
          {subject === 'bulk' && <p className="mt-2 text-sm text-mut">{t('contact.bulkHint')}</p>}
        </div>
      )}
      {f('name', t('contact.name'), { required: true, autoComplete: 'name' })}
      {f('email', t('contact.email'), { type: 'email', required: true, autoComplete: 'email' })}
      {!custom && (subject === 'acquisition' || subject === 'bulk') && f('artwork', t('contact.artwork'))}
      {custom && <>
        {f('style', t('contact.style'))}
        {f('size', t('contact.size'))}
        {f('budget', t('contact.budget'))}
      </>}
      <div>
        <label htmlFor="message">{custom ? t('contact.idea') : t('contact.message')}</label>
        <textarea id="message" name="message" rows="5" required value={form.message} onChange={change} className="input mt-1" />
      </div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <button className="btn fill" disabled={state === 'sending'}>{state === 'sending' ? t('contact.sending') : t('contact.send')}</button>
    </form>
  )
}

export function Contact() {
  const t = useT()
  const intro = useContent('contact.intro')
  const [params] = useSearchParams()
  // Arrived from an artwork page ("Enquire"): the subject and the painting are filled in already.
  const art = useArtwork(params.get('artwork') || '')
  usePageMeta(t('contact.title'), intro)
  return (
    <div className="max-w-xl mx-auto px-5 py-16 md:py-20">
      <span className="eyebrow">{t('contact.eyebrow')}</span>
      <h1 className="text-5xl md:text-6xl">{t('contact.title')}</h1>
      <p className="mt-4 text-mut text-lg font-serif">{intro}</p>
      <EnquiryForm key={params.toString()} initialSubject={params.get('subject') || 'general'} artworkTitle={art ? `${art.title}${art.dimensions ? ` (${art.dimensions})` : ''}` : ''} />
      <p className="mt-10 text-sm text-mut">{t('contact.commissionHint')} <Link to="/custom-art" className="underline">{t('contact.commissionLink')}</Link>.</p>
    </div>
  )
}

export function CustomArt() {
  const t = useT()
  const intro = useContent('pages.customArt.intro')
  const [params] = useSearchParams()
  usePageMeta(t('contact.custom.title'), intro)
  return (
    <div className="max-w-xl mx-auto px-5 py-16 md:py-20">
      <span className="eyebrow">{t('contact.custom.eyebrow')}</span>
      <h1 className="text-5xl md:text-6xl">{t('contact.custom.title')}</h1>
      <p className="mt-4 text-mut text-lg font-serif">{intro}</p>
      <EnquiryForm key={params.toString()} kind="custom" similarTo={params.get('ref') || ''} />
    </div>
  )
}
