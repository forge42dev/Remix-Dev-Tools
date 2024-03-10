/**
 * Find the nearst scrollable ancestor (or self if scrollable)
 *
 * Code adapted and simplified from the smoothscroll polyfill
 * @param {Element} el
 */
export function nearestScrollableContainer(el: Element) {
  /**
   * indicates if an element can be scrolled
   * @param {Node} el
   */
  function isScrollable(el: Element) {
    const style = window.getComputedStyle(el)
    const overflowX = style.overflowX
    const overflowY = style.overflowY
    const canScrollY = el.clientHeight < el.scrollHeight
    const canScrollX = el.clientWidth < el.scrollWidth

    const isScrollableY =
      canScrollY && (overflowY === 'auto' || overflowY === 'scroll')
    const isScrollableX =
      canScrollX && (overflowX === 'auto' || overflowX === 'scroll')

    return isScrollableY || isScrollableX
  }

  while (el !== document.body && isScrollable(el) === false) {
    // @ts-ignore
    el = el.parentNode || el.host
  }

  return el
}
