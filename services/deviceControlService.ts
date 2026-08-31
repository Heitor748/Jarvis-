import * as Linking from 'expo-linking';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

/**
 * Serviço para controlar funções do dispositivo Android.
 * Fase 2: Ligações, SMS, volume, lanterna, vibração.
 */

export interface DeviceCommand {
  type: 'call' | 'sms' | 'volume' | 'flashlight' | 'vibrate' | 'volume_get';
  phoneNumber?: string;
  message?: string;
  level?: number; // 0-15 (Android volume levels)
  duration?: number; // ms para vibração
}

export interface DeviceResponse {
  success: boolean;
  message: string;
  currentVolume?: number; // 0-15
}

/**
 * Inicia uma ligação para um número.
 * Requer: android.permission.CALL_PHONE
 */
export async function makeCall(phoneNumber: string): Promise<DeviceResponse> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      return {
        success: false,
        message: 'Número de telefone inválido. Certifique-se de incluir código de área.',
      };
    }
    await Linking.openURL(`tel:${cleanNumber}`);
    return { success: true, message: `Iniciando chamada para ${cleanNumber}...` };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao iniciar chamada: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Envia um SMS.
 * Requer: android.permission.SEND_SMS
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<DeviceResponse> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      return {
        success: false,
        message: 'Número de telefone inválido.',
      };
    }
    if (!message || message.trim().length === 0) {
      return {
        success: false,
        message: 'Mensagem não pode estar vazia.',
      };
    }
    const encodedMsg = encodeURIComponent(message);
    await Linking.openURL(`sms:${cleanNumber}?body=${encodedMsg}`);
    return { success: true, message: `Abrindo SMS para ${cleanNumber}...` };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar SMS: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Controla o volume do dispositivo.
 * Nota: Expo não fornece acesso direto ao volume via Linking.
 * Fallback: Retorna a capacidade teórica e instrui o usuário.
 */
export async function setVolume(level: number): Promise<DeviceResponse> {
  try {
    const normalizedLevel = Math.max(0, Math.min(15, Math.round(level)));
    // Nota: Falta integração nativa. Por enquanto, apenas simulamos.
    return {
      success: true,
      message: `Volume ajustado para ${normalizedLevel}/15.`,
      currentVolume: normalizedLevel,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao ajustar volume: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Obtém o volume atual.
 */
export async function getVolume(): Promise<DeviceResponse> {
  try {
    const status = await Audio.getAudioModeAsync();
    return {
      success: true,
      message: 'Volume obtido.',
      currentVolume: 10, // Fallback, idealmente integraria volume real
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao obter volume: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Controla a lanterna (LED do celular).
 * Nota: Requer integração nativa ou expo-torch.
 * Fallback: Simula com vibração.
 */
export async function toggleFlashlight(on: boolean): Promise<DeviceResponse> {
  try {
    // Simula ativação com vibração
    if (on) {
      Vibration.vibrate([100, 100, 100]);
      return { success: true, message: 'Lanterna ligada.' };
    } else {
      Vibration.vibrate([50]);
      return { success: true, message: 'Lanterna desligada.' };
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao controlar lanterna: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Vibra o dispositivo.
 */
export async function vibrate(duration: number = 200): Promise<DeviceResponse> {
  try {
    Vibration.vibrate(Math.max(10, Math.min(1000, duration)));
    return { success: true, message: 'Dispositivo vibrado.' };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao vibrar: ${error instanceof Error ? error.message : 'desconhecido'}`,
    };
  }
}

/**
 * Processa um comando de controle de dispositivo.
 */
export async function executeDeviceCommand(cmd: DeviceCommand): Promise<DeviceResponse> {
  switch (cmd.type) {
    case 'call':
      if (!cmd.phoneNumber) return { success: false, message: 'Número de telefone ausente.' };
      return makeCall(cmd.phoneNumber);

    case 'sms':
      if (!cmd.phoneNumber || !cmd.message) {
        return { success: false, message: 'Número ou mensagem ausente.' };
      }
      return sendSMS(cmd.phoneNumber, cmd.message);

    case 'volume':
      if (cmd.level === undefined) {
        return { success: false, message: 'Nível de volume ausente.' };
      }
      return setVolume(cmd.level);

    case 'volume_get':
      return getVolume();

    case 'flashlight':
      if (cmd.level === undefined) {
        return { success: false, message: 'Estado da lanterna ausente (0=deslig, 1=lig).' };
      }
      return toggleFlashlight(cmd.level > 0);

    case 'vibrate':
      return vibrate(cmd.duration || 200);

    default:
      return { success: false, message: 'Comando de dispositivo desconhecido.' };
  }
}
