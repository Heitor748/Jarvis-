import { WHISPER_MODEL } from '../constants/personality';
import { ResolvedProvider } from '../constants/providers';

// Transcricao (Whisper) e sempre via Groq.
const GROQ_BASE = 'https://api.groq.com/openai/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function transcribeAudio(
  audioUri: string,
  apiKey: string,
  language = 'pt'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  } as unknown as Blob);
  formData.append('model', WHISPER_MODEL);
  formData.append('language', language);
  formData.append('response_format', 'json');

  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcrição falhou (${res.status}): ${err}`);
  }

  const data = await res.json();
  return (data.text ?? '').trim();
}

/**
 * Chat completion generico compativel com OpenAI.
 * Funciona para Groq, SiliconFlow e Agnes (qualquer endpoint /chat/completions).
 */
export async function chatCompletion(
  messages: ChatMessage[],
  provider: ResolvedProvider
): Promise<string> {
  const base = provider.baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chat falhou (${res.status}): ${err}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}
