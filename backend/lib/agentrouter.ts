// Centralized AgentRouter multi-model provider service
// Supports OpenAI-compatible and Anthropic-compatible protocols with normalized routing.

import {
  agentRouterPost,
  agentRouterViaPythonBridge,
  isWafHtmlBody,
  shouldPreferPythonBridge,
} from './agentrouter-http.js'

export type ModelProtocol = 'openai-compatible' | 'anthropic'

export interface ModelMetadata {
  id: string
  name: string
  provider: 'agentrouter'
  protocol: ModelProtocol
  pricing: {
    input: string
    output: string
  }
}

export const AVAILABLE_MODELS: Record<string, ModelMetadata> = {
  'deepseek-v4-flash': {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    provider: 'agentrouter',
    protocol: 'openai-compatible',
    pricing: {
      input: '$2 / 1M',
      output: '$6 / 1M',
    },
  },
  'gpt-5.6-sol': {
    id: 'gpt-5.6-sol',
    name: 'GPT-5.6 Sol',
    provider: 'agentrouter',
    protocol: 'openai-compatible',
    pricing: {
      input: '$3 / 1M',
      output: '$15 / 1M',
    },
  },
  'gpt-6-astra': {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    provider: 'agentrouter',
    protocol: 'openai-compatible',
    pricing: {
      input: '$3 / 1M',
      output: '$15 / 1M',
    },
  },
  'claude-opus-5': {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    provider: 'agentrouter',
    protocol: 'anthropic',
    pricing: {
      input: '$6 / 1M',
      output: '$30 / 1M',
    },
  },
  'claude-opus-4-8': {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    provider: 'agentrouter',
    protocol: 'anthropic',
    pricing: {
      input: '$6 / 1M',
      output: '$30 / 1M',
    },
  },
}

export const DEFAULT_MODEL_ID = 'deepseek-v4-flash'

export function getAvailableModels(): ModelMetadata[] {
  return Object.values(AVAILABLE_MODELS)
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface UnifiedChatOptions {
  model?: string
  messages: ChatMessage[]
  system?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface UnifiedUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export interface UnifiedChatResponse {
  model: string
  text: string
  reasoning?: string
  usage?: UnifiedUsage
}

type Env = Record<string, string | undefined>

function getBaseUrl(env: Env): string {
  return (env.AGENTROUTER_BASE_URL || 'https://agentrouter.org').replace(/\/$/, '')
}

function buildOpenAICompatibleHeaders(apiKey: string): Record<string, string> {
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${apiKey}`,
    'user-agent': 'Anthropic/Python 1.0.0',
    'x-stainless-lang': 'python',
    'x-stainless-os': 'MacOS',
    'x-stainless-arch': 'arm64',
    'x-stainless-runtime': 'CPython',
  }
}

function buildAnthropicHeaders(apiKey: string): Record<string, string> {
  return {
    'content-type': 'application/json',
    accept: 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey,
    authorization: `Bearer ${apiKey}`,
    'user-agent': 'Anthropic/Python 1.0.0',
    'x-stainless-lang': 'python',
    'x-stainless-os': 'MacOS',
    'x-stainless-arch': 'arm64',
    'x-stainless-runtime': 'CPython',
  }
}

function parseAgentRouterJson(rawText: string, status: number): any {
  try {
    return JSON.parse(rawText)
  } catch {
    if (isWafHtmlBody(rawText)) {
      throw new Error(
        'AgentRouter blocked this server (Aliyun WAF). Use the Render API backend with CycleTLS enabled.'
      )
    }
    throw new Error(`AgentRouter returned non-JSON response (${status}): ${rawText.slice(0, 200)}`)
  }
}

function getApiKey(env: Env): string {
  const key = env.AGENTROUTER_API_KEY || env.AXON_API_KEY || ''
  if (!key) {
    throw new Error('AGENTROUTER_API_KEY is not configured on the server.')
  }
  return key.trim()
}

/**
 * OpenAI-compatible execution for deepseek-v4-flash and gpt-5.6-sol
 */
async function callOpenAICompatible(
  baseUrl: string,
  modelId: string,
  apiKey: string,
  options: UnifiedChatOptions,
  env: Env
): Promise<UnifiedChatResponse> {
  const { messages, system, temperature = 0.7, maxTokens = 4096 } = options

  const payloadMessages: { role: string; content: string }[] = []
  if (system) {
    payloadMessages.push({ role: 'system', content: system })
  }
  for (const m of messages) {
    payloadMessages.push({ role: m.role, content: m.content })
  }

  const headers = buildOpenAICompatibleHeaders(apiKey)
  const requestBody = {
    model: modelId,
    messages: payloadMessages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  }

  const { status, rawText } = await agentRouterPost(
    `${baseUrl}/v1/chat/completions`,
    headers,
    requestBody,
    env
  )
  const data = parseAgentRouterJson(rawText, status)

  if (status < 200 || status >= 300) {
    const errDetail = data?.error?.message || JSON.stringify(data)

    if (status === 401 || status === 403) {
      throw new Error(`Unauthorized: ${errDetail || 'Invalid AgentRouter API key.'}`)
    }
    if (status === 402) {
      throw new Error(`AgentRouter Budget Exceeded: ${errDetail}`)
    }
    if (status === 429) {
      throw new Error('Rate limit exceeded from AgentRouter. Please try again later.')
    }
    throw new Error(`AgentRouter OpenAI API error (${status}): ${errDetail}`)
  }

  const choice = data?.choices?.[0]
  let text = choice?.message?.content ?? ''
  const reasoning = choice?.message?.reasoning_content ?? choice?.message?.reasoning ?? ''

  if (!text && reasoning) {
    text = reasoning
  }

  if (!text.trim()) {
    throw new Error(
      `AgentRouter returned an empty completion for model ${modelId}: ${rawText.slice(0, 400)}`
    )
  }

  const usage: UnifiedUsage = {
    inputTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens,
  }

  return {
    model: modelId,
    text,
    reasoning: reasoning || undefined,
    usage,
  }
}

/**
 * Anthropic-compatible execution for claude-opus-5 and claude-opus-4-8
 */
async function callAnthropicCompatible(
  baseUrl: string,
  modelId: string,
  apiKey: string,
  options: UnifiedChatOptions,
  env: Env
): Promise<UnifiedChatResponse> {
  const { messages, system, temperature = 0.7, maxTokens = 4096 } = options

  // Filter messages to user and assistant roles (Anthropic standard)
  const anthropicMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  const payload: Record<string, unknown> = {
    model: modelId,
    messages: anthropicMessages,
    max_tokens: maxTokens,
    temperature,
  }

  if (system) {
    payload.system = system
  }

  const headers = buildAnthropicHeaders(apiKey)
  const { status, rawText } = await agentRouterPost(
    `${baseUrl}/v1/messages`,
    headers,
    payload,
    env
  )
  const data = parseAgentRouterJson(rawText, status)

  if (status < 200 || status >= 300) {
    const errDetail = data?.error?.message || JSON.stringify(data)

    if (status === 401 || status === 403) {
      throw new Error(`Unauthorized: ${errDetail || 'Invalid AgentRouter API key.'}`)
    }
    if (status === 402) {
      throw new Error(`AgentRouter Budget Exceeded: ${errDetail}`)
    }
    if (status === 429) {
      throw new Error('Rate limit exceeded from AgentRouter. Please try again later.')
    }
    throw new Error(`AgentRouter Anthropic API error (${status}): ${errDetail}`)
  }

  // Extract text and optional thinking blocks from Anthropic response structure
  let text = ''
  let reasoning = ''

  if (Array.isArray(data?.content)) {
    for (const block of data.content) {
      if (block.type === 'text') {
        text += block.text || ''
      } else if (block.type === 'thinking') {
        reasoning += block.thinking || ''
      }
    }
  } else if (typeof data?.text === 'string') {
    text = data.text
  }

  if (!text && reasoning) {
    text = reasoning
  }

  if (!text.trim()) {
    throw new Error(
      `AgentRouter returned an empty completion for model ${modelId}: ${rawText.slice(0, 400)}`
    )
  }

  const inputTokens = data?.usage?.input_tokens
  const outputTokens = data?.usage?.output_tokens
  const usage: UnifiedUsage = {
    inputTokens,
    outputTokens,
    totalTokens: typeof inputTokens === 'number' && typeof outputTokens === 'number' ? inputTokens + outputTokens : undefined,
  }

  return {
    model: modelId,
    text,
    reasoning: reasoning || undefined,
    usage,
  }
}

/**
 * Unified provider chat interface.
 * Central entry point for all model chat completions.
 */
function buildPythonBridgeMessages(
  messages: ChatMessage[]
): { role: string; content: string }[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
}

export async function chat(
  options: UnifiedChatOptions,
  env: Env
): Promise<UnifiedChatResponse> {
  getApiKey(env)
  const baseUrl = getBaseUrl(env)
  const targetModelId = options.model || DEFAULT_MODEL_ID
  const modelConfig = AVAILABLE_MODELS[targetModelId] || AVAILABLE_MODELS[DEFAULT_MODEL_ID]

  if (!modelConfig) {
    throw new Error(`Invalid model requested: ${targetModelId}`)
  }

  const { messages, system, temperature = 0.7, maxTokens = 4096 } = options

  if (shouldPreferPythonBridge(env)) {
    try {
      const bridged = await agentRouterViaPythonBridge(
        {
          protocol: modelConfig.protocol,
          model: modelConfig.id,
          messages: buildPythonBridgeMessages(messages),
          system,
          max_tokens: maxTokens,
          temperature,
        },
        env
      )
      return {
        model: bridged.model,
        text: bridged.text,
        reasoning: bridged.reasoning,
        usage: bridged.usage,
      }
    } catch (bridgeErr) {
      console.error(
        'Python AgentRouter bridge failed:',
        (bridgeErr as Error)?.message || bridgeErr
      )
      if (shouldPreferPythonBridge(env)) {
        throw bridgeErr
      }
    }
  }

  const apiKey = getApiKey(env)
  if (modelConfig.protocol === 'anthropic') {
    return callAnthropicCompatible(baseUrl, modelConfig.id, apiKey, options, env)
  }
  return callOpenAICompatible(baseUrl, modelConfig.id, apiKey, options, env)
}
