import { useState } from 'react'
import { api } from '../adminApi.js'
import { useConfirm, useToast } from '../ctx.js'
import { useDirty, useFetch, usePageTitle } from '../hooks.js'
import { Alert, Check, ErrorBox, Field, Loading, PageHeader } from '../ui.jsx'
import { deepEqual, fp, isInt } from '../util.js'

function SettingsForm({ initial, onSaved }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [f, setF] = useState(initial)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const dirty = !deepEqual(f, initial)
  useDirty(dirty)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    const er = {}
    if (!isInt(f.flat) || Number(f.flat) < 0 || Number(f.flat) > 100000) er.flat = 'Whole rupees from 0 to 1,00,000.'
    if (!isInt(f.freeAbove) || Number(f.freeAbove) < 0 || Number(f.freeAbove) > 10000000) er.freeAbove = 'Whole rupees from 0 to 1,00,00,000.'
    if (!isInt(f.holdHours) || Number(f.holdHours) < 0 || Number(f.holdHours) > 8760) er.holdHours = 'Whole hours from 0 to 8,760 (0 means never).'
    if (!isInt(f.maxQty) || Number(f.maxQty) < 1 || Number(f.maxQty) > 1000) er.maxQty = 'A whole number from 1 to 1,000.'
    f.bulk.forEach((b, i) => {
      if (!isInt(b.minQty) || Number(b.minQty) < 2 || Number(b.minQty) > 1000) er[`b${i}q`] = 'From 2 to 1,000.'
      if (!isInt(b.percentOff) || Number(b.percentOff) < 1 || Number(b.percentOff) > 90) er[`b${i}p`] = 'From 1 to 90.'
    })
    if (new Set(f.bulk.map((b) => Number(b.minQty))).size !== f.bulk.length) er.bulk = 'Each tier needs a different minimum quantity.'
    setErrors(er); setServerError('')
    if (Object.keys(er).length) return
    if (!f.checkoutEnabled && initial.checkoutEnabled) {
      const ok = await confirm({ title: 'Turn checkout off?', message: 'Nobody will be able to place an order on the website until you turn it back on. Existing orders are not affected.', confirmLabel: 'Turn checkout off', danger: true })
      if (!ok) return
    }
    setBusy(true)
    try {
      const r = await api.put('/settings', {
        shipping: { flat: Number(f.flat), freeAbove: Number(f.freeAbove) }, checkoutEnabled: f.checkoutEnabled, holdHours: Number(f.holdHours),
        prints: { maxQty: Number(f.maxQty), bulk: f.bulk.map((b) => ({ minQty: Number(b.minQty), percentOff: Number(b.percentOff) })) },
      })
      toast.success('Settings saved.')
      onSaved(r)
    } catch (err) { setServerError(err.message); setBusy(false) }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl space-y-6">
      <Alert>{serverError}</Alert>
      <fieldset className="space-y-4">
        <legend className="font-serif text-2xl mb-2">Shipping</legend>
        <Field label="Flat shipping charge (₹)" id="flat" error={errors.flat}>
          <input {...fp('flat', errors.flat)} className="input max-w-[12rem]" inputMode="numeric" value={f.flat} onChange={(e) => setF({ ...f, flat: e.target.value })} />
        </Field>
        <Field label="Free shipping above (₹)" id="freeAbove" error={errors.freeAbove} help="Orders with a subtotal above this amount ship free.">
          <input {...fp('freeAbove', errors.freeAbove, true)} className="input max-w-[12rem]" inputMode="numeric" value={f.freeAbove} onChange={(e) => setF({ ...f, freeAbove: e.target.value })} />
        </Field>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="font-serif text-2xl mb-2">Checkout</legend>
        <Check id="checkout" label="Checkout is enabled" checked={f.checkoutEnabled} onChange={(v) => setF({ ...f, checkoutEnabled: v })} />
        <Field label="Cancel unpaid orders after (hours)" id="holdHours" error={errors.holdHours} help="An order still awaiting payment after this many hours is cancelled automatically and its original paintings go back on sale. Enter 0 to never cancel automatically.">
          <input {...fp('holdHours', errors.holdHours, true)} className="input max-w-[12rem]" inputMode="numeric" value={f.holdHours} onChange={(e) => setF({ ...f, holdHours: e.target.value })} />
        </Field>
        {!f.checkoutEnabled && (
          <p role="alert" className="border border-danger text-danger p-3 text-sm">Warning: with checkout off, visitors cannot place orders. Use this only when you are away or the shop is paused.</p>
        )}
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="font-serif text-2xl mb-2">Prints and bulk orders</legend>
        <Field label="Most copies of one print per order line" id="maxQty" error={errors.maxQty} help="Larger quantities are directed to the contact form as a bulk enquiry.">
          <input {...fp('maxQty', errors.maxQty)} className="input max-w-[12rem]" inputMode="numeric" value={f.maxQty} onChange={(e) => setF({ ...f, maxQty: e.target.value })} />
        </Field>
        <div role="group" aria-labelledby="bulk-h" className="border border-sand p-3 space-y-3">
          <h3 id="bulk-h" className="text-lg">Bulk discounts</h3>
          <p className="text-xs text-mut">Percent off the single-copy price when a customer orders at least this many copies of one print size. The highest tier reached applies. Leave empty for no discounts.</p>
          {errors.bulk && <p role="alert" className="text-xs text-danger">{errors.bulk}</p>}
          {f.bulk.map((b, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <Field label="From (copies)" id={`b${i}q`} error={errors[`b${i}q`]}>
                <input {...fp(`b${i}q`, errors[`b${i}q`])} className="input" inputMode="numeric" value={b.minQty} onChange={(e) => setF({ ...f, bulk: f.bulk.map((x, j) => (j === i ? { ...x, minQty: e.target.value } : x)) })} />
              </Field>
              <Field label="Discount (%)" id={`b${i}p`} error={errors[`b${i}p`]}>
                <input {...fp(`b${i}p`, errors[`b${i}p`])} className="input" inputMode="numeric" value={b.percentOff} onChange={(e) => setF({ ...f, bulk: f.bulk.map((x, j) => (j === i ? { ...x, percentOff: e.target.value } : x)) })} />
              </Field>
              <button type="button" className="btn danger mt-6" onClick={() => setF({ ...f, bulk: f.bulk.filter((_, j) => j !== i) })} aria-label={`Remove tier ${i + 1}`}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn" disabled={f.bulk.length >= 10} onClick={() => setF({ ...f, bulk: [...f.bulk, { minQty: '', percentOff: '' }] })}>Add tier</button>
        </div>
      </fieldset>
      <div className="flex items-center gap-3 border-t border-sand pt-4">
        <button type="submit" className="btn fill" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save settings'}</button>
        {dirty && <span className="text-xs text-mut">Unsaved changes</span>}
      </div>
    </form>
  )
}

export default function Settings() {
  usePageTitle('Settings')
  const { data, error, loading, reload, setData } = useFetch(() => api.get('/settings'), [])
  const initial = data && {
    flat: String(data.shipping.flat), freeAbove: String(data.shipping.freeAbove), checkoutEnabled: !!data.checkoutEnabled, holdHours: String(data.holdHours ?? 0),
    maxQty: String(data.prints?.maxQty ?? 50), bulk: (data.prints?.bulk || []).map((b) => ({ minQty: String(b.minQty), percentOff: String(b.percentOff) })),
  }
  return (
    <div>
      <PageHeader title="Settings" />
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : <SettingsForm key={JSON.stringify(initial)} initial={initial} onSaved={(r) => setData(r)} />}
    </div>
  )
}
