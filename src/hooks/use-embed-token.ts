'use client'
import { useState, useEffect } from 'react'

/**
 * Listens for the embed token delivered by the Terminal AI viewer shell
 * via window.postMessage. Also requests the token on mount in case
 * the initial postMessage fired before React hydrated.
 */
export function useEmbedToken(): string | null {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'TERMINAL_AI_TOKEN' && typeof event.data.token === 'string') {
        setToken(event.data.token)
      }
    }
    window.addEventListener('message', handleMessage)

    // Request token from parent in case we missed the initial postMessage
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'TERMINAL_AI_READY' }, '*')
    }

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return token
}
