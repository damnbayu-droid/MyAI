/**
 * Serialize harness messages into MyAI OS chat completions. Text is flattened
 * per role; tool calls do not occur on the chat route and image content is
 * rejected explicitly (the gateway is text-only).
 * @module dsh-llm-myai/serialize
 */

import { contentHasImage, LlmError } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, GenerateOptions, Message } from '@deepseek-ai/dsh-llm'
import type { WireMessage, WireRequest } from './types.ts'

/** Adapter-level request defaults (from plugin config). */
export interface RequestDefaults {
  field: string
}

/** Join the text blocks of a message. */
function flattenText(blocks: ContentBlock[]): string {
  return blocks
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

/** Reject image content before any text-flattening path can silently erase it. */
function assertTextOnly(blocks: readonly ContentBlock[]): void {
  if (contentHasImage(blocks)) {
    throw new LlmError('The MyAI chat-completions adapter does not support image content.', 'UNSUPPORTED_CONTENT')
  }
}

/** Serialize the conversation: system/user/assistant text only. */
export function serializeMessages(messages: Message[]): WireMessage[] {
  const wire: WireMessage[] = []
  for (const message of messages) {
    assertTextOnly(message.content)
    if (message.role === 'system') {
      wire.push({ role: 'system', content: flattenText(message.content) })
      continue
    }
    if (message.role === 'assistant') {
      wire.push({ role: 'assistant', content: flattenText(message.content) })
      continue
    }
    // user role: no tool results on the chat route.
    wire.push({ role: 'user', content: flattenText(message.content) })
  }
  return wire
}

/**
 * Build the full wire request (always streaming).
 * @param options - the harness request (model, history, system).
 * @param defaults - adapter-level defaults carrying the gateway `field`.
 * @returns the chat-completions request body.
 */
export function serializeRequest(
  options: GenerateOptions,
  defaults: RequestDefaults,
): WireRequest {
  const messages: WireMessage[] = []
  if (options.system !== undefined) {
    messages.push({ role: 'system', content: options.system })
  }
  messages.push(...serializeMessages(options.messages))

  return {
    field: defaults.field,
    model: options.model,
    messages,
    stream: true,
  }
}
