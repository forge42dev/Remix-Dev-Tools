import { visit } from 'unist-util-visit'

export default () => {
  return (tree: any) => {
    visit(tree, 'element', element => {
      if (
        element.tagName === 'input' &&
        element.properties.type === 'checkbox'
      ) {
        element.properties.className = 'hidden'
      }
    })
  }
}
