import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { json } from '@remix-run/node'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { ClientHints, getHints } from './components/ClientHint'
import { useTheme } from './hooks/useTheme'
import { getTheme } from './utils/server/theme.server'
import { getVersions } from './utils/server/doc.server'

import './styles/code.css'
import './styles/documentation.css'
import './styles/fonts.css'
import './styles/tailwind.css'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const versions = (await getVersions()) ?? []

  return json({
    requestInfo: {
      hints: getHints(request),
      userPrefs: { theme: getTheme(request) },
    },
    versions,
  })
}
export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      property: 'og:site_name',
      content: 'Remix Development Tools',
    },
    {
      property: 'og:title',
      content: 'Remix Development Tools Documentation',
    },
    {
      property: 'og:image',
      content: '/rdt.png',
    },
  ]
}

export default function Document() {
  const theme = useTheme()

  return (
    <html lang="en" className={`h-full overflow-x-hidden ${theme} antialiased`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ClientHints />
        <Meta />
        <Links />
      </head>
      <body className="bg-background-color">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
