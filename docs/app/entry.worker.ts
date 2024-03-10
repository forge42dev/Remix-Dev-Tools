/// <reference lib="WebWorker" />
import type { DefaultFetchHandler } from '@remix-pwa/sw'
import { EnhancedCache, clearUpOldCaches } from '@remix-pwa/sw'

declare const self: ServiceWorkerGlobalScope

const SW_VERSION = 'v3'
const PRECACHED_URLS = [
  '/remix.svg',
  '/AI-Hero.webp',
  '/favicon.ico',
  '/fonts/Inter/Inter-roman.var.woff2',
  '/fonts/Space/Space.woff2',
]

const assetCache = new EnhancedCache('asset-cache', {
  version: SW_VERSION,
  strategy: 'NetworkFirst',
  strategyOptions: {
    cacheableResponse: {
      statuses: [200, 201, 202, 204, 301, 302],
    },
    maxAgeSeconds: 3_600 * 24 * 30,
  },
})

self.addEventListener('install', event => {
  event.waitUntil(
    assetCache
      .preCacheUrls(
        // process.env.NODE_ENV === 'development'
        PRECACHED_URLS
        // : self.__workerManifest.assets
      )
      .then(() => {
        self.skipWaiting()
      })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    clearUpOldCaches(['asset-cache'], SW_VERSION).then(() => {
      self.clients.claim()
    })
  )
})

export const defaultFetchHandler: DefaultFetchHandler = ({ context }) => {
  const { event, fetchFromServer } = context
  const { request } = event
  const url = new URL(request.url)

  if (PRECACHED_URLS.includes(url.pathname)) {
    return assetCache.handleRequest(request)
  }

  return fetchFromServer()
}
