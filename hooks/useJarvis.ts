import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transcribeAudio, chatCompletion, ChatMessage } from '../services/groqService';
import { speakWithElevenLabs, stopElevenLabs } from '../services/elevenLabsService';
import { JARVIS_SYSTEM_PROMPT, WAKE_WORDS } from '../constants/personality';
import {
  PROVIDERS,
  ProviderMode,
  ResolvedProvider,
  pickProvider,
} from '../constants/providers';

export type JarvisState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Chaves de armazenamento.
const STORE = {
  groqKey: '@jarvis_groq_api_key',
  flowKey: '@jarvis_flow_api_key',
  agnesKey: '@jarvis_agnes_api_key',
  agnesBaseUrl: '@jarvis_agnes_base_url',
  agnesModel: '@jarvis_agnes_model',
  elevenKey: '@jarvis_eleven_api_key',
  providerMode: '@jarvis_provider_mode',
};

export interface AgnesConfig {
  baseUrl: string;
  model: string;
}

function stripWakeWord(text: string): string {
  const lower = text.toLowerCase().trim();
  for (const word of WAKE_WORDS) {
    if (lower.startsWith(word)) {
      return text.slice(word.length).trim();
    }
  }
  return text.trim();
}

// Voz nativa do aparelho (fallback): masculina, grave e pausada.
async function speakWithDevice(text: string): Promise<void> {
  return Promise.race([
    new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: 'pt-BR',
        pitch: 0.85,
        rate: 0.9,
        onDone: resolve,
        onError: () => resolve(),
        onStopped: resolve,
      });
    }),
    new Promise<void>((resolve) => setTimeout(resolve, 45000)),
  ]);
}

export function useJarvis() {
  const [state, setState] = useState<JarvisState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKeyState] = useState('');
  const [flowKey, setFlowKeyState] = useState('');
  const [agnesKey, setAgnesKeyState] = useState('');
  const [agnesConfig, setAgnesConfigState] = useState<AgnesConfig>({ baseUrl: '', model: '' });
  const [elevenKey, setElevenKeyState] = useState('');
  const [providerMode, setProviderModeState] = useState<ProviderMode>('auto');
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const historyRef = useRef<ChatMessage[]>([]);
  const stateRef = useRef<JarvisState>('idle');

  // Refs com os valores atuais para uso dentro de callbacks async.
  const cfg = useRef({
    groqKey: '',
    flowKey: '',
    agnesKey: '',
    agnesBaseUrl: '',
    agnesModel: '',
    elevenKey: '',
    providerMode: 'auto' as ProviderMode,
  });

  stateRef.current = state;
  cfg.current = {
    groqKey: apiKey,
    flowKey,
    agnesKey,
    agnesBaseUrl: agnesConfig.baseUrl,
    agnesModel: agnesConfig.model,
    elevenKey,
    providerMode,
  };

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORE.groqKey),
      AsyncStorage.getItem(STORE.flowKey),
      AsyncStorage.getItem(STORE.agnesKey),
      AsyncStorage.getItem(STORE.agnesBaseUrl),
      AsyncStorage.getItem(STORE.agnesModel),
      AsyncStorage.getItem(STORE.elevenKey),
      AsyncStorage.getItem(STORE.providerMode),
    ]).then(([gk, fk, ak, abu, am, ek, pm]) => {
      if (gk) setApiKeyState(gk);
      if (fk) setFlowKeyState(fk);
      if (ak) setAgnesKeyState(ak);
      setAgnesConfigState({ baseUrl: abu ?? '', model: am ?? '' });
      if (ek) setElevenKeyState(ek);
      if (pm) setProviderModeState(pm as ProviderMode);
      setIsReady(true);
    });
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    const t = key.trim();
    await AsyncStorage.setItem(STORE.groqKey, t);
    setApiKeyState(t);
  }, []);

  const saveFlowKey = useCallback(async (key: string) => {
    const t = key.trim();
    await AsyncStorage.setItem(STORE.flowKey, t);
    setFlowKeyState(t);
  }, []);

  const saveAgnes = useCallback(async (key: string, baseUrl: string, model: string) => {
    await AsyncStorage.multiSet([
      [STORE.agnesKey, key.trim()],
      [STORE.agnesBaseUrl, baseUrl.trim()],
      [STORE.agnesModel, model.trim()],
    ]);
    setAgnesKeyState(key.trim());
    setAgnesConfigState({ baseUrl: baseUrl.trim(), model: model.trim() });
  }, []);

  const saveElevenKey = useCallback(async (key: string) => {
    const t = key.trim();
    await AsyncStorage.setItem(STORE.elevenKey, t);
    setElevenKeyState(t);
  }, []);

  const saveProviderMode = useCallback(async (mode: ProviderMode) => {
    await AsyncStorage.setItem(STORE.providerMode, mode);
    setProviderModeState(mode);
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string): Message => {
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setState('error');
    setTimeout(() => {
      setError('');
      setState('idle');
    }, 4500);
  }, []);

  // Mostra um aviso sem travar o fluxo (ex.: ElevenLabs falhou mas a voz do
  // aparelho assumiu).
  const softWarn = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  }, []);

  // Quais provedores estao configurados (tem chave).
  const availability = useCallback(() => {
    const c = cfg.current;
    return {
      groq: !!c.groqKey,
      flow: !!c.flowKey,
      agnes: !!c.agnesKey && !!c.agnesBaseUrl && !!c.agnesModel,
    };
  }, []);

  // Monta a config pronta para chamar a API do provedor escolhido.
  const resolveProvider = useCallback((id: 'groq' | 'flow' | 'agnes'): ResolvedProvider => {
    const c = cfg.current;
    if (id === 'flow') {
      return { id, baseUrl: PROVIDERS.flow.baseUrl, apiKey: c.flowKey, model: PROVIDERS.flow.defaultModel };
    }
    if (id === 'agnes') {
      return { id, baseUrl: c.agnesBaseUrl, apiKey: c.agnesKey, model: c.agnesModel };
    }
    return { id: 'groq', baseUrl: PROVIDERS.groq.baseUrl, apiKey: c.groqKey, model: PROVIDERS.groq.defaultModel };
  }, []);

  // Fala usando ElevenLabs se houver chave; senao (ou em erro) usa a voz do
  // aparelho. Nunca lanca — sempre tenta deixar o JARVIS falar.
  const speak = useCallback(async (text: string) => {
    const ek = cfg.current.elevenKey;
    if (ek) {
      try {
        await speakWithElevenLabs(text, ek);
        return;
      } catch (e) {
        softWarn(`Voz HD indisponível (${e instanceof Error ? e.message : 'erro'}). Usando voz padrão.`);
      }
    }
    await speakWithDevice(text);
  }, [softWarn]);

  // Envia a conversa ao provedor escolhido e retorna a resposta.
  const askLLM = useCallback(async (commandText: string): Promise<string> => {
    const id = pickProvider(commandText, cfg.current.providerMode, availability());
    const provider = resolveProvider(id);
    if (!provider.apiKey) {
      throw new Error('Nenhum provedor de IA configurado. Adicione uma chave nas configurações.');
    }
    const toSend: ChatMessage[] = [
      { role: 'system', content: JARVIS_SYSTEM_PROMPT },
      ...historyRef.current.slice(-12),
    ];
    return chatCompletion(toSend, provider);
  }, [availability, resolveProvider]);

  const startListening = useCallback(async () => {
    if (stateRef.current !== 'idle') return;
    setError('');

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      handleError('Permissão de microfone negada');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setState('listening');
    } catch (e) {
      handleError(`Erro ao iniciar gravação: ${e instanceof Error ? e.message : 'desconhecido'}`);
    }
  }, [handleError]);

  const stopListening = useCallback(async () => {
    if (stateRef.current !== 'listening' || !recordingRef.current) return;

    const rec = recordingRef.current;
    recordingRef.current = null;
    setState('processing');

    if (!cfg.current.groqKey) {
      handleError('Configure a chave do Groq nas configurações (necessária para ouvir você)');
      return;
    }

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error('Nenhum áudio gravado');

      const transcript = await transcribeAudio(uri, cfg.current.groqKey);
      if (!transcript) {
        setState('idle');
        return;
      }

      const command = stripWakeWord(transcript);
      if (!command) {
        setState('idle');
        return;
      }

      addMessage('user', command);
      historyRef.current = [...historyRef.current, { role: 'user', content: command }];

      const reply = await askLLM(command);
      if (!reply) throw new Error('Resposta vazia do servidor');

      addMessage('assistant', reply);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];

      setState('speaking');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      await speak(reply);
      setState('idle');
    } catch (e) {
      handleError(e instanceof Error ? e.message : 'Erro ao processar voz');
    }
  }, [handleError, addMessage, askLLM, speak]);

  const sendText = useCallback(async (text: string) => {
    if (stateRef.current !== 'idle' || !text.trim()) return;

    setError('');
    setState('processing');

    const command = stripWakeWord(text.trim());
    const userText = command || text.trim();

    addMessage('user', userText);
    historyRef.current = [...historyRef.current, { role: 'user', content: userText }];

    try {
      const reply = await askLLM(userText);
      if (!reply) throw new Error('Resposta vazia do servidor');

      addMessage('assistant', reply);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];

      setState('speaking');
      await speak(reply);
      setState('idle');
    } catch (e) {
      handleError(e instanceof Error ? e.message : 'Erro ao processar texto');
    }
  }, [handleError, addMessage, askLLM, speak]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    stopElevenLabs();
    setState('idle');
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
  }, []);

  const toggleListening = useCallback(async () => {
    if (stateRef.current === 'idle') {
      await startListening();
    } else if (stateRef.current === 'listening') {
      await stopListening();
    } else if (stateRef.current === 'speaking') {
      stopSpeaking();
    }
  }, [startListening, stopListening, stopSpeaking]);

  return {
    state,
    messages,
    apiKey,
    flowKey,
    agnesKey,
    agnesConfig,
    elevenKey,
    providerMode,
    error,
    isReady,
    saveApiKey,
    saveFlowKey,
    saveAgnes,
    saveElevenKey,
    saveProviderMode,
    startListening,
    stopListening,
    sendText,
    stopSpeaking,
    clearHistory,
    toggleListening,
  };
}
