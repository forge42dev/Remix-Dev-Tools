import { useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'

export const clientHints = {
  theme: {
    cookieName: 'CH-prefers-color-scheme',
    getValueCode:
      "window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'",
    fallback: 'light',
    transform(value: string) {
      return value === 'dark' ? 'dark' : 'light'
    },
  },
  timeZone: {
    cookieName: 'CH-time-zone',
    getValueCode: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
    fallback: 'UTC',
  },
  // Add more Client Hints here.
  // ...
}

type ClientHintsNames = keyof typeof clientHints

/**
 * Returns the value of a Client Hint from the provided Cookie string.
 */
function getClientHintCookieValue(
  cookieString: string,
  name: ClientHintsNames
) {
  const hint = clientHints[name]

  if (!hint) {
    throw new Error(`Unknown Client Hint: ${name}.`)
  }

  const value = cookieString
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(hint.cookieName + '='))
    ?.split('=')[1]

  return value ? decodeURIComponent(value) : null
}
/**
 * Returns an object with the Client Hints and their values.
 */
export function getHints(request?: Request) {
  const cookieString =
    typeof document !== 'undefined'
      ? document.cookie
      : typeof request !== 'undefined'
        ? request.headers.get('Cookie') ?? ''
        : ''

  return Object.entries(clientHints).reduce(
    (acc, [name, hint]) => {
      const hintName = name as ClientHintsNames

      if ('transform' in hint) {
        acc[hintName] = hint.transform(
          getClientHintCookieValue(cookieString, hintName) ?? hint.fallback
        )
      } else {
        // @ts-expect-error - No error on here, requires Epic Stack PR fix.
        acc[hintName] =
          getClientHintCookieValue(cookieString, hintName) ?? hint.fallback
      }

      return acc
    },
    {} as {
      [name in ClientHintsNames]: (typeof clientHints)[name] extends {
        transform: (value: any) => infer ReturnValue
      }
        ? ReturnValue
        : (typeof clientHints)[name]['fallback']
    }
  )
}

export function ClientHints() {
  const { revalidate } = useRevalidator()

  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleThemeChange() {
      document.cookie = `${clientHints.theme.cookieName}=${
        themeQuery.matches ? 'dark' : 'light'
      }; Max-Age=31536000; Path=/`
      revalidate()
    }

    themeQuery.addEventListener('change', handleThemeChange)

    return () => {
      themeQuery.removeEventListener('change', handleThemeChange)
    }
  }, [revalidate])

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
const cookies = document.cookie.split(';').map(c => c.trim()).reduce((acc, cur) => {
const [key, value] = cur.split('=');
acc[key] = value;
return acc;
}, {});
let hasCookieChanged = false;

const hints = [
${Object.values(clientHints)
  .map(hint => {
    const cookieName = JSON.stringify(hint.cookieName)
    return `{ name: ${cookieName}, actual: String(${hint.getValueCode}), cookie: cookies[${cookieName}] }`
  })
  .join(',\n')}
];

for (const hint of hints) {
if (decodeURIComponent(hint.cookie) !== hint.actual) {
hasCookieChanged = true;
document.cookie = encodeURIComponent(hint.name) + '=' + encodeURIComponent(hint.actual) + '; Max-Age=31536000; path=/';
}
}

// On Cookie change, reload the page, unless the browser doesn't support Cookies. 
if (hasCookieChanged && navigator.cookieEnabled) {
  window.location.reload();
}
`,
      }}
    />
  )
}
