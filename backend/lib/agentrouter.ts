// Centralized AgentRouter multi-model provider service
// Supports OpenAI-compatible and Anthropic-compatible protocols with normalized routing.

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

const AGENTROUTER_BASE_URL = 'https://agentrouter.org'
const OPENAI_ENDPOINT = `${AGENTROUTER_BASE_URL}/v1/chat/completions`
const ANTHROPIC_ENDPOINT = `${AGENTROUTER_BASE_URL}/v1/messages`

const AGENTROUTER_HEADERS = {
  'content-type': 'application/json',
  'accept': 'application/json',
  'user-agent': 'claude-cli/2.1.195 (external, cli)',
  'x-app': 'cli',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
  'x-stainless-lang': 'python',
  'x-stainless-package-version': '0.34.0',
  'x-stainless-os': 'MacOS',
  'x-stainless-arch': 'arm64',
  'x-stainless-runtime': 'CPython',
  'x-stainless-runtime-version': '3.11.0',
}

function getApiKey(env: Env): string {
  const key = env.AGENTROUTER_API_KEY || ''
  if (!key) {
    throw new Error('AGENTROUTER_API_KEY is not configured on the server.')
  }
  return key.trim()
}

/**
 * OpenAI-compatible execution for deepseek-v4-flash and gpt-5.6-sol
 */
async function callOpenAICompatible(
  modelId: string,
  apiKey: string,
  options: UnifiedChatOptions
): Promise<UnifiedChatResponse> {
  const { messages, system, temperature = 0.7, maxTokens = 4096 } = options

  const payloadMessages: { role: string; content: string }[] = []
  if (system) {
    payloadMessages.push({ role: 'system', content: system })
  }
  for (const m of messages) {
    payloadMessages.push({ role: m.role, content: m.content })
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      ...AGENTROUTER_HEADERS,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: payloadMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  })

  const rawText = await response.text()
  let data: any

  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(`AgentRouter returned non-JSON response (${response.status}): ${rawText.slice(0, 200)}`)
  }

  if (!response.ok) {
    const errDetail = data?.error?.message || JSON.stringify(data)

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Unauthorized: ${errDetail || 'Invalid AgentRouter API key.'}`)
    }
    if (response.status === 402) {
      throw new Error(`AgentRouter Budget Exceeded: ${errDetail}`)
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded from AgentRouter. Please try again later.')
    }
    throw new Error(`AgentRouter OpenAI API error (${response.status}): ${errDetail}`)
  }

  const choice = data?.choices?.[0]
  let text = choice?.message?.content ?? ''
  const reasoning = choice?.message?.reasoning_content ?? choice?.message?.reasoning ?? ''

  if (!text && reasoning) {
    text = reasoning
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
  modelId: string,
  apiKey: string,
  options: UnifiedChatOptions
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

  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      ...AGENTROUTER_HEADERS,
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  const rawText = await response.text()
  let data: any

  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(`AgentRouter returned non-JSON response (${response.status}): ${rawText.slice(0, 200)}`)
  }

  if (!response.ok) {
    const errDetail = data?.error?.message || JSON.stringify(data)

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Unauthorized: ${errDetail || 'Invalid AgentRouter API key.'}`)
    }
    if (response.status === 402) {
      throw new Error(`AgentRouter Budget Exceeded: ${errDetail}`)
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded from AgentRouter. Please try again later.')
    }
    throw new Error(`AgentRouter Anthropic API error (${response.status}): ${errDetail}`)
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
export async function chat(
  options: UnifiedChatOptions,
  env: Env
): Promise<UnifiedChatResponse> {
  const apiKey = getApiKey(env)
  const targetModelId = options.model || DEFAULT_MODEL_ID
  const modelConfig = AVAILABLE_MODELS[targetModelId] || AVAILABLE_MODELS[DEFAULT_MODEL_ID]

  if (!modelConfig) {
    throw new Error(`Invalid model requested: ${targetModelId}`)
  }

  if (modelConfig.protocol === 'openai-compatible') {
    return callOpenAICompatible(modelConfig.id, apiKey, options)
  }

  if (modelConfig.protocol === 'anthropic') {
    return callAnthropicCompatible(modelConfig.id, apiKey, options)
  }

  throw new Error(`Unsupported protocol for model: ${modelConfig.id}`)
}
