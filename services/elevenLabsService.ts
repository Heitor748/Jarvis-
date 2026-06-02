import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const ELEVEN_BASE = 'https://api.elevenlabs.io/v1';

// Voz grave/calma de "mordomo" estilo JARVIS. O modelo multilingue v2
// fala portugues muito bem. O usuario pode trocar o voiceId nas configuracoes.
export const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // "Daniel" — grave, refinado
export const ELEVEN_MODEL = 'eleven_multilingual_v2';

let currentSound: Audio.Sound | null = null;

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Converte ArrayBuffer -> base64 de forma confiavel no React Native.
 * (O caminho blob + FileReader.readAsDataURL e instavel no Android/RN.)
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    result += B64[bytes[i] >> 2];
    result += B64[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    result += B64[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    result += B64[bytes[i + 2] & 63];
  }
  if (i < bytes.length) {
    result += B64[bytes[i] >> 2];
    if (i === bytes.length - 1) {
      result += B64[(bytes[i] & 3) << 4];
      result += '==';
    } else {
      result += B64[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      result += B64[(bytes[i + 1] & 15) << 2];
      result += '=';
    }
  }
  return result;
}

/**
 * Sintetiza o texto com a voz do ElevenLabs e toca o audio.
 * Lanca erro descritivo se a API falhar — quem chama decide o fallback.
 */
export async function speakWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<void> {
  const res = await fetch(
    `${ELEVEN_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
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
    }
  );

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 180)}`);
  }

  const buffer = await res.arrayBuffer();
  if (!buffer || buffer.byteLength < 200) {
    throw new Error('ElevenLabs retornou áudio vazio');
  }

  const base64 = arrayBufferToBase64(buffer);
  const path = `${FileSystem.cacheDirectory}jarvis-voice.mp3`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });

  if (currentSound) {
    try { await currentSound.unloadAsync(); } catch {}
    currentSound = null;
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri: path },
    { shouldPlay: true }
  );
  currentSound = sound;

  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) finish();
      if (!status.isLoaded && (status as any).error) finish();
    });
    setTimeout(finish, 60000);
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
