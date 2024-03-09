import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import redent from 'redent'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function CopyButton({ code }: { code: string }) {
  const [{ i, state }, setState] = useState({ state: 'idle', i: 0 })

  useEffect(() => {
    if (state === 'copied') {
      const handle = window.setTimeout(() => {
        setState({ state: 'idle', i: i + 1 })
      }, 1500)
      return () => {
        window.clearTimeout(handle)
      }
    }
  }, [state, i])

  return (
    <div className="relative -mr-2 hidden lg:flex">
      <button
        type="button"
        className={classNames(
          state === 'idle' ? 'text-slate-500 hover:text-slate-400' : '',
          state === 'copied' ? 'text-emerald-400' : ''
        )}
        onClick={() => {
          navigator.clipboard
            .writeText(redent(code.replace(/^[+>-]/gm, ' ')))
            .then(() => {
              setState({ state: 'copied', i: i + 1 })
            })
        }}
      >
        {/* eslint-disable-next-line multiline-ternary */}
        {state !== 'copied' ? (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-8 w-8"
          >
            <path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19" />
            <path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="mr-2 h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

function TabBar({
  children,
  primary,
  secondary = [],
  showTabMarkers = true,
  side,
  translucent = false,
}: {
  primary: { name: string; saved?: boolean }
  secondary?: { name: string; open?: boolean; className?: string }[]
  showTabMarkers?: boolean
  side?: 'left' | 'right'
  translucent?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex text-xs leading-6 text-slate-400">
      <div className="flex flex-none items-center border-b border-t border-b-sky-300 border-t-transparent px-4 py-1 text-sky-300">
        {primary.name}
        {/* eslint-disable-next-line multiline-ternary */}
        {showTabMarkers && primary.saved ? (
          <svg
            viewBox="0 0 4 4"
            className="ml-2.5 h-1 w-1 flex-none overflow-visible text-slate-500"
          >
            <path
              d="M-1 -1L5 5M5 -1L-1 5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="ml-2.5 h-1 w-1 flex-none rounded-full bg-current" />
        )}
      </div>
      <div
        className={classNames(
          'flex flex-auto items-center border border-slate-500/30 bg-slate-700/50',
          side === 'left' ? 'rounded-tl lg:rounded-tr' : 'rounded-tl',
          translucent ? 'dark:bg-slate-950/50' : ''
        )}
      >
        {secondary.map(({ className, name, open = true }) => (
          <div
            key={name}
            className={classNames(
              'border-r border-slate-200/5 px-4 py-1',
              className || '',
              !open ? 'italic' : ''
            )}
          >
            {name}
          </div>
        ))}
        {children && (
          <div className="flex flex-auto items-center justify-end space-x-4 px-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

const frameColors = {
  sky: 'from-sky-500 to-cyan-300',
  indigo: 'from-indigo-500 to-blue-400',
  pink: 'from-pink-500 to-fuchsia-400',
  fuchsia: 'from-fuchsia-500 to-purple-400',
  purple: 'from-violet-500 to-purple-500',
}

export function Frame({
  children,
  className,
  color = 'sky',
  hidden = true,
}: {
  className?: string
  color?: string
  children: any
  hidden?: boolean
}) {
  return (
    <div
      className={classNames(
        className || '',
        // @ts-ignore
        frameColors[color],
        'relative -mx-4 bg-gradient-to-b pl-4 pt-6 sm:mx-0 sm:rounded-2xl sm:pl-12 sm:pt-12'
      )}
    >
      <div
        className={`overflow-y-hidden ${hidden ? 'overflow-x-hidden' : 'overflow-x-auto'} rounded-tl-xl sm:rounded-br-xl`}
      >
        {children}
      </div>
    </div>
  )
}

export function EditorPane({
  children,
  code,
  filename,
  scroll = false,
}: {
  filename: string
  scroll?: boolean
  code?: string
  children?: any
}) {
  return (
    <div className="group bg-slate-800 pt-2 shadow-lg">
      <TabBar
        primary={{
          name: filename,
          saved: !code?.includes('language-diff'),
        }}
        showTabMarkers={true}
      >
        <CopyButton code={redent(code?.replace(/<[^>]+>/g, '') ?? '') || ''} />
      </TabBar>
      <div
        className={classNames(
          'children:my-0 children:bg-transparent children:!shadow-none',
          scroll
            ? 'scrollbar:transparent max-h-96 overflow-y-auto scrollbar:h-4 scrollbar:w-4 scrollbar-track:rounded scrollbar-thumb:rounded-full scrollbar-thumb:border-4 scrollbar-thumb:border-solid scrollbar-thumb:border-slate-800 scrollbar-thumb:bg-slate-500/50 group-hover:scrollbar-thumb:bg-slate-500/60'
            : ''
        )}
        {...(code
          ? {
              dangerouslySetInnerHTML: {
                __html: code,
                // .split('\n')
                // .map((line) => {
                //   if (filename.toLowerCase() === 'terminal') {
                //     line = `<span class="flex"><svg viewBox="0 -9 3 24" aria-hidden="true" class="flex-none overflow-visible text-pink-400 w-auto h-6 mr-3"><path d="M0 0L3 3L0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="flex-auto">${line}</span></span>`
                //   }
                //   return line
                // })
                // .join(filename.toLowerCase() === 'terminal' ? '' : '\n'),
              },
            }
          : { children })}
      />
    </div>
  )
}

export default function Editor({
  children,
  code,
  color,
  filename,
  scroll = false,
  style = 'plain',
}: {
  filename: string
  scroll?: boolean
  style?: string
  color?: string
  children?: any
  code?: string
}) {
  const passthrough = { scroll }

  if (style === 'framed') {
    return (
      <Frame className="mb-8 mt-5 first:mt-0 last:mb-0" color={color}>
        <EditorPane {...passthrough} filename={filename} code={code}>
          {children}
        </EditorPane>
      </Frame>
    )
  }

  return (
    <div className="relative mb-8 mt-5 overflow-hidden rounded-2xl first:mt-0 last:mb-0">
      <EditorPane {...passthrough} filename={filename} code={code}>
        {children}
      </EditorPane>
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl dark:ring-1 dark:ring-inset dark:ring-white/10"
        aria-hidden="true"
      />
    </div>
  )
}
