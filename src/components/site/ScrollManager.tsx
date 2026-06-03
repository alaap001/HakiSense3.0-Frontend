import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Global scroll behavior for the SPA. On every navigation:
 *  - if the URL carries a hash (e.g. /#how), scroll that element into view —
 *    this is what makes the LandingNav / SiteFooter section links work from
 *    any page (they route home, then jump to the section);
 *  - otherwise reset to the top, like a normal multi-page site.
 * Mounted once in App, above <Routes>.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Defer one frame so the target route has rendered before we scroll.
      const id = hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
      })
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, hash])

  return null
}
