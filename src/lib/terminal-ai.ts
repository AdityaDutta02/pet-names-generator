import config from '../../terminal-ai.config.json'

const GATEWAY_URL = process.env.TERMINAL_AI_GATEWAY_URL!

export async function callGateway(
  messages: { role: string; content: string }[],
  embedToken: string,
): Promise<Response> {
  if (!embedToken) throw new Error('Missing embed token')
  const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${embedToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: config.model_tier, messages }),
  })
  if (res.status === 401) {
    throw Object.assign(new Error('Gateway 401: token expired or invalid'), { code: 'TOKEN_EXPIRED' })
  }
  return res
}
