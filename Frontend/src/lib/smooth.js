// GSAP scroll setup shared by the public site: ScrollSmoother glides the page, ScrollTrigger pins and scrubs the
// home slideshow. Both are registered once here. Anything that moves the page goes through scrollToY() so it
// works the same with the smoother (content is translated, so scrollIntoView would land in the wrong place) and
// without it (reduced motion: no smoother is created and the browser scrolls natively).
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export { gsap, ScrollTrigger, ScrollSmoother }

export const motionOn = () => typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

// target: a scroll position in px or an element. smooth: glide there, or jump.
export function scrollToY(target, smooth = true) {
  const s = ScrollSmoother.get()
  if (s) { s.scrollTo(target, smooth, 'top top'); return }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' })
  else target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}
