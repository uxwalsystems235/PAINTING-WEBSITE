import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ArtImage } from '../components/ArtCard'
import { inr } from '../data/artworks'
import { shippingFor } from '../data/shipping'
import { useArtworks, useSettings } from '../lib/ContentContext'
import { useLang } from '../lib/LangContext'

export default function Cart() {
  const { items, remove, setQty, subtotal } = useCart()
  const { shipping: rules, checkoutEnabled, prints } = useSettings()
  const { t } = useLang()
  const { artworks, loading } = useArtworks()
  // A line is stale when the live catalogue no longer offers it (sold, or taken down).
  // Prints of an original stay on sale after the original is sold, so only the original line goes stale.
  const stale = (i) => { const a = artworks.find((x) => x.slug === i.slug); return a ? (i.type === 'original' && !a.available) : !loading }
  // Pre-order status is read from the live catalogue, so a line placed before a painting was finished updates itself.
  const preorderOf = (i) => { const a = artworks.find((x) => x.slug === i.slug); return a && (i.type === 'original' ? a.preorder && a.available : a.printPreorder) ? (a.preorderNote || true) : null }
  const anyPreorder = items.some(preorderOf)

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <span className="eyebrow">Cart</span>
        <h1 className="text-5xl">Your bag is empty</h1>
        <Link to="/art" className="btn fill mt-8">Explore Art</Link>
      </div>
    )
  }

  const shipping = shippingFor(subtotal, rules)
  return (
    <div className="max-w-4xl mx-auto px-5 py-16 md:py-20">
      <span className="eyebrow">Cart</span>
      <h1 className="text-5xl md:text-6xl">Your bag</h1>
      <ul className="mt-10 divide-y divide-sand border-t border-charcoal border-b border-b-sand">
        {items.map((i) => (
          <li key={i.key} className="py-5 flex gap-4">
            <div className="w-24 h-28 shrink-0"><ArtImage art={i} /></div>
            <div className="flex-1">
              <Link to={`/art/${i.slug}`} className="font-serif text-2xl no-underline">{i.title}</Link>
              <p className="text-sm text-mut">{i.type === 'original' ? 'Original painting' : `${t('cart.printOf')} · ${i.variant}`}{i.discount > 0 && <span className="ml-2 text-terracotta">{i.discount}% {t('cart.bulkOff')}</span>}</p>
              {preorderOf(i) && <p className="text-sm mt-1"><span className="badge-pre-inline">{t('work.preorder')}</span>{typeof preorderOf(i) === 'string' ? preorderOf(i) : ''}</p>}
              {stale(i) && <p className="text-sm text-danger mt-1">This artwork is no longer available. Please remove it from your bag.</p>}
              <div className="mt-3 flex items-center gap-4 text-sm">
                {i.type === 'print' && (
                  <label className="flex items-center gap-2">Qty
                    <input type="number" min="1" max={prints.maxQty} value={i.qty} onChange={(e) => setQty(i.key, +e.target.value || 1)} className="input !w-20 !py-1" />
                  </label>
                )}
                <button onClick={() => remove(i.key)} className="underline">Remove</button>
              </div>
            </div>
            <p className="font-serif text-xl text-right">{inr(i.price * i.qty)}{i.qty > 1 && <span className="block text-xs text-mut font-sans">{inr(i.price)} × {i.qty}{i.discount > 0 && <s className="ml-1">{inr(i.listPrice)}</s>}</span>}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-8 ml-auto max-w-xs space-y-2">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? inr(shipping) : 'Free'}</dd></div>
        <div className="flex justify-between text-2xl font-serif border-t border-charcoal pt-3"><dt>Total</dt><dd>{inr(subtotal + shipping)}</dd></div>
      </dl>
      {anyPreorder && <p className="mt-6 text-sm text-mut">{t('cart.preorderNote')}</p>}
      {!checkoutEnabled && <p role="status" className="mt-8 border border-sand p-4 text-sm">Online ordering is paused for the moment, so orders cannot be placed right now. Your bag is saved — please check back soon, or <Link to="/contact" className="underline">contact us</Link>.</p>}
      <div className="mt-8 flex justify-end">
        {checkoutEnabled
          ? <Link to="/checkout" className="btn fill">Checkout as guest</Link>
          : <button className="btn fill" disabled>Checkout as guest</button>}
      </div>
    </div>
  )
}
