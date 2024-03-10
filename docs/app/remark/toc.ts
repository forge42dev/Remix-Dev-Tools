import slugify from '@sindresorhus/slugify'
import { toString } from 'mdast-util-to-string'
import { parseExpressionAt } from 'acorn'
import { filter } from 'unist-util-filter'

import { addExport } from './utils'

export default () => {
  return (tree: any) => {
    const contents = []

    for (let nodeIndex = 0; nodeIndex < tree.children.length; nodeIndex++) {
      const node = tree.children[nodeIndex]

      if (node.type === 'heading' && [2, 3, 4].includes(node.depth)) {
        const level = node.depth
        // @ts-ignore
        let title = toString(
          filter(
            node,
            // @ts-ignore
            n => n.type !== 'mdxJsxTextElement' || n.name !== 'small'
          )
        )
        let slug = slugify(title)
        // const allOtherSlugs = contents.flatMap(entry => [
        //   entry.slug,
        //   ...entry.children.map(({ slug }) => slug),
        // ])
        // let slugIndex = 1
        // while (allOtherSlugs.indexOf(slug) > -1) {
        //   slug = `${slugify(title)}-${slugIndex}`
        //   slugIndex++
        // }

        node.type = 'mdxJsxFlowElement'

        const props = {
          level,
          id: slug,
        }

        if (tree.children[nodeIndex + 1]) {
          const { children, position, value, ...element } =
            tree.children[nodeIndex + 1]
          if (element.type === 'heading') {
            // @ts-ignore
            props.nextElement = element
          }
        }

        if (
          node.children[0].type === 'mdxJsxTextElement' &&
          node.children[0].name === 'Heading'
        ) {
          const override = node.children[0].attributes.find(
            (attr: any) => attr.name === 'toc'
          )?.value
          if (override) {
            title = override
            slug = slugify(title)
            props.id = slug
            node.children[0].attributes = node.children[0].attributes.filter(
              (attr: any) => attr.name !== 'toc'
            )
          }

          for (const prop in props) {
            // @ts-ignore
            const value = JSON.stringify(props[prop])
            node.children[0].attributes.push({
              type: 'mdxJsxAttribute',
              name: prop,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value,
                data: {
                  estree: {
                    type: 'Program',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: parseExpressionAt(value, 0, {
                          ecmaVersion: 'latest',
                        }),
                      },
                    ],
                  },
                },
              },
            })
          }

          tree.children[nodeIndex] = node.children[0]
        } else {
          node.name = 'Heading'
          node.attributes = []

          for (const prop in props) {
            // @ts-ignore
            const value = JSON.stringify(props[prop])
            node.attributes.push({
              type: 'mdxJsxAttribute',
              name: prop,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value,
                data: {
                  estree: {
                    type: 'Program',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: parseExpressionAt(value, 0, {
                          ecmaVersion: 'latest',
                        }),
                      },
                    ],
                  },
                },
              },
            })
          }
        }

        if (level === 2) {
          contents.push({ title, slug, children: [] })
        } else if (level === 3) {
          // @ts-ignore
          contents[contents.length - 1].children.push({
            title,
            slug,
            children: [],
          })
        } else {
          // @ts-ignore
          contents[contents.length - 1].children[
            contents[contents.length - 1].children.length - 1
            // @ts-ignore
          ].children.push({
            title,
            slug,
          })
        }
      }
    }

    // @ts-ignore
    addExport(tree, 'tableOfContents', contents)
  }
}
