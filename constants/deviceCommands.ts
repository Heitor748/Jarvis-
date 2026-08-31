/**
 * Dicionário de comandos de dispositivo para a IA interpretar.
 * Ajuda a IA a reconhecer e executar ações de controle.
 */

export const DEVICE_COMMAND_PATTERNS = {
  // Chamadas
  call: [
    /^ligar para (.+)$/i,
    /^fazer uma ligação para (.+)$/i,
    /^chamar (.+)$/i,
    /^discar (.+)$/i,
  ],
  // SMS
  sms: [
    /^enviar sms para (.+): (.+)$/i,
    /^mandar mensagem para (.+): (.+)$/i,
    /^enviar mensagem para (.+): (.+)$/i,
  ],
  // Volume
  volumeUp: [
    /^aumentar volume$/i,
    /^aumentar som$/i,
    /^subir volume$/i,
  ],
  volumeDown: [
    /^diminuir volume$/i,
    /^diminuir som$/i,
    /^descer volume$/i,
    /^baixar volume$/i,
  ],
  volumeSet: [
    /^volume (\d+)$/i,
    /^ajustar volume para (\d+)$/i,
    /^colocar volume em (\d+)$/i,
  ],
  // Lanterna
  flashlightOn: [
    /^ligar lanterna$/i,
    /^lanterna ligada$/i,
    /^acender lanterna$/i,
    /^ligar luz$/i,
  ],
  flashlightOff: [
    /^desligar lanterna$/i,
    /^lanterna desligada$/i,
    /^apagar lanterna$/i,
    /^desligar luz$/i,
  ],
};

export const DEVICE_CAPABILITIES = `
## Fase 2: Controle do Dispositivo

O usuário pode solicitar:
- **Ligações**: "Ligar para João" (precisa do contato ou número)
- **SMS**: "Enviar SMS para João: Olá, tudo bem?"
- **Volume**: "Aumentar volume", "Volume 8"
- **Lanterna**: "Ligar lanterna", "Desligar lanterna"

Se o usuário mencionar um contato por nome (ex: "João"), você deve pedir o número de telefone completo.
Confirme sempre antes de executar ações críticas como ligações e SMS.
`;
