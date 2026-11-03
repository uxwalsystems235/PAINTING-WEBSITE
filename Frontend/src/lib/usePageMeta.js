import { useEffect } from 'react'

const SITE = 'Kalpana Jagtap'
const DEFAULT_DESC = 'Kalpana Jagtap: public servant, painter and poet. Original paintings, poetry in English and Marathi, and a cause: all artwork proceeds support children’s care and education in rural Maharashtra.'

// Per-page <title> and meta description (search results, shared links). Pass nothing to restore the site defaults.
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} – Where Art Meets Purpose`
    const desc = description || DEFAULT_DESC
    for (const sel of ['meta[name="description"]', 'meta[property="og:description"]']) {
      const el = document.querySelector(sel)
      if (el) el.setAttribute('content', desc)
    }
    const og = document.querySelector('meta[property="og:title"]')
    if (og) og.setAttribute('content', document.title)
  }, [title, description])
}
