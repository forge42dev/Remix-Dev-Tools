import '@testing-library/jest-dom/vitest'
import { installGlobals } from '@remix-run/node'
import { afterAll, afterEach } from 'vitest'

installGlobals()

// one time setup here

afterEach(() => {})
afterAll(async () => {})
