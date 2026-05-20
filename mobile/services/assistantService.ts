import { api, ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Sends the full conversation history to the backend (/assistant/chat)
 * and returns the assistant's reply string.
 *
 * Uses a 90s timeout (overriding the global 15s) because the LLM
 * inference can take up to ~30s on the server side.
 */
export async function sendMessage(messages: Message[]): Promise<string> {
  const { data } = await api.post<ApiResponse<{ response: string }>>(
    '/assistant/chat',
    { messages },
    { timeout: 90_000 },
  );
  return data.data.response;
}
