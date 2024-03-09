import { useCallback, useEffect, useState } from 'react'

function getTop(id: string) {
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect().top + window.scrollY : 0
}

export function useTableOfContents(tableOfContents: any) {
  const [currentSection, setCurrentSection] = useState(tableOfContents[0]?.slug)
  const [headings, setHeadings] = useState<{ id: string; top: number }[]>([])

  const registerHeading = useCallback((id: string) => {
    setHeadings(headings => [
      ...headings.filter(h => id !== h.id),
      { id, top: getTop(id) },
    ])
  }, [])

  const unregisterHeading = useCallback((id: string) => {
    setHeadings(headings => headings.filter(h => id !== h.id))
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0 || headings.length === 0) return

    function onScroll() {
      const style = window.getComputedStyle(document.documentElement)
      let scrollMt = parseFloat(
        style.getPropertyValue('--scroll-mt').match(/[\d.]+/)?.[0] ?? '0'
      )
      const fontSize = parseFloat(style.fontSize.match(/[\d.]+/)?.[0] ?? '16')
      scrollMt = scrollMt * fontSize

      const sortedHeadings = headings.concat([]).sort((a, b) => a.top - b.top)
      const top = window.pageYOffset + scrollMt + 106
      let current = sortedHeadings[0].id

      for (let i = 0; i < sortedHeadings.length; i++) {
        if (top >= sortedHeadings[i].top) {
          current = sortedHeadings[i].id
        }
      }

      setCurrentSection(current)
    }

    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    })

    onScroll()

    const resizeObserver = new window.ResizeObserver(() => {
      for (const heading of headings) {
        heading.top = getTop(heading.id)
      }
    })

    resizeObserver.observe(document.body)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll, {
        capture: true,
      })
    }
  }, [headings, tableOfContents])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-error
      window.registerHeading = registerHeading
      // @ts-expect-error
      window.unregisterHeading = unregisterHeading
    }
  }, [registerHeading, unregisterHeading])

  return { currentSection }
}
