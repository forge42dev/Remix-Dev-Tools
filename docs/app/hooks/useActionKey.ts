import { useState, useEffect } from 'react'

const ACTION_KEY_DEFAULT = ['Ctrl ', 'Control']
const ACTION_KEY_APPLE = ['⌘', 'Command']

export function useActionKey() {
  const [actionKey, setActionKey] = useState<string[]>(['', ''])

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
        // update to `navigator.userAgentData.platform` when it becomes accepted
        setActionKey(ACTION_KEY_APPLE)
      } else {
        setActionKey(ACTION_KEY_DEFAULT)
      }
    }
  }, [])

  return actionKey
}
