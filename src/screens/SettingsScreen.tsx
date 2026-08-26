import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
import { StorageService } from '../services/storage';
import {
  Download,
  Upload,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronRight,
  Database,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const handleExportData = async () => {
    try {
      const dataStr = await StorageService.exportAllData();
      await Share.share({
        message: dataStr,
        title: 'Sauvegarde Iron Tracker (JSON)',
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  const handleImportData = async () => {
    if (!importJsonText.trim()) return;
    try {
      const success = await StorageService.importData(importJsonText.trim());
      if (success) {
        Alert.alert('Succès', 'Données restaurées avec succès ! Redémarre l\'application pour actualiser.');
        setShowImportModal(false);
        setImportJsonText('');
      } else {
        Alert.alert('Erreur', 'Format JSON invalide.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de lire les données JSON.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section: Sauvegarde & Données */}
        <Text style={styles.sectionTitle}>DONNÉES & SAUVEGARDE</Text>

        <TouchableOpacity style={styles.menuRow} onPress={handleExportData} activeOpacity={0.7}>
          <View style={styles.menuRowLeft}>
            <Download color={Colors.neonGreen} size={20} />
            <View>
              <Text style={styles.menuRowTitle}>Exporter mes données</Text>
              <Text style={styles.menuRowSub}>Sauvegarde complète en JSON</Text>
            </View>
          </View>
          <ChevronRight color={Colors.textMuted} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setShowImportModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.menuRowLeft}>
            <Upload color={Colors.blueAccent} size={20} />
            <View>
              <Text style={styles.menuRowTitle}>Restaurer une sauvegarde</Text>
              <Text style={styles.menuRowSub}>Importer un fichier de sauvegarde JSON</Text>
            </View>
          </View>
          <ChevronRight color={Colors.textMuted} size={18} />
        </TouchableOpacity>

        {/* Section: À Propos */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>À PROPOS</Text>

        <View style={styles.infoCard}>
          <View style={styles.brandRow}>
            <ShieldCheck color={Colors.neonGreen} size={24} />
            <Text style={styles.brandText}>IRON TRACKER</Text>
          </View>
          <Text style={styles.versionText}>Version 1.0.0 (Cross-Platform iOS & Android)</Text>
          <Text style={styles.descText}>
            Application moderne conçue pour suivre précisément ses charges, ses répétitions, ses temps de repos et sa progression à la salle de musculation.
          </Text>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal visible={showImportModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Restaurer des données</Text>
            <Text style={styles.modalSubNote}>Colle ici le texte JSON de ta sauvegarde :</Text>
            <TextInput
              style={styles.modalTextarea}
              placeholder="Colle le code JSON ici..."
              placeholderTextColor={Colors.textMuted}
              value={importJsonText}
              onChangeText={setImportJsonText}
              multiline={true}
              numberOfLines={8}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleImportData}>
                <Text style={styles.modalConfirmText}>Importer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuRowTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  menuRowSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  versionText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  descText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalSubNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  modalTextarea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    textAlignVertical: 'top',
    height: 160,
    marginBottom: Spacing.md,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.md,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.md,
  },
  modalConfirmText: {
    color: Colors.textDark,
    fontWeight: 'bold',
  },
});
