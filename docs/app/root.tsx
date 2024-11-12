
import { ClientHints, getHints } from './components/ClientHint'
import { useTheme } from './hooks/useTheme'
import { getTheme } from './utils/server/theme.server'
import { getVersions } from './utils/server/doc.server'

import './styles/code.css'
import './styles/documentation.css'
import './styles/fonts.css'
import './styles/tailwind.css'
import { Links, LoaderFunctionArgs, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration } from 'react-router'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const versions = (await getVersions()) ?? []

  return  ({
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
      </body>
    </html>
  )
}
