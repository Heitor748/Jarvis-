import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { JarvisState } from '../hooks/useJarvis';
import { colors, fontFamily } from '../constants/theme';

interface Props {
  state: JarvisState;
  onSend: (text: string) => void;
  onMic: () => void;
}

export function InputBar({ state, onSend, onMic }: Props) {
  const [input, setInput] = useState('');

  const busy = state !== 'idle';

  function handleSend() {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    Keyboard.dismiss();
    onSend(text);
  }

  const micLabel: Record<JarvisState, string> = {
    idle: '🎤',
    listening: '⏹',
    processing: '⏳',
    speaking: '⏸',
    error: '🎤',
  };

  const micColor: Record<JarvisState, string> = {
    idle: colors.primary,
    listening: colors.listening,
    processing: colors.processing,
    speaking: colors.speaking,
    error: colors.error,
  };

  return (
    <View style={styles.container}>
      {/* Mic button */}
      <TouchableOpacity
        onPress={onMic}
        style={[styles.micBtn, { borderColor: micColor[state] }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.micIcon, { color: micColor[state] }]}>
          {micLabel[state]}
        </Text>
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Digite um comando..."
        placeholderTextColor={colors.textMuted}
        editable={!busy}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline={false}
      />

      {/* Send button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={!input.trim() || busy}
        style={[
          styles.sendBtn,
          { borderColor: input.trim() && !busy ? colors.primary : colors.border },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.sendIcon,
            { color: input.trim() && !busy ? colors.primary : colors.textMuted },
          ]}
        >
          ▶
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    gap: 8,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  micIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily,
    fontSize: 13,
    backgroundColor: colors.bgCard,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  sendIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
