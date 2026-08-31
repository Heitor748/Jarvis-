# JARVIS — Assistente de Voz Pessoal

> "Just A Rather Very Intelligent System"

Assistente de voz estilo Iron Man para Android, construído com React Native + Expo e IA via Groq (Llama 4).

## Fases de Desenvolvimento

| Fase | Status | Descrição |
|------|--------|----------|
| 1 | ✅ **CONCLUÍDA** | Base visual holográfica + voz + Groq |
| 2 | 🚀 **DESENVOLVENDO** | Controle do celular (ligações, SMS, volume, lanterna) |
| 3 | ⏳ | WhatsApp (ler, sugerir, enviar) |
| 4 | ⏳ | Negócios (despesas, equipe, financeiro) |
| 5 | ⏳ | IA proativa (briefing diário, alertas) |
| 6 | ⏳ | Samsung Galaxy AI + APK final |

## Stack

- **Framework**: React Native + Expo SDK 52
- **IA Chat**: Groq API — Llama 4 Scout
- **Voz → Texto**: Groq Whisper Large v3 Turbo
- **Texto → Voz**: expo-speech + ElevenLabs (PT-BR)
- **Animações**: react-native-reanimated 3
- **Gráficos**: react-native-svg
- **Controle de Dispositivo**: Expo Linking + Audio (Fase 2+)

## Configuração (Fases 1-2)

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go no Samsung Galaxy ou Android Device
- Chave de API do Groq: [console.groq.com](https://console.groq.com)
- (Opcional) Chave de API do ElevenLabs para voz HD: [elevenlabs.io](https://elevenlabs.io)

### Instalação
```bash
git clone https://github.com/Heitor748/Jarvis-.git
cd Jarvis-
npm install
npx expo start
```

Escanear o QR code com o Expo Go no celular.

### API Key
Na primeira execução, a tela de configurações abrirá automaticamente.  
Cole sua `gsk_...` chave do Groq e salve.

## Uso

### Fase 1: Voz & Chat
| Ação | Resultado |
|------|----------|
| Toque no orb | Inicia/para gravação de voz |
| Diga "JARVIS [comando]" | Wake word detectado automaticamente |
| Digite na barra inferior | Modo texto direto |
| ⚙ botão | Configurações (API key) |
| ⌫ botão | Limpar histórico |

### Fase 2: Controle do Dispositivo
| Comando | Exemplo | Resultado |
|---------|---------|----------|
| Ligação | "Jarvis, ligar para João" | Inicia chamada telefônica |
| SMS | "Jarvis, enviar SMS para João: Olá!" | Abre app SMS com mensagem |
| Volume | "Aumentar volume" / "Volume 8" | Ajusta volume do aparelho |
| Lanterna | "Ligar lanterna" / "Desligar lanterna" | Controla LED do celular |

## Estrutura do Projeto

```
app/
  _layout.tsx           # Root layout (Expo Router)
  index.tsx             # Tela principal
components/
  JarvisOrb.tsx         # Orb holográfico animado (SVG + Reanimated)
  ChatBubble.tsx        # Bolhas de mensagem
  StatusHeader.tsx      # Barra superior de status
  InputBar.tsx          # Barra de input (voz + texto)
  SettingsModal.tsx     # Modal de configurações
  ScanLines.tsx         # Efeito de scan lines
services/
  groqService.ts        # Groq API (chat + transcrição)
  elevenLabsService.ts  # ElevenLabs TTS (voz HD)
  deviceControlService.ts # Controle de dispositivo (Fase 2)
hooks/
  useJarvis.ts          # Lógica central do assistente
constants/
  theme.ts              # Cores e fontes holográficas
  personality.ts        # System prompt e wake words
  deviceCommands.ts     # Padrões de reconhecimento de comandos (Fase 2)
```

## Roadmap

### Fase 2: Controle do Celular ✨
- [x] Service para ligações (tel:// linking)
- [x] Service para SMS (sms:// linking)
- [x] Controle de volume (integração nativa planejada)
- [x] Controle de lanterna (integração nativa planejada)
- [ ] UI para confirmar ações críticas
- [ ] Integração com contatos do dispositivo
- [ ] Histórico de ligações/SMS

### Fase 3: WhatsApp Integration
- [ ] Ler últimas mensagens
- [ ] Sugerir respostas automáticas
- [ ] Enviar mensagens
- [ ] Notificações de mensagens em tempo real

### Fase 4: Negócios
- [ ] Rastreamento de despesas
- [ ] Gerenciamento de equipe
- [ ] Relatórios financeiros
- [ ] Integração com APIs de banco

### Fase 5: IA Proativa
- [ ] Briefing diário ao acordar
- [ ] Alertas de compromissos
- [ ] Previsão do tempo
- [ ] Notícias personalizadas

### Fase 6: Publicação
- [ ] Integração Samsung Galaxy AI
- [ ] Build e publicação APK final
- [ ] Play Store release

## Contribuindo

Sinta-se livre para abrir issues e pull requests! Este é um projeto em desenvolvimento ativo.

## Licença

MIT
