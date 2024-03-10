import { resolve } from 'path'
import { readFile, readdir, writeFile } from 'fs/promises'
import { existsSync, statSync, readdirSync, readFileSync } from 'fs'
import matter from 'gray-matter'
import { normalizePath } from 'vite'
import { request } from '@octokit/request'
import 'dotenv/config'

console.log('Generating metadata...')

const __dirname =
  process.env.NODE_ENV === 'development'
    ? resolve()
    : process.env.GITHUB_WORKSPACE ?? ''

/**
 * The reserved name for the index file of every doc section
 *
 * Defaults to - `index.md`
 */
const INDEX_FILE = 'index.md'

const postDirectory = resolve(__dirname, 'posts')
const versions = await readFile(
  resolve(postDirectory, 'versions.json'),
  'utf-8'
)
const tags = JSON.parse(versions).map((v: any) => v.tag) as Array<string>
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

tags.forEach(async tag => {
  const currentDirectory = resolve(postDirectory, tag)

  const metadataObject = {
    paths: {} as Record<string, string>,
    sections: {} as any,
    meta: {},
    hasIndex: false,
  }

  if (existsSync(resolve(currentDirectory, '_index.mdx'))) {
    metadataObject.hasIndex = true
  }

  const mainDirectoryFiles = await readdir(currentDirectory)

  let sortedSections: Array<any> = []
  for (const file of mainDirectoryFiles) {
    const fileStat = statSync(resolve(currentDirectory, file))

    if (fileStat.isFile()) {
      // is `_index.mdx` or `metadata.json`
      continue
    }

    const fileDirectory = resolve(currentDirectory, file)

    const indexFile = await readFile(resolve(fileDirectory, INDEX_FILE), {
      encoding: 'utf-8',
    })

    const indexMatter = matter(indexFile)
    metadataObject.sections[indexMatter.data.title] = {
      order: indexMatter.data.order,
      slug: file,
    }

    sortedSections = Object.entries(metadataObject.sections)
      // @ts-ignore
      .sort((a, b) => a[1].order - b[1].order)
  }

  const _f = sortedSections
    .map(section => {
      return resolve(currentDirectory, section[1].slug)
    })
    .map(filePath => {
      return readdirSync(filePath)
        .filter(file => file !== INDEX_FILE)
        .map(file => resolve(filePath, file))
    })
    .flat()
    .map(file => {
      const fileContent = readFileSync(`${file}`, 'utf-8')
      const f = matter(fileContent)
      f.data.slug = file.replace('.mdx', '')
      f.data.section = normalizePath(file.replace('.mdx', ''))
        .split('/')
        .slice(-2, -1)[0]
      return f
    })
    .filter(f => f.data.hidden !== true)
    .sort((a, b) => {
      if (a.data.order === undefined || b.data.order === undefined) {
        return a.data.title - b.data.title
      }
      return a.data.order - b.data.order
    })
    .reduce((acc, curr) => {
      const slug = normalizePath(curr.data.slug).split('/').pop() as string
      acc[slug] = {
        title: curr.data.title,
        alternateTitle: curr.data.alternateTitle,
        description: curr.data.description,
        section: sortedSections.find(s => s[1].slug === curr.data.section)[0],
        slug,
      }

      metadataObject.paths[slug] = `${curr.data.section}/${slug}`

      Object.keys(acc[slug]).forEach(key => {
        if (acc[slug][key] === undefined) {
          delete acc[slug][key]
        }
      })

      return acc
    }, {} as any)

  const _fKeys = Object.keys(_f)
  _fKeys.forEach((key, index) => {
    if (index > 0 && _f[key].section !== _f[_fKeys[index - 1]].section) {
      _f[key].spacer = true
    }

    if (index === 0) {
      _f[key].spacer = true
    }
  })

  metadataObject.sections = sortedSections.map(s => s[0])
  metadataObject.meta = _f

  if (process.env.NODE_ENV === 'development') {
    await writeFile(
      resolve(currentDirectory, 'metadata.json'),
      JSON.stringify(metadataObject, null, 2),
      'utf-8'
    )
  } else {
    const { data } = await request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner: process.env.GITHUB_OWNER ?? '',
        repo: process.env.GITHUB_REPO ?? '',
        path: `posts/${tag}/metadata.json`,
      }
    )

    // @ts-ignore
    const content = Buffer.from(data.content, 'base64').toString('utf-8')

    if (content === JSON.stringify(metadataObject, null, 2)) {
      console.log(`No changes observed in ${tag} version. Skipping...`)
      await delay(1_000)
      return
    }

    // @ts-ignore
    const sha = data.sha

    await request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: process.env.GITHUB_OWNER ?? '',
      repo: process.env.GITHUB_REPO ?? '',
      path: `posts/${tag}/metadata.json`,
      message: '📃 Update metadata.json',
      content: Buffer.from(JSON.stringify(metadataObject, null, 2)).toString(
        'base64'
      ),
      sha,
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    })

    await delay(3_000)
  }
})
