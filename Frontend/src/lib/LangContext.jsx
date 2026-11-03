import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translate } from '../i18n'
import { initialLang, rememberLang } from './lang'

// Which language the visitor reads the site in. `t(key)` gives fixed interface text (i18n.js); editable content
// picks its ".mr" variant through useContent (ContentContext.jsx). <html lang> follows so fonts and screen readers
// switch with it.
const Ctx = createContext({ lang: 'en', setLang: () => {}, toggle: () => {}, t: (k) => translate(k, 'en') })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    rememberLang(lang)
  }, [lang])

  const value = useMemo(() => ({
    lang,
    setLang,
    toggle: () => setLang((l) => (l === 'mr' ? 'en' : 'mr')),
    t: (key) => translate(key, lang),
  }), [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(Ctx)
// eslint-disable-next-line react-refresh/only-export-components
export const useT = () => useContext(Ctx).t
