import { Platform } from 'react-native';

export const colors = {
  bg: '#000814',
  bgCard: '#00111f',
  bgCardDark: '#000d1a',

  primary: '#00d4ff',
  primaryDim: '#007799',
  primaryMuted: 'rgba(0, 212, 255, 0.12)',

  glow: 'rgba(0, 212, 255, 0.2)',
  glowMedium: 'rgba(0, 212, 255, 0.4)',
  glowStrong: 'rgba(0, 212, 255, 0.65)',

  text: '#00d4ff',
  textSecondary: 'rgba(0, 212, 255, 0.65)',
  textMuted: 'rgba(0, 212, 255, 0.35)',

  userBubble: '#001a2e',
  botBubble: '#000d1a',

  border: 'rgba(0, 212, 255, 0.18)',
  borderMedium: 'rgba(0, 212, 255, 0.38)',

  // Estado do orb
  idle: '#00d4ff',
  listening: '#00ff88',
  processing: '#cc44ff',
  speaking: '#44aaff',
  error: '#ff3355',
};

export const fontFamily = Platform.select({
  android: 'monospace',
  ios: 'Courier New',
  default: 'monospace',
}) as string;
