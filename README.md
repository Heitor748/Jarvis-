# JARVIS — Assistente de Voz Pessoal

> "Just A Rather Very Intelligent System"

Assistente de voz estilo Iron Man para Android, construído com React Native + Expo e IA via Groq (Llama 4).

## Fases de Desenvolvimento

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 | ✅ **ATUAL** | Base visual holográfica + voz + Groq |
| 2 | ⏳ | Controle do celular (ligações, SMS, volume, lanterna) |
| 3 | ⏳ | WhatsApp (ler, sugerir, enviar) |
| 4 | ⏳ | Negócios (despesas, equipe, financeiro) |
| 5 | ⏳ | IA proativa (briefing diário, alertas) |
| 6 | ⏳ | Samsung Galaxy AI + APK final |

## Stack

- **Framework**: React Native + Expo SDK 52
- **IA Chat**: Groq API — Llama 4 Scout
- **Voz → Texto**: Groq Whisper Large v3 Turbo
- **Texto → Voz**: expo-speech (PT-BR)
- **Animações**: react-native-reanimated 3
- **Gráficos**: react-native-svg

## Configuração (Fase 1)

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go no Samsung Galaxy
- Chave de API do Groq: [console.groq.com](https://console.groq.com)

### Instalação
```bash
npm install
npx expo start
```

Escanear o QR code com o Expo Go no celular.

### API Key
Na primeira execução, a tela de configurações abrirá automaticamente.  
Cole sua `gsk_...` chave do Groq e salve.

## Uso

| Ação | Resultado |
|------|-----------|
| Toque no orb | Inicia/para gravação de voz |
| Diga "JARVIS [comando]" | Wake word detectado automaticamente |
| Digite na barra inferior | Modo texto direto |
| ⚙ botão | Configurações (API key) |
| ⌫ botão | Limpar histórico |

## Estrutura do Projeto

```
app/
  _layout.tsx       # Root layout (Expo Router)
  index.tsx         # Tela principal
components/
  JarvisOrb.tsx     # Orb holográfico animado (SVG + Reanimated)
  ChatBubble.tsx    # Bolhas de mensagem
  StatusHeader.tsx  # Barra superior de status
  InputBar.tsx      # Barra de input (voz + texto)
  SettingsModal.tsx # Modal de configurações
  ScanLines.tsx     # Efeito de scan lines
services/
  groqService.ts    # Groq API (chat + transcrição)
hooks/
  useJarvis.ts      # Lógica central do assistente
constants/
  theme.ts          # Cores e fontes holográficas
  personality.ts    # System prompt e wake words
```
