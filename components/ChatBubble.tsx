import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../hooks/useJarvis';
import { colors, fontFamily } from '../constants/theme';

interface Props {
  message: Message;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      {!isUser && (
        <View style={styles.avatarBot}>
          <Text style={styles.avatarText}>J</Text>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.label, { color: isUser ? colors.textSecondary : colors.primary }]}>
          {isUser ? 'VOCÊ' : 'JARVIS'}
        </Text>
        <Text style={[styles.content, { color: isUser ? colors.textSecondary : colors.text }]}>
          {message.content}
        </Text>
        <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
      </View>

      {isUser && (
        <View style={styles.avatarUser}>
          <Text style={styles.avatarText}>U</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
    backgroundColor: colors.bgCard,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 4,
    backgroundColor: colors.bgCard,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '76%',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  bubbleBot: {
    backgroundColor: colors.botBubble,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  bubbleUser: {
    backgroundColor: colors.userBubble,
    borderColor: colors.border,
    borderRightWidth: 2,
    borderRightColor: colors.textSecondary,
  },
  label: {
    fontSize: 9,
    fontFamily,
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    fontFamily,
    lineHeight: 20,
  },
  time: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily,
    marginTop: 5,
    textAlign: 'right',
  },
});
