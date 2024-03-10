import type { TestingLibraryMatchers } from 'node_modules/@testing-library/jest-dom/types/matchers'

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<T, void> {}
}
