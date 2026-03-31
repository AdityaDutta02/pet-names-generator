'use client'
import { useState, useEffect } from 'react'

/**
 * Listens for the embed token delivered by the Terminal AI viewer shell
 * via window.postMessage. The token is used to authenticate API calls
 * to the Terminal AI gateway.
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
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return token
}
