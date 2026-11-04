import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { bulkPercent, unitPrice } from '../data/artworks'
import { useSettings } from '../lib/ContentContext'

const CartContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

export function CartProvider({ children }) {
  const [raw, setItems] = useState(() => load('kj-cart'))
  const { prints } = useSettings()
  // Stored lines carry the list price; the unit price of a print line follows the bulk tiers for its quantity,
  // the same rule the server applies at checkout (prints.maxQty caps the quantity of one line).
  const items = useMemo(() => raw.map((i) => {
    if (i.type !== 'print') return { ...i, listPrice: i.price, discount: 0 }
    const listPrice = i.listPrice ?? i.price
    const qty = Math.min(Math.max(i.qty, 1), prints.maxQty)
    return { ...i, qty, listPrice, discount: bulkPercent(prints.bulk, qty), price: unitPrice(listPrice, qty, prints.bulk) }
  }), [raw, prints])
  const [saved, setSaved] = useState(() => load('kj-saved'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  useEffect(() => save('kj-cart', raw), [raw])
  useEffect(() => save('kj-saved', saved), [saved])

  const value = useMemo(() => ({
    items,
    // Originals are one-of-a-kind: adding twice keeps quantity at 1. Prints add `qty` copies (default 1) to the line
    // for that size; a print of an original has type 'print' and the original's slug, so both can sit in the bag.
    add(item, qty = 1) {
      const n = Math.min(Math.max(parseInt(qty, 10) || 1, 1), prints.maxQty)
      setItems((prev) => {
        const key = item.slug + '|' + (item.variant || '')
        const found = prev.find((i) => i.key === key)
        if (found) {
          return item.type === 'original' ? prev : prev.map((i) => i.key === key ? { ...i, qty: Math.min(i.qty + n, prints.maxQty) } : i)
        }
        return [...prev, { ...item, listPrice: item.listPrice ?? item.price, key, qty: item.type === 'original' ? 1 : n }]
      })
      setDrawerOpen(true)
    },
    remove: (key) => setItems((p) => p.filter((i) => i.key !== key)),
    setQty: (key, qty) => setItems((p) => p.map((i) => i.key === key ? { ...i, qty: Math.min(Math.max(1, qty), prints.maxQty) } : i)),
    clear: () => setItems([]),
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
    saved,
    toggleSaved: (slug) => setSaved((p) => p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }), [items, saved, drawerOpen, prints])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
