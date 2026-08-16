/**
 * MyAI OS chat-completions wire format. Types only.
 *
 * The MyAI OS gateway is NOT OpenAI-compatible: a request carries a `field`
 * (use-case selector) and the streaming response emits `{delta}` text chunks
 * terminated by a `{done, result, ...}` chunk, then the `[DONE]` sentinel.
 *
 * @module dsh-llm-myai/types
 */

/** Request body for `POST {baseURL}/chat/completions`. */
export interface WireRequest {
  /** Use-case selector the gateway routes on (e.g. `chatbot_general`). */
  field: string
  /** Model hint; the gateway may route to a different provider per its tiers. */
  model: string
  messages: WireMessage[]
  stream: true
}

/** System-role message: a single string of instructions. */
export interface WireSystemMessage {
  role: 'system'
  content: string
}

/** User-role message: a single string of user input. */
export interface WireUserMessage {
  role: 'user'
  content: string
}

/** Assistant-role history message. */
export interface WireAssistantMessage {
  role: 'assistant'
  content: string
}

/** One entry of the request `messages` array, discriminated on `role`. */
export type WireMessage =
  | WireSystemMessage
  | WireUserMessage
  | WireAssistantMessage

/** One parsed SSE `data:` payload. */
export interface WireChunk {
  /** Incremental visible text. */
  delta?: string
  /** Present (true) only on the terminal chunk, which carries the full `result`. */
  done?: boolean
  /** Full text on the terminal chunk (redundant with the accumulated deltas). */
  result?: string
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

/** Non-2xx error body. */
export interface WireError {
  error?: string
}
