import { useState } from 'react'
import { post } from '../api'
import { useT } from '../lib/LangContext'

// Saves the address through the enquiries endpoint (kind: newsletter) so sign-ups are not silently lost.
// Styles: .news-card / .news-form in home.css.
export default function Newsletter() {
  const t = useT()
  const [state, setState] = useState('idle') // idle | sending | done
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    setState('sending'); setError('')
    try {
      await post('/enquiries', { kind: 'newsletter', email })
      setState('done')
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? t('contact.offline') : err.message)
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div className="news-done" role="status">
        <span className="news-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <p className="news-done-title">{t('home.subscribed')}</p>
        <p className="news-done-note">{t('home.subscribedNote')}</p>
      </div>
    )
  }
  return (
    <form onSubmit={submit} className="news-form" noValidate>
      <label htmlFor="news-email">{t('contact.email')}</label>
      <div className="news-field">
        <input id="news-email" type="email" name="email" required placeholder={t('home.yourEmail')} autoComplete="email" inputMode="email" />
        <button type="submit" className="news-go" disabled={state === 'sending'} aria-label={state === 'sending' ? t('contact.sending') : t('home.subscribe')} title={t('home.subscribe')}>
          {state === 'sending'
            ? <span className="news-dots" aria-hidden="true"><i /><i /><i /></span>
            : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>}
        </button>
      </div>
      <p className="news-privacy">{t('home.newsPrivacy')}</p>
      {error && <p role="alert" className="news-error">{error}</p>}
    </form>
  )
}
