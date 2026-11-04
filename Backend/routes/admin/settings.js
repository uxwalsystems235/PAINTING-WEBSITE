const express = require('express')
const { getSettings, saveSettings } = require('../../lib/settings')
const { audit } = require('../../lib/audit')
const { bad } = require('../../lib/httpError')
const { body, int, bool, isObj } = require('../../lib/validate')
const { cleanBulk } = require('../../lib/prints')

const router = express.Router()

router.get('/', async (req, res) => res.json(await getSettings()))

router.put('/', async (req, res) => {
  const b = body(req)
  const next = await getSettings()
  if (b.shipping !== undefined) {
    if (!isObj(b.shipping)) throw bad('shipping must be an object.')
    if (b.shipping.flat !== undefined) next.shipping.flat = int(b.shipping.flat, 'shipping.flat', 0, 100000)
    if (b.shipping.freeAbove !== undefined) next.shipping.freeAbove = int(b.shipping.freeAbove, 'shipping.freeAbove', 0, 10000000)
  }
  if (b.checkoutEnabled !== undefined) next.checkoutEnabled = bool(b.checkoutEnabled, 'checkoutEnabled')
  if (b.holdHours !== undefined) next.holdHours = int(b.holdHours, 'holdHours', 0, 8760)
  if (b.prints !== undefined) {
    if (!isObj(b.prints)) throw bad('prints must be an object.')
    if (b.prints.maxQty !== undefined) next.prints.maxQty = int(b.prints.maxQty, 'prints.maxQty', 1, 1000)
    if (b.prints.bulk !== undefined) {
      if (!Array.isArray(b.prints.bulk) || b.prints.bulk.length > 10) throw bad('prints.bulk must be a list of at most 10 tiers.')
      const tiers = b.prints.bulk.map((t, i) => {
        if (!isObj(t)) throw bad(`prints.bulk[${i}] must be an object.`)
        return { minQty: int(t.minQty, `prints.bulk[${i}].minQty`, 2, 1000), percentOff: int(t.percentOff, `prints.bulk[${i}].percentOff`, 1, 90) }
      })
      if (new Set(tiers.map((t) => t.minQty)).size !== tiers.length) throw bad('Each bulk tier needs a different minimum quantity.')
      next.prints.bulk = cleanBulk(tiers)
    }
  }
  await saveSettings(next)
  await audit(req.admin, 'update', 'settings', 'site',
    `Settings: shipping ${next.shipping.flat} (free above ${next.shipping.freeAbove}), checkout ${next.checkoutEnabled ? 'on' : 'off'}, hold ${next.holdHours}h, prints max ${next.prints.maxQty} with ${next.prints.bulk.length} bulk tiers`)
  res.json(next)
})

module.exports = router
