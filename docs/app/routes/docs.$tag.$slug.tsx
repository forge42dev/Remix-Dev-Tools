import { type LoaderFunctionArgs, json } from '@remix-run/node'

import { Documentation } from '~/components/layout/Documentation'
import {
  getPostContent,
  getPreviousAndNextRoutes,
} from '~/utils/server/doc.server'
import { mdxToHtml } from '~/utils/server/mdx.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tag = params.tag ?? 'main'
  const slug = params.slug as string

  const postContent = (await getPostContent(tag, slug)) ?? '' // handle null cases later
  const { code, frontmatter } = await mdxToHtml(postContent)
  const [prev, next] = await getPreviousAndNextRoutes(tag, slug)

  return json({
    frontmatter,
    code,
    next,
    prev,
    tag,
  })
}

export default function DocRoute() {
  return <Documentation />
}
