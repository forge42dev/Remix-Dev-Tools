import type { ReactNode, JSX } from 'react'
import { useState } from 'react'
import { Tab } from '@headlessui/react'

// @ts-ignore
import { Frame, CopyButton } from './Editor.tsx'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * @typedef {React.ReactElement<{ filename?: string }>} CodeBlock
 */

/**
 * Handles styling for a specific ui affordance inside a tab
 *
 * @param {object} props
 * @param {import('clsx').ClassValue} props.className
 */
function TabAdornment({ className }: { className?: any }) {
  return (
    <div
      className={classNames(
        'pointer-events-none absolute inset-0 outline-none ring-0',
        className
      )}
    />
  )
}

/**
 * Represents a styled tab in a snippet group that adjusts its style
 * based on the position of this tab relative to the selected tab(s)
 *
 * Also supports an optional marker icon (close or modified)
 *
 * @param {object} props
 * @param {ReactElement[]} props.children
 * @param {number} props.selectedIndex
 * @param {number} props.myIndex
 * @param {"close" | "modified"} [props.marker]
 */
function TabItem({
  children,
  marker,
  myIndex,
  selectedIndex,
}: {
  children: ReactNode
  selectedIndex: number
  myIndex: number
  marker?: 'close' | 'modified'
}) {
  const isSelected = selectedIndex === myIndex
  const isBeforeSelected = selectedIndex === myIndex + 1
  const isAfterSelected = selectedIndex === myIndex - 1

  // A cap is the edge of a list of tabs that has a special border treatment
  // The edges of a tab may be in one of three states:
  // - null if selected
  // - normal if it looks like a normal tab
  // - capped if there's a solid rounded corner on that edge
  const edges = {
    leading: isSelected ? null : isAfterSelected ? 'capped' : 'normal',
    trailing: isSelected ? null : isBeforeSelected ? 'capped' : 'normal',
  }

  return (
    <Tab
      className={classNames(
        'relative z-10 flex items-center overflow-hidden whitespace-nowrap px-4  py-1 outline-none [&:not(:focus-visible)]:focus:outline-none',
        isSelected ? 'text-sky-300' : 'text-slate-400'
      )}
    >
      <span className="z-10">{children}</span>

      {marker === 'close' && (
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
      )}

      {marker === 'modified' && (
        <div className="ml-2.5 h-1 w-1 flex-none rounded-full bg-current" />
      )}

      {/* Inactive tabs with optional edge caps */}
      {!isSelected && (
        <TabAdornment
          className={classNames(
            'border-y border-slate-500/30 bg-slate-700/50',
            edges.leading === 'capped' ? 'rounded-tl border-l' : '',
            edges.trailing === 'capped' ? 'rounded-tr border-r' : ''
          )}
        />
      )}

      {/* Divider between inactive tabs */}
      {edges.trailing === 'normal' && (
        <TabAdornment className="inset-y-px z-20 border-r border-slate-200/5" />
      )}

      {/* Active tab highlight bar */}
      {isSelected && <TabAdornment className="border-b border-b-sky-300" />}
    </Tab>
  )
}

const snippetGroupWrappers = {
  plain({ children }: { children: ReactNode }) {
    return (
      <div className="not-prose rounded-xl bg-slate-800 shadow-md">
        {children}
      </div>
    )
  },
  framed({ children, ...props }: { children: ReactNode }) {
    return (
      <Frame {...props}>
        <div className="not-prose rounded-tl-xl bg-slate-800 shadow-md">
          {children}
        </div>
      </Frame>
    )
  },
}

/**
 * Group multiple code blocks into a tabbed UI
 *
 * @param {object} props
 * @param {CodeBlock[]} props.children
 */
export default function SnippetGroup({
  actions,
  children,
  style = 'plain',
  ...props
}: any) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // @ts-ignore
  const Wrapper = snippetGroupWrappers[style]

  return (
    <Wrapper hidden={true} {...props}>
      <Tab.Group as="div" onChange={setSelectedIndex}>
        <div className="relative flex overflow-x-auto overflow-y-hidden">
          <Tab.List className="flex rounded-tl-xl pt-2 text-xs leading-6 text-slate-400">
            {children?.map((child: any, tabIndex: number) => (
              <TabItem
                key={child.props.filename}
                myIndex={tabIndex}
                selectedIndex={selectedIndex}
              >
                {child.props.filename}
              </TabItem>
            ))}
          </Tab.List>
          <div className="flex flex-auto overflow-hidden rounded-tr-xl pt-2">
            <div
              className={classNames(
                'flex flex-auto justify-end border-y border-slate-500/30 bg-slate-700/50 pr-4',
                selectedIndex === children.length - 1
                  ? 'rounded-tl border-l'
                  : ''
              )}
            />
          </div>
          {/* {actions ? ( */}
          <div className="absolute right-4 top-2 z-20 flex h-8">
            <CopyButton
              code={
                children[selectedIndex].props.code?.replace(/<[^>]+>/g, '') ||
                ''
              }
            />
            {/* {actions({ selectedIndex })} */}
          </div>
          {/* ) : null} */}
        </div>
        <Tab.Panels className="flex overflow-auto">
          {children.map((child: JSX.Element) => (
            <Tab.Panel
              key={child.props.filename}
              className="ligatures-none min-w-full flex-none p-5 text-sm leading-6 text-slate-50"
              {...(child.props.code
                ? { dangerouslySetInnerHTML: { __html: child.props.code } }
                : { children: child.props.children })}
            />
          ))}
        </Tab.Panels>
      </Tab.Group>
    </Wrapper>
  )
}
