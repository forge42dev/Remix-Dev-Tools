import { Link, useRouteLoaderData } from '@remix-run/react'
import { Fragment, useMemo, useRef } from 'react'
import { getMDXComponent, getMDXExport } from 'mdx-bundler/client'
import clsx from 'clsx'
import redent from 'redent'
import type { MouseEvent } from 'react'

import { RemixPWAInfo as Info } from '~/components/plugins/Info'
import { RemixPWAWarn as Warn } from '~/components/plugins/Warn'
import SnippetGroup from '~/components/plugins/Snippet'
import Editor from '~/components/plugins/Editor'
import Heading from '~/components/plugins/Heading'
import { useTableOfContents } from '~/hooks/useTableOfContents'
import { BackgroundGradient } from '../ui/background-gradient'

export function Documentation({
  route = 'routes/docs.$tag.$slug',
}: {
  route?: string
}) {
  const { code, frontmatter, next, prev, tag } = useRouteLoaderData<any>(route)

  const Component = useMemo(
    () =>
      getMDXComponent(code, {
        clsx,
        redent,
        Editor,
        Snippet: SnippetGroup,
        Heading,
        Info,
        Warn,
      }),
    [code]
  )
  const { tableOfContents } = useMemo(() => getMDXExport(code), [code])

  const { currentSection } = useTableOfContents(tableOfContents)

  const documentationRef = useRef<HTMLDivElement>(null)

  function scrollIntoView(
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    id: string
  ) {
    if (e.currentTarget.classList.contains('toc-anchor')) {
      e.preventDefault()

      const scrollToTarget = documentationRef.current?.querySelector(`#${id}`)

      if (!scrollToTarget) return

      const scrollToTargetBounds = scrollToTarget.getBoundingClientRect()
      const offset = scrollToTargetBounds.top + window.scrollY - 106

      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `${window.location.pathname}#${id}`)
    }
  }

  function isActive(section: any) {
    if (section.slug === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }

  const pageHasSubsections = tableOfContents.some(
    (section: any) => section.children.length > 0
  )

  return (
    <div
      className={clsx(
        'mx-auto max-w-3xl pt-10 xl:max-w-none',
        frontmatter.toc ? 'xl:ml-0 xl:mr-[15.5rem] xl:pr-16' : ''
      )}
    >
      <div className="mb-8 flex-auto scroll-smooth">
        <article>
          <header id="header" className="relative z-20">
            <div>
              <h5 className="mb-2 text-sm font-semibold leading-6 text-sky-500 dark:text-sky-400">
                {frontmatter.section}
              </h5>
              <div className="flex items-center">
                <h1 className="inline-block text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200 sm:text-3xl">
                  {frontmatter.title}
                </h1>
              </div>
            </div>
            <p className="mt-2 text-lg text-slate-700 dark:text-slate-400">
              {frontmatter.description}
            </p>
          </header>

          <main
            ref={documentationRef}
            id="article-main"
            className="prose-h2:not-prose prose prose-slate relative z-20 mt-8 scroll-smooth dark:prose-dark prose-h2:mb-2 prose-h2:flex prose-h2:whitespace-pre-wrap prose-h2:text-sm prose-h2:font-semibold prose-h2:leading-6 prose-h2:tracking-normal prose-h2:text-sky-500 prose-code:font-fira prose-code:text-sm prose-code:font-medium prose-h2:dark:text-sky-400 prose-code:dark:text-[#e2e8f0]"
          >
            <Component />
          </main>
        </article>
        <dl className="mt-12 flex border-t border-slate-200 pt-6 dark:border-slate-800">
          {prev && (
            <div>
              <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">
                Previous
              </dt>
              <dd className="mt-1">
                <Link
                  unstable_viewTransition
                  className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  to={`/docs/${tag}/${prev.slug}`}
                  prefetch="intent"
                >
                  <span aria-hidden="true">←</span>&nbsp;
                  {prev.alternateTitle ?? prev.title}
                </Link>
              </dd>
            </div>
          )}
          {next && (
            <div className="ml-auto text-right">
              <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">
                Next
              </dt>
              <dd className="mt-1">
                <Link
                  className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  to={`/docs/${tag}/${next.slug}`}
                  prefetch="intent"
                  unstable_viewTransition
                >
                  {next.alternateTitle ?? next.title}
                  {/* */}&nbsp;<span aria-hidden="true">→</span>
                </Link>
              </dd>
            </div>
          )}
        </dl>
        {/* Hack to get some space at the bottom of the page */}
        <div className="h-12 w-full bg-transparent" />
      </div>
      {/* eslint-disable-next-line multiline-ternary */}
      {frontmatter.toc ? (
        <div className="fixed bottom-0 right-[max(0px,calc(50%-45rem))] top-[3.8125rem] z-20 hidden w-[19.5rem] overflow-y-auto py-10 xl:block">
          <nav aria-labelledby="on-this-page-title" className="mb-20 px-8">
            {/* eslint-disable-next-line multiline-ternary */}
            {tableOfContents.length > 0 ? (
              <h2
                id="on-this-page-title"
                className="mb-4 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100"
              >
                On this page
              </h2>
            ) : (
              <p></p>
            )}

            <ol className="text-sm leading-6 text-slate-700" id="toc-id">
              {tableOfContents.map((section: any) => (
                <Fragment key={section.slug}>
                  <li>
                    <a
                      href={`#${section.slug}`}
                      // onClick={closeNav}
                      className={clsx(
                        'toc-anchor block py-1',
                        pageHasSubsections ? 'font-medium' : '',
                        isActive(section)
                          ? 'font-medium text-sky-500 dark:text-sky-400'
                          : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                      )}
                      onClick={e => {
                        scrollIntoView(e, section.slug)
                      }}
                    >
                      {section.title}
                    </a>
                  </li>
                  {section.children.map((subsection: any) => (
                    <li className="ml-4" key={subsection.slug}>
                      <a
                        href={`#${subsection.slug}`}
                        // onClick={closeNav}
                        className={clsx(
                          'toc-anchor group flex items-start py-1',
                          isActive(subsection)
                            ? 'text-sky-500 dark:text-sky-400'
                            : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                        )}
                        onClick={e => {
                          scrollIntoView(e, subsection.slug)
                        }}
                      >
                        <svg
                          width="3"
                          height="24"
                          viewBox="0 -9 3 24"
                          className="mr-2 overflow-visible text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-500"
                        >
                          <path
                            d="M0 0L3 3L0 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        {subsection.title}
                      </a>
                    </li>
                  ))}
                </Fragment>
              ))}
            </ol>
          </nav>
          <div className="flex flex-col gap-4">
            <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-2 dark:bg-zinc-900 sm:p-10">
              <p className="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl">
                Want to be featured here?
              </p>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                If you want to support this project and get your product or
                service featured on this page, please reach out to us at{' '}
                <a
                  href="mailto:t.zlak97@gmail.com"
                  className="text-sky-500 dark:text-sky-400"
                >
                  our email
                </a>
              </p>
            </BackgroundGradient>
            <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-2 dark:bg-zinc-900 sm:p-10">
              <p className="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl">
                Want to be featured here?
              </p>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                If you want to support this project and get your product or
                service featured on this page, please reach out to us at{' '}
                <a
                  href="mailto:t.zlak97@gmail.com"
                  className="text-sky-500 dark:text-sky-400"
                >
                  our email
                </a>
              </p>
            </BackgroundGradient>
          </div>
        </div>
      ) : null}
    </div>
  )
}
