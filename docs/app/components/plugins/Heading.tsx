import type { MouseEvent } from 'react'
import { useEffect } from 'react'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Useful for preventing AlgoliaSearch from indexing a heading
export default function Heading({
  children,
  className = '',
  hidden = false,
  id,
  ignore = false,
  level,
  nextElement,
  style = {},
  ...props
}: any) {
  const Component = `h${level}` as any

  useEffect(() => {
    if (typeof window === 'undefined') return

    // @ts-expect-error
    if (!window.registerHeading) return

    // @ts-expect-error
    window.registerHeading(id)

    return () => {
      // @ts-expect-error
      window.unregisterHeading(id)
    }
  }, [id])

  const scrollIntoView = (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    id: string
  ) => {
    if (e.currentTarget.parentNode?.nodeName.toUpperCase().includes('H')) {
      e.preventDefault()

      const scrollToTargetBounds = e.currentTarget.getBoundingClientRect()
      const offset = scrollToTargetBounds.top + window.scrollY - 106

      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `${window.location.pathname}#${id}`)
    }
  }

  return (
    <Component
      className={classNames(
        'not-prose flex whitespace-pre-wrap',
        className,
        level === 2 &&
          nextElement?.type === 'heading' &&
          nextElement?.depth === 3
          ? 'mb-2 text-sm font-semibold leading-6 tracking-normal text-sky-500 dark:text-sky-400'
          : ''
      )}
      id={id}
      style={{ ...(hidden ? { marginBottom: 0 } : {}), ...style }}
      // data-docsearch-ignore={ignore ? '' : undefined} // uncomment
      {...props}
    >
      <a
        className={classNames(
          'group relative border-none',
          hidden ? 'sr-only' : 'lg:-ml-2 lg:pl-2'
        )}
        href={`#${id}`}
        onClick={e => {
          scrollIntoView(e, id)
        }}
      >
        <div className="absolute -ml-8 hidden items-center border-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 lg:flex">
          &#8203;
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 shadow-sm ring-1 ring-slate-900/5 hover:text-slate-700 hover:shadow hover:ring-slate-900/10 dark:bg-slate-950 dark:text-slate-300 dark:shadow-none dark:ring-0">
            <svg width="12" height="12" fill="none" aria-hidden="true">
              <path
                d="M3.75 1v10M8.25 1v10M1 3.75h10M1 8.25h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        {children}
      </a>
    </Component>
  )
}
