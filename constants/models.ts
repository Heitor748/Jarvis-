// Registro de modelos Groq + roteador automatico.

export type ModelMode = 'auto' | 'fast' | 'smart' | 'scout';

export interface ModelInfo {
  id: string;
  label: string;
  short: string;
}

// Modelos disponiveis no Groq Cloud.
export const MODELS: Record<'fast' | 'smart' | 'scout', ModelInfo> = {
  fast: {
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B Instant',
    short: 'RÁPIDO',
  },
  smart: {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B Versatile',
    short: 'POTENTE',
  },
  scout: {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Llama 4 Scout',
    short: 'SCOUT',
  },
};

// Palavras que indicam comando direto de aparelho (vao pro modelo rapido).
const COMMAND_HINTS = [
  'liga', 'ligue', 'ligar', 'desliga', 'desligue', 'desligar',
  'abre', 'abra', 'abrir', 'aumenta', 'aumente', 'diminui', 'diminua',
  'lanterna', 'volume', 'brilho', 'wifi', 'bluetooth', 'bateria',
  'manda', 'mande', 'enviar', 'envia', 'sms', 'mensagem', 'ligação',
  'chama', 'chame', 'discar', 'disca',
];

/**
 * Escolhe o modelo a usar. Em modo 'auto', faz roteamento por heuristica:
 * - comando curto/direto -> modelo RAPIDO
 * - pergunta longa / pedido de raciocinio -> modelo POTENTE
 * Em modos fixos, retorna o modelo escolhido.
 */
export function pickModel(text: string, mode: ModelMode): ModelInfo {
  if (mode === 'fast') return MODELS.fast;
  if (mode === 'smart') return MODELS.smart;
  if (mode === 'scout') return MODELS.scout;

  // auto
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);
  const isShort = words.length <= 7;
  const looksLikeCommand = COMMAND_HINTS.some((h) => lower.includes(h));

  if (looksLikeCommand && isShort) return MODELS.fast;
  if (words.length > 24 || lower.includes('?')) return MODELS.smart;
  return MODELS.scout;
}

export function modelLabelForMode(mode: ModelMode): string {
  switch (mode) {
    case 'auto': return 'AUTO';
    case 'fast': return MODELS.fast.short;
    case 'smart': return MODELS.smart.short;
    case 'scout': return MODELS.scout.short;
  }
}
