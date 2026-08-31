import { DeviceCommand } from './deviceControlService';

/**
 * Parser para extrair comandos de dispositivo das mensagens do usuário.
 * Detecta intenções e extrai parâmetros (número, mensagem, etc).
 */

export interface ParsedCommand {
  type: 'device' | 'chat' | 'unknown';
  deviceCommand?: DeviceCommand;
  intent?: string;
  parameters?: Record<string, string>;
  confidence: number; // 0-1
  requiresConfirmation: boolean;
}

// Padrões para detecção de comandos
const PATTERNS = {
  // Chamadas: "ligar para João", "chamar 11999999999"
  call: [
    { regex: /^(?:ligar|chamar|discar|fazer uma ligação)\s+para\s+(.+)$/i, group: 1 },
    { regex: /^(?:ligar|chamar|discar)\s+(.+)$/i, group: 1 },
  ],
  // SMS: "enviar SMS para João: olá", "mandar mensagem para 11999999999: oi"
  sms: [
    {
      regex: /^(?:enviar|mandar)\s+(?:sms|mensagem)\s+para\s+(.+):\s*(.+)$/i,
      groups: { phone: 1, message: 2 },
    },
  ],
  // Volume: "aumentar volume", "diminuir som", "volume 8"
  volumeUp: [{ regex: /^(?:aumentar|subir|aumenta)\s+(?:volume|som)$/i }],
  volumeDown: [{ regex: /^(?:diminuir|descer|baixar|diminui)\s+(?:volume|som)$/i }],
  volumeSet: [{ regex: /^(?:volume|som)\s+(\d+)$/i, group: 1 }],
  // Lanterna: "ligar lanterna", "acender luz", "desligar lanterna"
  flashlightOn: [{ regex: /^(?:ligar|acender)\s+(?:lanterna|luz|led)$/i }],
  flashlightOff: [{ regex: /^(?:desligar|apagar)\s+(?:lanterna|luz|led)$/i }],
};

// Comandos que requerem confirmação do usuário
const CONFIRMATION_REQUIRED = ['call', 'sms', 'flashlight'];

/**
 * Extrai número de telefone de uma string.
 * Aceita: "João", "11999999999", "(11) 99999-9999", etc.
 */
function extractPhoneNumber(input: string): string | null {
  // Remove espaços, parênteses, hífens
  const cleaned = input.replace(/[\D]/g, '');
  // Verifica se tem pelo menos 10 dígitos (código de área + número)
  if (cleaned.length >= 10) {
    return cleaned;
  }
  // Se não encontrou número, retorna null (pode ser nome de contato)
  return null;
}

/**
 * Processa a mensagem do usuário e detecta intenção de comando.
 */
export function parseCommand(userMessage: string): ParsedCommand {
  const msg = userMessage.trim().toLowerCase();

  // Tenta detector chamadas
  for (const pattern of PATTERNS.call) {
    const match = msg.match(pattern.regex);
    if (match) {
      const input = match[pattern.group || 1]?.trim();
      const phone = extractPhoneNumber(input);
      if (phone) {
        return {
          type: 'device',
          deviceCommand: { type: 'call', phoneNumber: phone },
          intent: 'call',
          parameters: { input, phone },
          confidence: 0.95,
          requiresConfirmation: true,
        };
      }
      // Número não encontrado (pode ser nome de contato)
      return {
        type: 'device',
        intent: 'call',
        parameters: { input },
        confidence: 0.7,
        requiresConfirmation: true,
      };
    }
  }

  // Tenta detectar SMS
  for (const pattern of PATTERNS.sms) {
    const match = msg.match(pattern.regex);
    if (match) {
      const phoneInput = match[pattern.groups?.phone || 1]?.trim();
      const message = match[pattern.groups?.message || 2]?.trim();
      const phone = extractPhoneNumber(phoneInput);
      if (phone && message) {
        return {
          type: 'device',
          deviceCommand: { type: 'sms', phoneNumber: phone, message },
          intent: 'sms',
          parameters: { phoneInput, phone, message },
          confidence: 0.95,
          requiresConfirmation: true,
        };
      }
    }
  }

  // Tenta detectar aumento de volume
  for (const pattern of PATTERNS.volumeUp) {
    if (pattern.regex.test(msg)) {
      return {
        type: 'device',
        deviceCommand: { type: 'volume', level: 12 }, // Aumenta para 12 (default)
        intent: 'volume_up',
        confidence: 0.9,
        requiresConfirmation: false,
      };
    }
  }

  // Tenta detectar diminuição de volume
  for (const pattern of PATTERNS.volumeDown) {
    if (pattern.regex.test(msg)) {
      return {
        type: 'device',
        deviceCommand: { type: 'volume', level: 5 }, // Diminui para 5 (default)
        intent: 'volume_down',
        confidence: 0.9,
        requiresConfirmation: false,
      };
    }
  }

  // Tenta detectar set de volume
  for (const pattern of PATTERNS.volumeSet) {
    const match = msg.match(pattern.regex);
    if (match) {
      const level = parseInt(match[pattern.group || 1], 10);
      if (!isNaN(level) && level >= 0 && level <= 15) {
        return {
          type: 'device',
          deviceCommand: { type: 'volume', level },
          intent: 'volume_set',
          confidence: 0.95,
          requiresConfirmation: false,
        };
      }
    }
  }

  // Tenta detectar ligar lanterna
  for (const pattern of PATTERNS.flashlightOn) {
    if (pattern.regex.test(msg)) {
      return {
        type: 'device',
        deviceCommand: { type: 'flashlight', level: 1 },
        intent: 'flashlight_on',
        confidence: 0.9,
        requiresConfirmation: false,
      };
    }
  }

  // Tenta detectar desligar lanterna
  for (const pattern of PATTERNS.flashlightOff) {
    if (pattern.regex.test(msg)) {
      return {
        type: 'device',
        deviceCommand: { type: 'flashlight', level: 0 },
        intent: 'flashlight_off',
        confidence: 0.9,
        requiresConfirmation: false,
      };
    }
  }

  // Se não detectou comando de dispositivo, é mensagem de chat normal
  return { type: 'chat', confidence: 0, requiresConfirmation: false };
}

/**
 * Gera mensagem de confirmação amigável para o usuário.
 */
export function generateConfirmationPrompt(parsed: ParsedCommand): string {
  switch (parsed.intent) {
    case 'call':
      if (parsed.parameters?.phone) {
        return `Vou ligar para ${parsed.parameters.phone}. Confirma?`;
      }
      return `Vou tentar ligar para ${parsed.parameters?.input}. Confirma?`;
    case 'sms':
      return `Vou enviar "${parsed.parameters?.message}" para ${parsed.parameters?.phoneInput}. Confirma?`;
    case 'flashlight_on':
      return 'Vou ligar a lanterna. Confirma?';
    case 'flashlight_off':
      return 'Vou desligar a lanterna. Confirma?';
    default:
      return 'Confirma essa ação?';
  }
}
