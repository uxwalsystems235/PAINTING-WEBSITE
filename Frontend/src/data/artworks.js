// Catalogue from the client's v3 design. Backend/data/artworks.json mirrors price/availability — keep in sync.
// price: null  → "On enquiry" (cannot be added to the bag).  available: false → sold (shown as "Private collection").
// ar / hv: frame aspect ratio and height (vh) used in the walk-through gallery.
// `image`, when set, is a real photo; otherwise the painting is drawn by PaintingArt.jsx.
// series / year feed the gallery filters and the artwork page; titleMr is shown when the site is read in Marathi.
export const artworks = [
  {
    slug: 'butterflies', title: 'Butterflies', titleMr: 'फुलपाखरे', type: 'original', medium: 'Acrylic & oil on canvas',
    dimensions: '36 × 48 in', price: 90000, available: true, dispatch: '5–7 days', series: 'Nature & Wings', year: '2024',
    description: 'Butterflies drift across a warm, golden field — a study in lightness and transformation.',
    ar: 0.8, hv: 58, poemSlug: null,
  },
  {
    slug: 'calm-waters', title: 'Calm Waters', titleMr: 'शांत पाणी', type: 'original', medium: 'Placeholder image',
    dimensions: 'Size to be confirmed', price: null, available: true, dispatch: '—', series: 'Water & Light', year: '',
    description: 'Placeholder entry — replace with the real painting details.',
    ar: 0.842, hv: 58, image: '/art/calm-waters.jpg', gold: true, poemSlug: 'nadi',
  },
  {
    slug: 'birds', title: 'Birds', titleMr: 'पक्षी', type: 'original', medium: 'Acrylic & oil on canvas',
    dimensions: '24 × 24 in', price: 50000, available: false, dispatch: '—', series: 'Nature & Wings', year: '2023',
    description: 'A flock crosses a pale sky above dark water. This original has found a home.',
    ar: 0.8, hv: 58, poemSlug: null,
  },
  {
    slug: 'village-lane', title: 'Village Lane', titleMr: 'गावातली वाट', type: 'original', medium: 'Placeholder image',
    dimensions: 'Size to be confirmed', price: null, available: true, dispatch: '—', series: 'Village & Memory', year: '',
    description: 'Placeholder entry — replace with the real painting details.',
    ar: 1.2392, hv: 46, image: '/art/village-lane.jpg', gold: true, poemSlug: null,
  },
  {
    slug: 'spiritual', title: 'Spiritual', titleMr: 'अध्यात्म', type: 'original', medium: 'Oil on canvas',
    dimensions: '18 × 24 in', price: 60000, available: true, dispatch: '5–7 days', series: 'Spiritual Contemplations', year: '2024',
    description: 'Concentric rings of light radiate from a quiet centre.',
    ar: 0.8, hv: 58, poemSlug: null,
  },
  {
    slug: 'lotus-pond', title: 'Lotus Pond', titleMr: 'कमळांचे तळे', type: 'original', medium: 'Oil on canvas',
    dimensions: 'Size to be confirmed', price: null, available: true, dispatch: '—', series: 'Water & Light', year: '',
    description: 'A lotus opens above still green water.',
    ar: 0.8, hv: 58, poemSlug: 'unfinished-colours',
  },
  {
    slug: 'banaras-dawn', title: 'Banaras Dawn', titleMr: 'बनारसची पहाट', type: 'original', medium: 'Acrylic on canvas',
    dimensions: 'Size to be confirmed', price: null, available: true, dispatch: '—', series: 'Village & Memory', year: '',
    description: 'First light over the ghats.',
    ar: 0.8, hv: 58, poemSlug: null,
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
