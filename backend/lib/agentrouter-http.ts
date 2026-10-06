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

function bufferToUtf8(body: unknown): string {
  if (typeof body === 'string') return body
  if (Buffer.isBuffer(body)) return body.toString('utf8')
  if (body && typeof body === 'object') {
    const maybe = body as { type?: string; data?: number[] }
    if (maybe.type === 'Buffer' && Array.isArray(maybe.data)) {
      return Buffer.from(maybe.data).toString('utf8')
    }
  }
  return ''
}

function normalizeCycleTlsBody(resp: {
  status: number
  body?: unknown
  data?: unknown
}): AgentRouterHttpResult {
  const fromBody = bufferToUtf8(resp.body)
  if (fromBody.trim()) {
    return { status: resp.status, rawText: fromBody }
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
        // Chrome-like TLS fingerprint — helps AgentRouter's Aliyun WAF on datacenter egress.
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52394-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
        http2Fingerprint: '1:65536;4:131072;5:16384|12517377|3:0:0:201,5:0:0:101,7:0:0:1,9:0:7:1,11:0:3:1,13:0:0:241|m,p,a,s',
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
