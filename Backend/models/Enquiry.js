const mongoose = require('mongoose')

const enquirySchema = new mongoose.Schema({
  // general/acquisition/collaboration/donation come from the contact page and the donation panel; custom from the
  // commission form; newsletter from the sign-up box.
  kind: { type: String, enum: ['general', 'custom', 'newsletter', 'acquisition', 'collaboration', 'donation'], required: true },
  name: { type: String, default: '' },
  email: { type: String, required: true },
  style: String,
  size: String,
  budget: String,
  artwork: String,   // acquisition: title of the painting asked about
  amount: String,    // donation: amount given
  reference: String, // donation: bank/UPI transaction reference
  message: { type: String, default: '' },
  handled: { type: Boolean, default: false },
  handledAt: { type: Date, default: null },
}, { timestamps: true })

// One newsletter sign-up per (lower-cased) e-mail, even under concurrent requests.
enquirySchema.index({ email: 1 }, { unique: true, partialFilterExpression: { kind: 'newsletter' } })
enquirySchema.index({ createdAt: -1 })

module.exports = mongoose.model('Enquiry', enquirySchema)
