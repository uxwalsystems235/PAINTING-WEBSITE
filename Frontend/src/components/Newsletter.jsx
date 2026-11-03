import { useState } from 'react'
import { post } from '../api'
import { useT } from '../lib/LangContext'

// Saves the address through the enquiries endpoint (kind: newsletter) so sign-ups are not silently lost.
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

  if (state === 'done') return <p role="status">{t('home.subscribed')}</p>
  return (
    <div>
      <form onSubmit={submit}>
        <input type="email" name="email" required placeholder={t('home.yourEmail')} aria-label={t('contact.email')} autoComplete="email" />
        <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? t('contact.sending') : t('home.subscribe')}</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
    </div>
  )
}
