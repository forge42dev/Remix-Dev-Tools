import { HydratedRouter } from 'react-router/dom'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { configureGlobalCache } from 'remix-client-cache'

configureGlobalCache(() => localStorage)

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  )
})
