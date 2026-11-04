// The watercolour flow behind every internal page (see .page-flow in site.css): four transparent washes from kp/
// laid down the page. Decorative only. The home page has its own washes per section.
const WASHES = ['ochre', 'blush', 'blue', 'blush']

export default function WashFlow() {
  return (
    <div className="page-flow" aria-hidden="true">
      {WASHES.map((w, i) => <span key={i} className={`flow flow-${i + 1} wash-${w}`} />)}
    </div>
  )
}
