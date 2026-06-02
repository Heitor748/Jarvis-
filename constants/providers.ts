// Sistema multi-provedor: Groq + SiliconFlow + Agnes (custom).
// Todos sao chamados via API compativel com OpenAI (/chat/completions).

export type ProviderMode = 'auto' | 'groq' | 'flow' | 'agnes';

export interface ProviderDef {
  id: 'groq' | 'flow' | 'agnes';
  label: string;
  short: string;
  baseUrl: string;        // vazio = definido pelo usuario (Agnes)
  defaultModel: string;
  editableBaseUrl: boolean;
}

export const PROVIDERS: Record<'groq' | 'flow' | 'agnes', ProviderDef> = {
  groq: {
    id: 'groq',
    label: 'Groq',
    short: 'GROQ',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.1-8b-instant',
    editableBaseUrl: false,
  },
  flow: {
    id: 'flow',
    label: 'SiliconFlow',
    short: 'FLOW',
    baseUrl: 'https://api.siliconflow.com/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    editableBaseUrl: false,
  },
  agnes: {
    id: 'agnes',
    label: 'Agnes',
    short: 'AGNES',
    baseUrl: '', // o usuario informa a URL base da API
    defaultModel: '',
    editableBaseUrl: true,
  },
};

// Config resolvida de um provedor, pronta para chamar a API.
export interface ResolvedProvider {
  id: 'groq' | 'flow' | 'agnes';
  baseUrl: string;
  apiKey: string;
  model: string;
}

// Palavras que indicam comando direto de aparelho (vao pro modelo rapido = Groq).
const COMMAND_HINTS = [
  'liga', 'ligue', 'ligar', 'desliga', 'desligue', 'desligar',
  'abre', 'abra', 'abrir', 'aumenta', 'aumente', 'diminui', 'diminua',
  'lanterna', 'volume', 'brilho', 'wifi', 'bluetooth', 'bateria',
  'manda', 'mande', 'enviar', 'envia', 'sms', 'mensagem', 'ligação',
  'chama', 'chame', 'discar', 'disca',
];

/**
 * Decide qual provedor usar.
 * - modo fixo (groq/flow/agnes): usa esse, se estiver configurado; senao cai no Groq.
 * - auto: comando curto/direto -> Groq (rapido); pergunta longa/complexa -> Flow
 *   (raciocinio); padrao -> Groq. Agnes so e usado em modo manual.
 */
export function pickProvider(
  text: string,
  mode: ProviderMode,
  available: Record<'groq' | 'flow' | 'agnes', boolean>
): 'groq' | 'flow' | 'agnes' {
  if (mode !== 'auto') {
    if (available[mode]) return mode;
    // fallback se o escolhido nao tem chave
    if (available.groq) return 'groq';
    if (available.flow) return 'flow';
    if (available.agnes) return 'agnes';
    return 'groq';
  }

  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);
  const looksLikeCommand = COMMAND_HINTS.some((h) => lower.includes(h));
  const isComplex = words.length > 18 || lower.includes('?');

  if (looksLikeCommand && words.length <= 8 && available.groq) return 'groq';
  if (isComplex && available.flow) return 'flow';
  if (available.groq) return 'groq';
  if (available.flow) return 'flow';
  if (available.agnes) return 'agnes';
  return 'groq';
}

export function providerLabelForMode(mode: ProviderMode): string {
  if (mode === 'auto') return 'AUTO';
  return PROVIDERS[mode].short;
}
