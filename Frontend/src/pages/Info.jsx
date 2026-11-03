import { Link } from 'react-router-dom'
import { Paragraphs } from '../components/ui'
import { useContent } from '../lib/ContentContext'
import { useT } from '../lib/LangContext'
import { usePageMeta } from '../lib/usePageMeta'

// Placeholder policy pages. Replace the copy with the owner's real policies (and have privacy/terms legally reviewed).
function Page({ title, children }) {
  const t = useT()
  usePageMeta(title)
  return (
    <div className="max-w-2xl mx-auto px-5 py-16 md:py-20">
      <span className="eyebrow">{t('info.eyebrow')}</span>
      <h1 className="text-5xl md:text-6xl">{title}</h1>
      <div className="mt-8 pt-8 border-t border-charcoal space-y-5 text-mut leading-relaxed text-lg">{children}</div>
    </div>
  )
}

function Policy({ k }) {
  return <Page title={useContent(`pages.${k}.title`)}><Paragraphs text={useContent(`pages.${k}.body`)} /></Page>
}

// Phrases in an answer that become links: "custom art form" → commission form, "Cause page" → the cause page.
const LINKS = [['custom art form', '/custom-art'], ['Cause page', '/cause']]
function Answer({ text }) {
  for (const [phrase, to] of LINKS) {
    const at = text.indexOf(phrase)
    if (at < 0) continue
    return <>{text.slice(0, at)}<Link to={to} className="underline text-terracotta">{phrase}</Link><Answer text={text.slice(at + phrase.length)} /></>
  }
  return text
}

export const ShippingReturns = () => <Policy k="shipping" />

export const Faqs = () => {
  const items = useContent('pages.faqs.items')
  const note = useContent('pages.faqs.note')
  return (
    <Page title={useContent('pages.faqs.title')}>
      {items.map((f, i) => <p key={i}><strong className="block font-serif text-2xl text-charcoal mb-1">{f.q}</strong><Answer text={f.a || ''} /></p>)}
      {note && <p className="text-sm">{note}</p>}
    </Page>
  )
}

export const Privacy = () => <Policy k="privacy" />

export const Terms = () => <Policy k="terms" />

export const NotFound = () => {
  const t = useT()
  return <Page title={t('notFound.title')}><Link to="/" className="back-link">{t('notFound.home')}</Link></Page>
}
