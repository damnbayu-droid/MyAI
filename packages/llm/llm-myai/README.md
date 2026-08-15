# @deepseek-ai/dsh-llm-myai

MyAI Nexus chat-completions adapter for the harness LLM seam: direct `fetch` + SSE (framed by `eventsource-parser`) against the MyAI OpenAI/DeepSeek-compatible endpoint, translating the wire format into the `StreamChunk` protocol.

This package is a rebranded copy of `@deepseek-ai/dsh-llm-deepseek` — the transport, SSE parsing, and chunk-translation logic are byte-identical; only the provider route, credential environment variable, public endpoint, and default model catalog differ. Streaming behavior and latency are unchanged from the DeepSeek adapter.

The package root exposes the Cordis plugin contract and `DeepSeekAdapter`; wire serialization, SSE parsing, and chunk-translation helpers are not part of that root contract.

## Config

```yaml
- id: llm-myai
  name: '@deepseek-ai/dsh-llm-myai'
  config:
    apiKeyEnv: MYAI_API_KEY            # default; resolved per request via ctx.credentials, then the environment
    baseURL: https://api.myai.nexus/v1 # optional; $MYAI_BASE_URL then the public API when omitted
    models:
      - id: v4-flash
        name: MyAI V4 Flash
      - id: v4-pro
        name: MyAI V4 Pro
```

- `MYAI_API_KEY` — API key, never inlined in config.
- `MYAI_BASE_URL` — endpoint base; falls back to `https://api.myai.nexus/v1`.
