import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useJarvis } from '../hooks/useJarvis';
import { JarvisOrb } from '../components/JarvisOrb';
import { ChatBubble } from '../components/ChatBubble';
import { StatusHeader } from '../components/StatusHeader';
import { InputBar } from '../components/InputBar';
import { SettingsModal } from '../components/SettingsModal';
import { ScanLines } from '../components/ScanLines';
import { colors, fontFamily } from '../constants/theme';
import { modelLabelForMode } from '../constants/models';

export default function HomeScreen() {
  const {
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
    sendText,
    toggleListening,
    clearHistory,
  } = useJarvis();

  const [showSettings, setShowSettings] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const errorOpacity = useRef(new RNAnimated.Value(0)).current;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Show settings on first launch if no API key
  useEffect(() => {
    if (isReady && !apiKey) {
      setShowSettings(true);
    }
  }, [isReady, apiKey]);

  // Animate error banner
  useEffect(() => {
    if (error) {
      RNAnimated.sequence([
        RNAnimated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.delay(3000),
        RNAnimated.timing(errorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#000814', '#000d1a', '#000814']}
        style={StyleSheet.absoluteFill}
      />
      <ScanLines />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <StatusHeader
          state={state}
          messageCount={messages.length}
          onSettings={() => setShowSettings(true)}
          onClear={clearHistory}
        />

        {/* Error banner */}
        <RNAnimated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </RNAnimated.View>

        {/* Orb section */}
        <View style={styles.orbSection}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />

          <JarvisOrb state={state} onPress={toggleListening} />

          {/* System info */}
          <View style={styles.sysInfo}>
            <Text style={styles.sysText}>GROQ · {modelLabelForMode(modelMode)}</Text>
            <Text style={styles.sysText}>{elevenKey ? '🎙 VOZ HD' : '🔊 VOZ PADRÃO'}</Text>
            <Text style={styles.sysText}>
              {apiKey ? '🔑 OK' : '⚠ SEM CHAVE'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HISTÓRICO</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Chat */}
        <FlatList
          ref={flatListRef}
          style={styles.chat}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Diga "JARVIS" ou toque no orb para começar.
              </Text>
              <Text style={styles.emptyChatSub}>
                Você também pode digitar na barra abaixo.
              </Text>
            </View>
          }
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <InputBar state={state} onSend={sendText} onMic={toggleListening} />
      </KeyboardAvoidingView>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        currentKey={apiKey}
        elevenKey={elevenKey}
        modelMode={modelMode}
        onSave={saveApiKey}
        onSaveEleven={saveElevenKey}
        onSaveModelMode={saveModelMode}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: colors.error + '22',
    borderWidth: 1,
    borderColor: colors.error + '66',
    marginHorizontal: 12,
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily,
  },
  orbSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cornerTL: {
    top: 10,
    left: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.border,
  },
  cornerTR: {
    top: 10,
    right: 20,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  sysInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  sysText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily,
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily,
    letterSpacing: 3,
    marginHorizontal: 10,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  emptyChatText: {
    color: colors.textSecondary,
    fontFamily,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyChatSub: {
    color: colors.textMuted,
    fontFamily,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
