import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { Settings2, X, Check } from 'lucide-react-native';
import { GlassButton } from '../common/GlassButton';

interface MachineSettingsModalProps {
  visible: boolean;
  exerciseName: string;
  initialSettings?: string | null;
  onClose: () => void;
  onSave: (settings: string) => void;
}

export const MachineSettingsModal: React.FC<MachineSettingsModalProps> = ({
  visible,
  exerciseName,
  initialSettings,
  onClose,
  onSave,
}) => {
  const [settingsText, setSettingsText] = useState('');

  useEffect(() => {
    if (visible) {
      setSettingsText(initialSettings || '');
    }
  }, [visible, initialSettings]);

  const handleSave = () => {
    onSave(settingsText.trim());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.glassCard}>
          <View style={styles.glassReflectionTop} />
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Settings2 color={Colors.neonGreen} size={18} style={{ marginRight: 6 }} />
              <Text style={styles.title}>RÉGLAGES MACHINE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeGlassBtn}>
              <X color={Colors.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <Text style={styles.exoName}>{exerciseName}</Text>
          <Text style={styles.description}>
            Note tes réglages (ex : Cran de siège 4, Dossier incliné 2, Hauteur de poulie 6...)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : Siège 3, Poulie 5, Cale 2"
            placeholderTextColor={Colors.textMuted}
            value={settingsText}
            onChangeText={setSettingsText}
            multiline={true}
            numberOfLines={3}
            autoFocus={true}
          />

          <View style={styles.actionsRow}>
            <GlassButton
              title="Annuler"
              variant="glass"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <GlassButton
              title="Enregistrer"
              variant="neon"
              icon={<Check color={Colors.neonGreen} size={16} />}
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 0.5,
  },
  closeGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.full,
  },
  exoName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
