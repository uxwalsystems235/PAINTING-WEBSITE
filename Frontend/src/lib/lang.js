// Language preference without React, so main.jsx can set <html lang> before the first paint (no flash of the
// wrong language) and LangContext can read the same value.
export const LANGS = ['en', 'mr']
const KEY = 'kj-lang'

export function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (LANGS.includes(saved)) return saved
  } catch { /* storage unavailable */ }
  // First visit: follow the browser if it is set to Marathi, otherwise English.
  return (navigator.languages || [navigator.language || '']).some((l) => /^mr\b/i.test(l)) ? 'mr' : 'en'
}

export function rememberLang(lang) {
  try { localStorage.setItem(KEY, lang) } catch { /* storage unavailable */ }
}
