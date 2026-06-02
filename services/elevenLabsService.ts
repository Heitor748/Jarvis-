import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const ELEVEN_BASE = 'https://api.elevenlabs.io/v1';

// Voz grave/calma de "mordomo" estilo JARVIS. O modelo multilingue v2
// fala portugues muito bem. O usuario pode trocar o voiceId nas configuracoes.
export const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // "Daniel" — grave, refinado
export const ELEVEN_MODEL = 'eleven_multilingual_v2';

let currentSound: Audio.Sound | null = null;

/** Converte um Blob em string base64 (sem o prefixo data:). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Sintetiza o texto com a voz do ElevenLabs e toca o audio.
 * Lanca erro se a API falhar — quem chama decide o fallback.
 */
export async function speakWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<void> {
  const res = await fetch(`${ELEVEN_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: ELEVEN_MODEL,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs falhou (${res.status}): ${err}`);
  }

  const blob = await res.blob();
  const base64 = await blobToBase64(blob);
  const path = `${FileSystem.cacheDirectory}jarvis-voice.mp3`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });

  // Descarrega qualquer audio anterior.
  if (currentSound) {
    try { await currentSound.unloadAsync(); } catch {}
    currentSound = null;
  }

  const { sound } = await Audio.Sound.createAsync({ uri: path });
  currentSound = sound;

  await new Promise<void>((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        resolve();
      }
      if (!status.isLoaded && status.error) {
        resolve();
      }
    });
    sound.playAsync().catch(() => resolve());
    // Trava de seguranca: 60s maximo.
    setTimeout(resolve, 60000);
  });

  try { await sound.unloadAsync(); } catch {}
  if (currentSound === sound) currentSound = null;
}

/** Para qualquer fala do ElevenLabs em andamento. */
export async function stopElevenLabs(): Promise<void> {
  if (currentSound) {
    try { await currentSound.stopAsync(); } catch {}
    try { await currentSound.unloadAsync(); } catch {}
    currentSound = null;
  }
}
