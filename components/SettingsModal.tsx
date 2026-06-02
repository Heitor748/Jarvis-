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
  ScrollView,
} from 'react-native';
import { colors, fontFamily } from '../constants/theme';
import { ProviderMode } from '../constants/providers';

interface Props {
  visible: boolean;
  groqKey: string;
  flowKey: string;
  agnesKey: string;
  agnesConfig: { baseUrl: string; model: string };
  elevenKey: string;
  providerMode: ProviderMode;
  onSaveGroq: (key: string) => void;
  onSaveFlow: (key: string) => void;
  onSaveAgnes: (key: string, baseUrl: string, model: string) => void;
  onSaveEleven: (key: string) => void;
  onSaveProviderMode: (mode: ProviderMode) => void;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { mode: ProviderMode; label: string; desc: string }[] = [
  { mode: 'auto', label: 'AUTO', desc: 'Escolhe sozinho' },
  { mode: 'groq', label: 'GROQ', desc: 'Rápido' },
  { mode: 'flow', label: 'FLOW', desc: 'DeepSeek' },
  { mode: 'agnes', label: 'AGNES', desc: 'Custom' },
];

function mask(v: string): string {
  if (!v) return '';
  if (v.length <= 8) return '••••';
  return v.slice(0, 4) + '••••••••' + v.slice(-4);
}

export function SettingsModal({
  visible,
  groqKey,
  flowKey,
  agnesKey,
  agnesConfig,
  elevenKey,
  providerMode,
  onSaveGroq,
  onSaveFlow,
  onSaveAgnes,
  onSaveEleven,
  onSaveProviderMode,
  onClose,
}: Props) {
  const [groq, setGroq] = useState(groqKey);
  const [flow, setFlow] = useState(flowKey);
  const [agnes, setAgnes] = useState(agnesKey);
  const [agnesUrl, setAgnesUrl] = useState(agnesConfig.baseUrl);
  const [agnesModel, setAgnesModel] = useState(agnesConfig.model);
  const [eleven, setEleven] = useState(elevenKey);
  const [reveal, setReveal] = useState(false);

  function handleSave() {
    onSaveGroq(groq.trim());
    onSaveFlow(flow.trim());
    onSaveAgnes(agnes.trim(), agnesUrl.trim(), agnesModel.trim());
    onSaveEleven(eleven.trim());
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>⚙ CONFIGURAÇÕES</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => setReveal((v) => !v)} style={styles.revealBtn}>
                  <Text style={styles.revealIcon}>{reveal ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
              {/* Seletor de provedor */}
              <Text style={styles.sectionLabel}>CÉREBRO ATIVO</Text>
              <View style={styles.grid}>
                {PROVIDER_OPTIONS.map((opt) => {
                  const active = opt.mode === providerMode;
                  return (
                    <TouchableOpacity
                      key={opt.mode}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => onSaveProviderMode(opt.mode)}
                    >
                      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.chipDesc}>{opt.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.divider} />

              {/* Groq */}
              <Text style={styles.sectionLabel}>GROQ API KEY (voz + chat)</Text>
              <Text style={styles.hint}>
                Obrigatória (transcreve sua voz).{' '}
                <Text style={styles.link} onPress={() => Linking.openURL('https://console.groq.com')}>
                  console.groq.com
                </Text>
              </Text>
              <TextInput
                style={styles.input}
                value={reveal ? groq : mask(groq)}
                onChangeText={setGroq}
                onFocus={() => setReveal(true)}
                placeholder="gsk_..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.divider} />

              {/* SiliconFlow */}
              <Text style={styles.sectionLabel}>SILICONFLOW API KEY</Text>
              <Text style={styles.hint}>
                DeepSeek-V3 (raciocínio).{' '}
                <Text style={styles.link} onPress={() => Linking.openURL('https://siliconflow.com')}>
                  siliconflow.com
                </Text>
              </Text>
              <TextInput
                style={styles.input}
                value={reveal ? flow : mask(flow)}
                onChangeText={setFlow}
                onFocus={() => setReveal(true)}
                placeholder="sk-..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.divider} />

              {/* Agnes (custom) */}
              <Text style={styles.sectionLabel}>AGNES (API CUSTOM)</Text>
              <Text style={styles.hint}>Compatível com OpenAI. Informe URL base, chave e modelo.</Text>
              <TextInput
                style={styles.input}
                value={agnesUrl}
                onChangeText={setAgnesUrl}
                placeholder="https://api.agnes.../v1"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TextInput
                style={[styles.input, styles.inputSpaced]}
                value={reveal ? agnes : mask(agnes)}
                onChangeText={setAgnes}
                onFocus={() => setReveal(true)}
                placeholder="chave da API"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={[styles.input, styles.inputSpaced]}
                value={agnesModel}
                onChangeText={setAgnesModel}
                placeholder="nome do modelo (ex.: gpt-4o)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.divider} />

              {/* ElevenLabs */}
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
              <TextInput
                style={styles.input}
                value={reveal ? eleven : mask(eleven)}
                onChangeText={setEleven}
                onFocus={() => setReveal(true)}
                placeholder="sk_..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.footerNote}>Whisper Large v3 Turbo · transcrição (Groq)</Text>
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
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
  kav: { width: '100%', maxWidth: 420 },
  card: {
    width: '100%',
    maxHeight: '85%',
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
    marginBottom: 10,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  revealBtn: { padding: 2 },
  revealIcon: { fontSize: 16 },
  title: {
    color: colors.primary,
    fontSize: 14,
    fontFamily,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  closeBtn: { color: colors.textSecondary, fontSize: 18, padding: 4 },
  scroll: { marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily,
    letterSpacing: 3,
    marginBottom: 6,
  },
  hint: { color: colors.textSecondary, fontSize: 12, fontFamily, marginBottom: 8 },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  input: {
    height: 44,
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  inputSpaced: { marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  chipLabel: {
    color: colors.textSecondary,
    fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  chipLabelActive: { color: colors.primary },
  chipDesc: { color: colors.textMuted, fontFamily, fontSize: 9, marginTop: 2 },
  footerNote: { color: colors.textMuted, fontFamily, fontSize: 10, marginTop: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textMuted, fontFamily, fontSize: 12, letterSpacing: 2 },
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
  saveText: {
    color: colors.primary,
    fontFamily,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});
