import { serialize, parse } from 'cookie'

const cookieName = 'en_theme'
export type Theme = 'light' | 'dark'

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get('cookie')
  const parsed = cookieHeader ? parse(cookieHeader)[cookieName] : 'light'
  if (parsed === 'light' || parsed === 'dark') return parsed
  return null
}

export function setTheme(theme: Theme | 'system') {
  if (theme === 'system') {
    return serialize(cookieName, '', { path: '/', maxAge: -1 })
  } else {
    return serialize(cookieName, theme, {
      path: '/',
      maxAge: 31_536_000,
    })
  }
}
