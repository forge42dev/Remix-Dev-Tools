import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import type { ClientLoaderFunctionArgs } from '@remix-run/react'
import { Outlet } from '@remix-run/react'
import { cacheClientLoader, useCachedLoaderData } from 'remix-client-cache'

import { Sidebar } from '~/components/layout/Sidebar'
import { getParsedMetadata } from '~/utils/server/doc.server'
import type { MetadataType } from '~/utils/server/doc.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  let metadata: MetadataType = {
    paths: {},
    hasIndex: false,
    sections: [],
    meta: {},
  } // default values

  if (params.tag) {
    metadata = (await getParsedMetadata(params.tag)) ?? metadata
  }

  return json({
    metadata,
    tag: params.tag,
  })
}

export const clientLoader = async (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args)

clientLoader.hydrate = true

export default function TagRoute() {
  const { metadata } = useCachedLoaderData<{
    metadata: MetadataType
  }>()

  return (
    <Sidebar metadata={metadata}>
      <Outlet />
    </Sidebar>
  )
}
