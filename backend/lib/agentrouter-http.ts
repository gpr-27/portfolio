import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
type Env = Record<string, string | undefined>

export type AgentRouterHttpResult = {
  status: number
  rawText: string
}

export type PythonBridgePayload = {
  protocol: 'openai-compatible' | 'anthropic'
  model: string
  messages: { role: string; content: string }[]
  system?: string
  max_tokens?: number
  temperature?: number
}

export type PythonBridgeResult = {
  model: string
  text: string
  reasoning?: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}

let cycleTls: { (url: string, options: object, method: string): Promise<unknown> } | null =
  null

async function getCycleTLS() {
  if (!cycleTls) {
    const { default: initCycleTLS } = await import('cycletls')
    cycleTls = await initCycleTLS()
  }
  return cycleTls
}

export function isWafHtmlBody(rawText: string): boolean {
  const sample = rawText.slice(0, 500).toLowerCase()
  return sample.includes('<!doctype html') || sample.includes('aliyun_waf')
}

export function isVercelServerless(): boolean {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true'
}

export function shouldPreferPythonBridge(env: Env): boolean {
  if (env.AGENTROUTER_USE_PYTHON_BRIDGE === 'false') return false
  if (env.AGENTROUTER_USE_PYTHON_BRIDGE === 'true') return true
  // Vercel Linux functions have no Python bridge; use httpx-style fetch headers instead.
  if (isVercelServerless()) return false
  return process.platform === 'linux'
}

function shouldPreferCycleTls(env: Env): boolean {
  if (env.AGENTROUTER_USE_CYCLETLS === 'false') return false
  if (env.AGENTROUTER_USE_CYCLETLS === 'true') return true
  if (env.AGENTROUTER_USE_PYTHON_BRIDGE === 'true') return false
  // CycleTLS native binaries are unreliable on Vercel serverless.
  if (isVercelServerless()) return false
  return process.platform === 'linux'
}

const PYTHON_SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../scripts/agentrouter_request.py'
)

const PYDEPS_DIR = path.join(path.dirname(PYTHON_SCRIPT), 'pydeps')

function pythonEnv(env: Env): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...env,
    PYTHONPATH: [PYDEPS_DIR, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),
  } as NodeJS.ProcessEnv
}

export async function agentRouterViaPythonBridge(
  payload: PythonBridgePayload,
  env: Env
): Promise<PythonBridgeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [PYTHON_SCRIPT], {
      env: pythonEnv(env),
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('error', (err) => reject(err))
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python AgentRouter bridge exited with code ${code}`))
        return
      }
      try {
        const parsed = JSON.parse(stdout.trim())
        if (!parsed.ok) {
          reject(new Error(parsed.error || 'Python AgentRouter bridge failed'))
          return
        }
        resolve({
          model: parsed.model,
          text: parsed.text || '',
          reasoning: parsed.reasoning || undefined,
          usage: parsed.usage,
        })
      } catch (err) {
        reject(err)
      }
    })

    child.stdin.write(JSON.stringify(payload))
    child.stdin.end()
  })
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
  for (const candidate of [resp.data, resp.body]) {
    const text = bufferToUtf8(candidate)
    if (text.trim()) {
      return { status: resp.status, rawText: text }
    }
  }
  if (resp.data !== undefined && resp.data !== null && typeof resp.data === 'object') {
    const keys = Object.keys(resp.data as object)
    if (keys.length > 0) {
      return { status: resp.status, rawText: JSON.stringify(resp.data) }
    }
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
