// Catalogue carried over from Kalpana's earlier website (ten works; prices are the listed donation values).
// Backend/data/artworks.json mirrors this list; the admin panel can change any of it without touching code.
// price: null  → "On enquiry" (cannot be added to the bag).  available: false → sold (shown as "Private collection").
// `image` is the photograph in public/art (butterflies, birds and spiritual are the artist's own photographs; the
// others are stock placeholders until her photographs are uploaded). Works without an image are drawn by PaintingArt.jsx.
// ar = width ÷ height of the image; series / year feed the gallery filters; titleMr shows in Marathi mode.
// printSizes / printNote: prints offered of an original (placeholder sizes and prices until the real ones are set).
export const artworks = [
  {
    slug: "butterflies", title: "Butterflies", titleMr: "फुलपाखरे", type: 'original', medium: "Acrylic & oil on canvas",
    dimensions: "36 × 48 in", price: 90000, available: true, dispatch: "5–7 days", series: "Nature & Wings", year: "2024",
    description: "A vibrant artistic depiction of colorful butterflies in graceful flight, celebrating nature’s delicate transformation, beauty, and freedom.",
    ar: 0.929, image: "/art/butterflies.jpg", imageAlt: "Butterflies, acrylic & oil on canvas", poemSlug: "niragas-swapna",
    printSizes: [{ label: "A3 (29.7 × 42 cm)", price: 4500 }, { label: "A2 (42 × 59.4 cm)", price: 7500 }], printNote: "Gicl\u00e9e print on archival cotton paper, signed by the artist.",
  },
  {
    slug: "birds", title: "Birds", titleMr: "पक्षी", type: 'original', medium: "Acrylic & oil on canvas",
    dimensions: "24 × 24 in", price: 50000, available: false, dispatch: "—", series: "Flora & Avian Symphony", year: "2024",
    description: "A peaceful fine art study of birds amidst blossoming branches, capturing avian grace, gentle morning light, and tranquil harmony.",
    ar: 1.396, image: "/art/birds.jpg", imageAlt: "Birds, acrylic & oil on canvas", poemSlug: null,
  },
  {
    slug: "spiritual", title: "Spiritual", titleMr: "अध्यात्म", type: 'original', medium: "Oil on canvas",
    dimensions: "18 × 24 in", price: 60000, available: true, dispatch: "5–7 days", series: "Spiritual Contemplations", year: "2024",
    description: "An introspective spiritual composition radiating divine tranquility, sacred contemplation, and luminous inner peace.",
    ar: 0.716, image: "/art/spiritual.jpg", imageAlt: "Spiritual, oil on canvas", poemSlug: "kardya-prakashatil-kujbuj",
  },
  {
    slug: "silence-of-the-valley", title: "Silence of the Valley", titleMr: "दऱ्यांची शांतता", type: 'original', medium: "Oil on canvas",
    dimensions: "36 × 48 in", price: 85000, available: true, dispatch: "5–7 days", series: "Western Ghats Meditations", year: "2023",
    description: "An expansive contemplation of mist, morning light, and mountainous tranquility. Painted with layered oil glazes to capture the quiet strength of the Western Ghats.",
    ar: 0.703, image: "/art/silence-of-the-valley.jpg", imageAlt: "Silence of the Valley, oil on canvas", poemSlug: "sahyadrichi-saad",
    printSizes: [{ label: "A3 (29.7 × 42 cm)", price: 4500 }, { label: "A2 (42 × 59.4 cm)", price: 7500 }, { label: "A1 (59.4 × 84.1 cm)", price: 12000 }], printNote: "Gicl\u00e9e print on archival cotton paper, signed by the artist.",
  },
  {
    slug: "monsoon-memory", title: "Monsoon Memory", titleMr: "पावसाची आठवण", type: 'original', medium: "Watercolour on paper",
    dimensions: "20 × 30 in", price: 38000, available: true, dispatch: "5–7 days", series: "Seasons of Maharashtra", year: "2024",
    description: "Fluid watercolor washes reflecting the earthy fragrance and dramatic cloud formations of the first Konkan rains.",
    ar: 1.239, image: "/art/monsoon-memory.jpg", imageAlt: "Monsoon Memory, watercolour on paper", poemSlug: "shwasancha-canvas",
    printSizes: [{ label: "A4 (21 × 29.7 cm)", price: 2800 }, { label: "A3 (29.7 × 42 cm)", price: 4500 }], printNote: "Gicl\u00e9e print on archival cotton paper, signed by the artist.",
    printPreorder: true, preorderNote: "Print run ships from 20 December 2026 (placeholder date)",
  },
  {
    slug: "architectural-echo", title: "Architectural Echo", titleMr: "वास्तूचा प्रतिध्वनी", type: 'original', medium: "Oil on canvas",
    preorder: true, preorderNote: "Finishing on the easel; ships from January 2027 (placeholder date)",
    dimensions: "40 × 60 in", price: 110000, available: true, dispatch: "5–7 days", series: "Heritage & Stone", year: "2023",
    description: "Heritage stone arches, deep ochres, and historic corridors reflecting centuries of quiet resilience and public heritage.",
    ar: 0.842, image: "/art/architectural-echo.jpg", imageAlt: "Architectural Echo, oil on canvas", poemSlug: "prakashache-tukde",
  },
  {
    slug: "morning-light", title: "Morning Light", titleMr: "प्रभात प्रकाश", type: 'original', medium: "Oil on canvas",
    dimensions: "24 × 36 in", price: 65000, available: false, dispatch: "—", series: "Light & Shadow", year: "2023",
    description: "Golden hour filtering through dense canopy, illuminating the forest floor with warm geometric light rays.",
    ar: 1.333, image: "/art/morning-light.jpg", imageAlt: "Morning Light, oil on canvas", poemSlug: null,
  },
  {
    slug: "ephemeral-form", title: "Ephemeral Form", titleMr: "क्षणभंगुर रूप", type: 'original', medium: "Charcoal on paper",
    dimensions: "24 × 24 in", price: 45000, available: false, dispatch: "—", series: "Monochrome Introspections", year: "2023",
    description: "A delicate study of shadows, fleeting silhouettes, and raw graphite textures exploring the impermanence of human thought.",
    ar: 1.0, image: null, imageAlt: "Ephemeral Form, charcoal on paper", poemSlug: null,
  },
  {
    slug: "study-in-movement", title: "Study in Movement", titleMr: "हालचालींचा अभ्यास", type: 'original', medium: "Charcoal on archival paper",
    dimensions: "18 × 24 in", price: 35000, available: true, dispatch: "5–7 days", series: "Monochrome Introspections", year: "2024",
    description: "Expressive gestural strokes capturing grace, wind, and rhythmic momentum in high contrast charcoal.",
    ar: 0.75, image: null, imageAlt: "Study in Movement, charcoal on archival paper", poemSlug: null,
  },
  {
    slug: "urban-dawn", title: "Urban Dawn", titleMr: "शहराची सकाळ", type: 'original', medium: "Watercolour on cold press",
    dimensions: "12 × 16 in", price: 28000, available: true, dispatch: "5–7 days", series: "Urban Vignettes", year: "2024",
    description: "Soft pastel washes documenting the awakening skyline, where modern governance and historical roots converge.",
    ar: 1.518, image: "/art/urban-dawn.jpg", imageAlt: "Urban Dawn, watercolour on cold press", poemSlug: "gerutil-padsad",
  },
]
export const inr = (n) => '₹' + n.toLocaleString('en-IN')
// Prints are priced per variant (size); originals carry a single price.
export const isPrint = (a) => a.type === 'print' && Array.isArray(a.variants) && a.variants.length > 0
const fromPrice = (a) => Math.min(...a.variants.map((v) => v.price))
// `t` (optional) translates the fixed words; without it the English labels are returned.
const EN = { 'work.privateCollection': 'Private collection', 'work.from': 'From', 'work.onEnquiry': 'On enquiry' }
export const priceLabel = (a, t = (k) => EN[k]) => {
  if (!a.available) return t('work.privateCollection')
  if (isPrint(a)) return t('work.from') + ' ' + inr(fromPrice(a))
  return a.price == null ? t('work.onEnquiry') : inr(a.price)
}
export const canBuy = (a) => a.available && (isPrint(a) || a.price != null)
// Pre-order: the original (preorder) or its prints (printPreorder) are paid for now and dispatched later.
export const isPreorder = (a) => a.available && !!a.preorder && a.price != null
export const printsPreorder = (a) => !!a.printPreorder && hasPrints(a)
// Print sizes on offer: a stand-alone print's variants, or the print sizes of an original (art.printSizes).
export const printSizesOf = (a) => (isPrint(a) ? a.variants : Array.isArray(a.printSizes) ? a.printSizes.filter((v) => v && Number.isInteger(v.price)) : [])
export const hasPrints = (a) => printSizesOf(a).length > 0
export const printFrom = (a) => Math.min(...printSizesOf(a).map((v) => v.price))
// Bulk pricing for prints, mirrored from Backend/lib/prints.js so the bag shows what the server will charge.
// Tiers are { minQty, percentOff }; the highest tier the quantity reaches applies.
export const bulkPercent = (bulk, qty) => (Array.isArray(bulk) ? bulk : []).reduce((pct, t) => (qty >= t.minQty ? t.percentOff : pct), 0)
export const unitPrice = (listPrice, qty, bulk) => Math.round(listPrice * (100 - bulkPercent(bulk, qty)) / 100)
// Medium family, for the gallery filter: oil | acrylic | watercolor | charcoal | other.
export const mediumCategory = (a) => {
  const m = (a.medium || '').toLowerCase()
  if (m.includes('charcoal')) return 'charcoal'
  if (m.includes('watercolo')) return 'watercolor'
  if (m.includes('acrylic')) return 'acrylic'
  if (m.includes('oil')) return 'oil'
  return 'other'
}
