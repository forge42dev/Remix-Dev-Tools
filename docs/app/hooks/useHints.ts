import { useRequestInfo } from './useRequestInfo'

export function useHints() {
  const requestInfo = useRequestInfo()
  return requestInfo.hints
}
