import { Link } from 'react-router-dom'

// Small shared pieces of the public design language: the long arrow, tracked-capital arrow links, page headers
// and ruled section headers. Styles live in index.css (.arrow-link, .page-head, .sec-head, .eyebrow).

export function Arrow({ className = '' }) {
  return (
    <svg className={'arrow ' + className} width="44" height="12" viewBox="0 0 44 12" aria-hidden="true" focusable="false">
      <path d="M0 6h42M36 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

// Router link by default; pass `href` for in-page anchors (e.g. "#gallery").
export function ArrowLink({ to, href, children, className = '', ...rest }) {
  const cls = 'arrow-link ' + className
  if (href) return <a href={href} className={cls} {...rest}>{children}<Arrow /></a>
  return <Link to={to} className={cls} {...rest}>{children}<Arrow /></Link>
}

export function PageHead({ eyebrow, title, lead, children, className = '' }) {
  return (
    <header className={'page-head ' + className}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </header>
  )
}

// Heading with a rule beneath and an optional link on the right ("Upcoming exhibitions — view all ⟶").
export function SectionHead({ title, children, ...rest }) {
  return (
    <div className="sec-head" {...rest}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Editable multi-paragraph text: a blank line starts a new paragraph. Plain text only; nothing is interpreted.
export function Paragraphs({ text, className = '' }) {
  return String(text ?? '').split(/\r?\n\s*\n/).filter((p) => p.trim()).map((p, i) => <p key={i} className={className}>{p}</p>)
}
