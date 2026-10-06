import initCycleTLS from 'cycletls'

type Env = Record<string, string | undefined>

export type AgentRouterHttpResult = {
  status: number
  rawText: string
}

let cycleTls: Awaited<ReturnType<typeof initCycleTLS>> | null = null

async function getCycleTLS() {
  if (!cycleTls) {
    cycleTls = await initCycleTLS()
  }
  return cycleTls
}

export function isWafHtmlBody(rawText: string): boolean {
  const sample = rawText.slice(0, 500).toLowerCase()
  return sample.includes('<!doctype html') || sample.includes('aliyun_waf')
}

function shouldPreferCycleTls(env: Env): boolean {
  if (env.AGENTROUTER_USE_CYCLETLS === 'false') return false
  if (env.AGENTROUTER_USE_CYCLETLS === 'true') return true
  // Render/Docker/Linux servers hit Aliyun WAF on native Node fetch; residential dev usually does not.
  return process.platform === 'linux'
}

function normalizeCycleTlsBody(resp: {
  status: number
  body?: string
  data?: unknown
}): AgentRouterHttpResult {
  if (typeof resp.body === 'string' && resp.body.trim()) {
    return { status: resp.status, rawText: resp.body }
  }
  if (resp.data !== undefined && resp.data !== null && typeof resp.data === 'object') {
    const keys = Object.keys(resp.data as object)
    if (keys.length > 0) {
      return { status: resp.status, rawText: JSON.stringify(resp.data) }
    }
  }
  if (resp.data !== undefined && resp.data !== null) {
    return { status: resp.status, rawText: String(resp.data) }
  }
  return { status: resp.status, rawText: '' }
}

export async function agentRouterPost(
  url: string,
  headers: Record<string, string>,
  payload: unknown,
  env: Env
): Promise<AgentRouterHttpResult> {
  const body = JSON.stringify(payload)

  const viaFetch = async (): Promise<AgentRouterHttpResult> => {
    const response = await fetch(url, { method: 'POST', headers, body })
    return { status: response.status, rawText: await response.text() }
  }

  const viaCycleTls = async (): Promise<AgentRouterHttpResult> => {
    const client = await getCycleTLS()
    const resp = await client(
      url,
      {
        body,
        headers,
        userAgent: headers['user-agent'],
        timeout: 120,
      },
      'post'
    )
    return normalizeCycleTlsBody(resp)
  }

  if (shouldPreferCycleTls(env)) {
    return viaCycleTls()
  }

  const first = await viaFetch()
  if (isWafHtmlBody(first.rawText)) {
    return viaCycleTls()
  }
  return first
}
