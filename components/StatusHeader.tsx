import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { JarvisState } from '../hooks/useJarvis';
import { colors, fontFamily } from '../constants/theme';

interface Props {
  state: JarvisState;
  messageCount: number;
  onSettings: () => void;
  onClear: () => void;
}

const STATUS_TEXT: Record<JarvisState, string> = {
  idle: '● ONLINE',
  listening: '◉ GRAVANDO',
  processing: '◌ PENSANDO',
  speaking: '◎ FALANDO',
  error: '✕ ERRO',
};

const STATUS_COLOR: Record<JarvisState, string> = {
  idle: colors.idle,
  listening: colors.listening,
  processing: colors.processing,
  speaking: colors.speaking,
  error: colors.error,
};

export function StatusHeader({ state, messageCount, onSettings, onClear }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>JARVIS</Text>
        <Text style={styles.version}>v1.0 · FASE 1</Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.status, { color: STATUS_COLOR[state] }]}>
          {STATUS_TEXT[state]}
        </Text>
      </View>

      <View style={styles.right}>
        {messageCount > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.iconBtn}>
            <Text style={styles.iconText}>⌫</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onSettings} style={styles.iconBtn}>
          <Text style={styles.iconText}>⚙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  left: {
    flex: 1,
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    fontFamily,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  version: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily,
    letterSpacing: 2,
    marginTop: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  status: {
    fontSize: 10,
    fontFamily,
    letterSpacing: 2,
    fontWeight: '600',
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  iconText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
