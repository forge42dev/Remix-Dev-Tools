import { readFileSync } from 'fs'
import { bundleMDX } from 'mdx-bundler'
import { join } from 'path'
import { cwd } from 'process'
import emoji from 'remark-emoji'
import gfm from 'remark-gfm'
import slug from 'rehype-slug'

import type { FrontMatterType } from '~/types/mdx'

import role from '../../rehype/role'
import checkbox from '../../rehype/checkbox'
import toc from '../../remark/toc'
import highlight from '../../remark/highlight'

export async function mdxToHtml(source: string) {
  // inject Heading into the doc just below the frontmatter
  const injectHeading = (source: string) => {
    const frontMatterEnd = source.indexOf('---', 10) + 3
    return `${source.slice(0, frontMatterEnd)}\n\nimport Heading from './heading.tsx'\nimport Editor from './Editor.tsx'${source.slice(
      frontMatterEnd
    )}`
  }

  try {
    const { code, frontmatter } = await bundleMDX<FrontMatterType>({
      source: injectHeading(source),
      files: {
        './info.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Info.tsx')
        ).toString(),
        './warn.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Warn.tsx')
        ).toString(),
        // './tip.tsx': readFileSync(
        //   join(cwd(), 'app', 'components/plugins/Tip.tsx')
        // ).toString(),
        './heading.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Heading.tsx')
        ).toString(),
        './details.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Details.tsx')
        ).toString(),
        './Editor.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Editor.tsx')
        ).toString(),
        './snippet.tsx': readFileSync(
          join(cwd(), 'app', 'components/plugins/Snippet.tsx')
        ).toString(),
      },
      mdxOptions(options) {
        options.rehypePlugins = [...(options.rehypePlugins || []), role, slug]
        options.remarkPlugins = [
          ...(options.remarkPlugins || []),
          checkbox,
          highlight,
          toc,
          gfm,
          emoji,
        ]

        return options
      },
    })

    return {
      code,
      frontmatter: {
        ...frontmatter,
        toc: frontmatter.toc ?? true,
        hidden: frontmatter.hidden ?? false,
        alternateTitle: frontmatter.alternateTitle ?? frontmatter.title,
      },
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
