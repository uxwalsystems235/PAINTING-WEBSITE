// Bulk pricing for prints. Tiers are { minQty, percentOff }; the highest tier the quantity reaches applies.
// The same rules run in the browser (Frontend/src/data/artworks.js) so the bag shows what the server will charge.
const cleanBulk = (list) => list
  .filter((t) => t && Number.isInteger(t.minQty) && t.minQty >= 2 && Number.isInteger(t.percentOff) && t.percentOff >= 1 && t.percentOff <= 90)
  .map((t) => ({ minQty: t.minQty, percentOff: t.percentOff }))
  .sort((a, b) => a.minQty - b.minQty)

const bulkPercent = (bulk, qty) => bulk.reduce((pct, t) => (qty >= t.minQty ? t.percentOff : pct), 0)

// Unit price after the bulk discount, in whole rupees.
const unitPrice = (listPrice, qty, bulk) => Math.round(listPrice * (100 - bulkPercent(bulk, qty)) / 100)

module.exports = { cleanBulk, bulkPercent, unitPrice }
