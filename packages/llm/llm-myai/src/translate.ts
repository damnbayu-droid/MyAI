/**
 * Translate MyAI OS SSE payloads into the harness `StreamChunk` protocol.
 * Each `{delta}` opens/extends one text block; the terminal `{done, ...}`
 * chunk carries token usage; `[DONE]` closes the block and finishes.
 * @module dsh-llm-myai/translate
 */

import { EMPTY_RESPONSE_CODE, LlmError } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, StreamChunk, TokenUsage } from '@deepseek-ai/dsh-llm'
import { DONE } from './sse.ts'
import type { WireChunk } from './types.ts'

/**
 * Map the terminal chunk's token counts to the harness usage convention.
 * @param chunk - the terminal `{done, ...}` chunk.
 * @returns disjoint harness counts, or undefined when the chunk carried no counts.
 */
export function mapUsage(chunk: WireChunk): TokenUsage | undefined {
  if (chunk.prompt_tokens === undefined && chunk.completion_tokens === undefined) return undefined
  return {
    inputTokens: chunk.prompt_tokens ?? 0,
    outputTokens: chunk.completion_tokens ?? 0,
  }
}

/**
 * Consume SSE data payloads (ending with `[DONE]`) and yield StreamChunks.
 * Malformed JSON payloads abort the stream with `MALFORMED_RESPONSE`.
 * @param payloads - SSE data payloads from {@link parseSse}, `[DONE]`-terminated.
 * @returns text deltas as they arrive; `block-end`, `usage`, and `finish` are deferred to `[DONE]`.
 */
export async function* translate(payloads: AsyncIterable<string>): AsyncGenerator<StreamChunk> {
  let text = ''
  let opened = false
  let pendingUsage: TokenUsage | undefined

  for await (const payload of payloads) {
    if (payload === DONE) {
      if (opened) {
        yield { type: 'block-end', index: 0, block: { type: 'text', text } satisfies ContentBlock }
      }
      if (pendingUsage) yield { type: 'usage', usage: pendingUsage }
      yield {
        type: 'finish',
        reason: opened
          ? { kind: 'stop' as const }
          : {
            kind: 'error',
            failure: { message: 'model returned a completed response with no content', code: EMPTY_RESPONSE_CODE },
          },
      }
      return
    }

    let chunk: WireChunk
    try {
      chunk = JSON.parse(payload) as WireChunk
    } catch {
      throw new LlmError(`malformed SSE payload: ${payload.slice(0, 120)}`, 'MALFORMED_RESPONSE')
    }

    if (typeof chunk.delta === 'string' && chunk.delta.length > 0) {
      if (!opened) {
        opened = true
        yield { type: 'block-start', index: 0, blockType: 'text' as const }
      }
      text += chunk.delta
      yield { type: 'text-delta', index: 0, text: chunk.delta }
    }

    if (chunk.done === true) {
      pendingUsage = mapUsage(chunk)
    }
  }

  // parseSse guarantees the [DONE] sentinel (or throws); reaching here means
  // the payload source violated that contract.
  throw new LlmError('SSE payload stream ended without [DONE]', 'STREAM_CLOSED')
}
