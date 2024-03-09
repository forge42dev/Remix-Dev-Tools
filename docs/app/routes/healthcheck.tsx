import type { LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log(request.url, 'healthcheck ✅')

    return new Response('OK')
  } catch (error: unknown) {
    console.error(request.url, 'healthcheck ❌', { error })
    return new Response('ERROR', { status: 500 })
  }
}
