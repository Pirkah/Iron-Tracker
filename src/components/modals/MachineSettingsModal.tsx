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
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Settings2 color={Colors.neonGreen} size={20} style={{ marginRight: 8 }} />
              <Text style={styles.title}>RÉGLAGES MACHINE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={Colors.textSecondary} size={22} />
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
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Check color={Colors.textDark} size={18} style={{ marginRight: 4 }} />
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
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
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  exoName: {
    fontSize: 18,
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
    fontSize: 15,
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
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.textDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
