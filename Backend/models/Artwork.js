const mongoose = require('mongoose')

const artworkSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['original', 'print'], required: true },
  medium: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  // null price = "on enquiry": the painting is shown but cannot be ordered online.
  price: { type: Number, default: null },
  available: { type: Boolean, default: true },
  dispatch: { type: String, default: '' },
  description: { type: String, default: '' },
  series: { type: String, default: '' },  // gallery filter, e.g. "Nature & Wings"
  year: { type: String, default: '' },    // shown on the artwork page
  titleMr: { type: String, default: '' }, // Marathi title, shown when the visitor reads the site in Marathi
  ar: { type: Number, default: 1 },
  image: { type: String, default: null },
  imageAlt: { type: String, default: '' },
  poemSlug: { type: String, default: null },
  variants: { type: [new mongoose.Schema({ label: String, price: Number }, { _id: false })], default: [] },
  // Prints of an original: sizes with their single-copy prices. Empty = no prints offered. Bulk discounts are
  // site-wide (settings.prints.bulk) and applied per order line by quantity.
  printSizes: { type: [new mongoose.Schema({ label: String, price: Number }, { _id: false })], default: [] },
  printNote: { type: String, default: '' }, // e.g. "Giclée on archival cotton paper"
  // Pre-orders: the original (still being painted) and/or its prints (run not yet printed) can be bought now and
  // are dispatched later; preorderNote tells the buyer when, e.g. "Ships from 20 December 2026".
  preorder: { type: Boolean, default: false },
  printPreorder: { type: Boolean, default: false },
  preorderNote: { type: String, default: '' },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Artwork', artworkSchema)
