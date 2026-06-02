import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { colors, fontFamily } from '../constants/theme';
import { ModelMode } from '../constants/models';

interface Props {
  visible: boolean;
  currentKey: string;
  elevenKey: string;
  modelMode: ModelMode;
  onSave: (key: string) => void;
  onSaveEleven: (key: string) => void;
  onSaveModelMode: (mode: ModelMode) => void;
  onClose: () => void;
}

const MODEL_OPTIONS: { mode: ModelMode; label: string; desc: string }[] = [
  { mode: 'auto', label: 'AUTO', desc: 'Escolhe sozinho' },
  { mode: 'fast', label: 'RÁPIDO', desc: 'Llama 3.1 8B' },
  { mode: 'smart', label: 'POTENTE', desc: 'Llama 3.3 70B' },
  { mode: 'scout', label: 'SCOUT', desc: 'Llama 4' },
];

export function SettingsModal({
  visible,
  currentKey,
  elevenKey,
  modelMode,
  onSave,
  onSaveEleven,
  onSaveModelMode,
  onClose,
}: Props) {
  const [key, setKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [eleven, setEleven] = useState(elevenKey);
  const [showEleven, setShowEleven] = useState(false);

  function handleSave() {
    if (key.trim()) onSave(key.trim());
    onSaveEleven(eleven.trim());
    onClose();
  }

  const masked = key ? key.slice(0, 4) + '••••••••••••••••' + key.slice(-4) : '';
  const elevenMasked = eleven ? eleven.slice(0, 4) + '••••••••••••' + eleven.slice(-4) : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>⚙ CONFIGURAÇÕES</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* API Key section */}
            <Text style={styles.sectionLabel}>GROQ API KEY</Text>
            <Text style={styles.hint}>
              Obtenha sua chave em{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://console.groq.com')}
              >
                console.groq.com
              </Text>
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={showKey ? key : masked}
                onChangeText={setKey}
                onFocus={() => { setShowKey(true); setKey(currentKey); }}
                placeholder="gsk_..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowKey((v) => !v)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {/* Voz ElevenLabs */}
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>VOZ · ELEVENLABS (OPCIONAL)</Text>
            <Text style={styles.hint}>
              Voz premium estilo filme. Sem chave, usa a voz do aparelho.{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://elevenlabs.io/app/settings/api-keys')}
              >
                elevenlabs.io
              </Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={showEleven ? eleven : elevenMasked}
                onChangeText={setEleven}
                onFocus={() => { setShowEleven(true); setEleven(elevenKey); }}
                placeholder="sk_..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowEleven((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showEleven ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {/* Seletor de modelo */}
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>MODELO DE IA</Text>
            <View style={styles.modelGrid}>
              {MODEL_OPTIONS.map((opt) => {
                const active = opt.mode === modelMode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    style={[styles.modelChip, active && styles.modelChipActive]}
                    onPress={() => onSaveModelMode(opt.mode)}
                  >
                    <Text style={[styles.modelChipLabel, active && styles.modelChipLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.modelChipDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.modelText}>Whisper Large v3 Turbo · STT</Text>

            {/* Buttons */}
            <View style={styles.divider} />
            <View style={styles.btnRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, !key.trim() && styles.saveBtnDisabled]}
                disabled={!key.trim()}
              >
                <Text style={styles.saveText}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.primary,
    fontSize: 14,
    fontFamily,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: colors.textSecondary,
    fontSize: 18,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily,
    letterSpacing: 3,
    marginBottom: 6,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily,
    marginBottom: 10,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 8,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily,
    fontSize: 13,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
  modelText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily,
    marginBottom: 4,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  modelChip: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  modelChipLabel: {
    color: colors.textSecondary,
    fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  modelChipLabelActive: {
    color: colors.primary,
  },
  modelChipDesc: {
    color: colors.textMuted,
    fontFamily,
    fontSize: 9,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily,
    fontSize: 12,
    letterSpacing: 2,
  },
  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  saveText: {
    color: colors.primary,
    fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});
