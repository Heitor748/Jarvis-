import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transcribeAudio, chatCompletion, ChatMessage } from '../services/groqService';
import { speakWithElevenLabs, stopElevenLabs } from '../services/elevenLabsService';
import { JARVIS_SYSTEM_PROMPT, WAKE_WORDS } from '../constants/personality';
import { pickModel, ModelMode } from '../constants/models';

export type JarvisState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const API_KEY_STORAGE = '@jarvis_groq_api_key';
const ELEVEN_KEY_STORAGE = '@jarvis_eleven_api_key';
const MODEL_MODE_STORAGE = '@jarvis_model_mode';

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

// Fala usando ElevenLabs se houver chave; senao (ou em caso de erro) usa a
// voz do aparelho. Nunca lanca — sempre tenta deixar o JARVIS falar.
async function speak(text: string, elevenKey: string): Promise<void> {
  if (elevenKey) {
    try {
      await speakWithElevenLabs(text, elevenKey);
      return;
    } catch {
      // cai para a voz do aparelho
    }
  }
  await speakWithDevice(text);
}

export function useJarvis() {
  const [state, setState] = useState<JarvisState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKeyState] = useState('');
  const [elevenKey, setElevenKeyState] = useState('');
  const [modelMode, setModelModeState] = useState<ModelMode>('auto');
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const historyRef = useRef<ChatMessage[]>([]);
  const stateRef = useRef<JarvisState>('idle');
  const elevenKeyRef = useRef('');
  const modelModeRef = useRef<ModelMode>('auto');

  stateRef.current = state;
  elevenKeyRef.current = elevenKey;
  modelModeRef.current = modelMode;

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(API_KEY_STORAGE),
      AsyncStorage.getItem(ELEVEN_KEY_STORAGE),
      AsyncStorage.getItem(MODEL_MODE_STORAGE),
    ]).then(([gk, ek, mm]) => {
      if (gk) setApiKeyState(gk);
      if (ek) setElevenKeyState(ek);
      if (mm) setModelModeState(mm as ModelMode);
      setIsReady(true);
    });
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    const trimmed = key.trim();
    await AsyncStorage.setItem(API_KEY_STORAGE, trimmed);
    setApiKeyState(trimmed);
  }, []);

  const saveElevenKey = useCallback(async (key: string) => {
    const trimmed = key.trim();
    await AsyncStorage.setItem(ELEVEN_KEY_STORAGE, trimmed);
    setElevenKeyState(trimmed);
  }, []);

  const saveModelMode = useCallback(async (mode: ModelMode) => {
    await AsyncStorage.setItem(MODEL_MODE_STORAGE, mode);
    setModelModeState(mode);
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

  const getKey = useCallback(async (): Promise<string> => {
    if (apiKey) return apiKey;
    const stored = await AsyncStorage.getItem(API_KEY_STORAGE);
    return stored ?? '';
  }, [apiKey]);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setState('error');
    setTimeout(() => {
      setError('');
      setState('idle');
    }, 4000);
  }, []);

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

    const key = await getKey();
    if (!key) {
      handleError('Configure a API key do Groq nas configurações');
      return;
    }

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error('Nenhum áudio gravado');

      const transcript = await transcribeAudio(uri, key);
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

      const toSend: ChatMessage[] = [
        { role: 'system', content: JARVIS_SYSTEM_PROMPT },
        ...historyRef.current.slice(-12),
      ];

      const model = pickModel(command, modelModeRef.current);
      const reply = await chatCompletion(toSend, key, model.id);
      if (!reply) throw new Error('Resposta vazia do servidor');

      addMessage('assistant', reply);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];

      setState('speaking');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      await speak(reply, elevenKeyRef.current);
      setState('idle');
    } catch (e) {
      handleError(e instanceof Error ? e.message : 'Erro ao processar voz');
    }
  }, [getKey, addMessage, handleError]);

  const sendText = useCallback(async (text: string) => {
    if (stateRef.current !== 'idle' || !text.trim()) return;

    const key = await getKey();
    if (!key) {
      handleError('Configure a API key do Groq nas configurações');
      return;
    }

    setError('');
    setState('processing');

    const command = stripWakeWord(text.trim());
    const userText = command || text.trim();

    addMessage('user', userText);
    historyRef.current = [...historyRef.current, { role: 'user', content: userText }];

    try {
      const toSend: ChatMessage[] = [
        { role: 'system', content: JARVIS_SYSTEM_PROMPT },
        ...historyRef.current.slice(-12),
      ];

      const model = pickModel(userText, modelModeRef.current);
      const reply = await chatCompletion(toSend, key, model.id);
      if (!reply) throw new Error('Resposta vazia do servidor');

      addMessage('assistant', reply);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];

      setState('speaking');
      await speak(reply, elevenKeyRef.current);
      setState('idle');
    } catch (e) {
      handleError(e instanceof Error ? e.message : 'Erro ao processar texto');
    }
  }, [getKey, addMessage, handleError]);

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
    elevenKey,
    modelMode,
    error,
    isReady,
    saveApiKey,
    saveElevenKey,
    saveModelMode,
    startListening,
    stopListening,
    sendText,
    stopSpeaking,
    clearHistory,
    toggleListening,
  };
}
