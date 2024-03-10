import type { ReactNode, JSX } from 'react'

// eslint-disable-next-line react/display-name
export default ({
  children,
  title,
}: {
  title: string
  children: ReactNode | JSX.Element
}) => {
  return (
    <details className="prose prose-slate -mt-0 mb-6 rounded-xl border px-6 py-3 dark:prose-dark open:pb-5 dark:border-slate-800">
      <summary className="cursor-pointer select-none font-medium text-slate-900 dark:text-slate-200">
        {title}
      </summary>
      {children}
    </details>
  )
}
