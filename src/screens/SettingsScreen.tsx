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
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { GlassButton } from '../components/common/GlassButton';

export const SettingsScreen: React.FC = () => {
  const { history, workoutTemplates, templateOrder, exerciseCatalog, hiddenExercises, muscleGroups, loadAllData } = useGym();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const handleExportData = async () => {
    try {
      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        history,
        workoutTemplates,
        templateOrder,
        exerciseCatalog,
        hiddenExercises,
        muscleGroups,
      };

      const jsonString = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonString,
        title: 'Iron Tracker - Sauvegarde complète',
      });
    } catch {
      Alert.alert('Erreur', "Impossible d'exporter les données.");
    }
  };

  const handleImportData = async () => {
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (parsed && parsed.history && parsed.workoutTemplates) {
        await StorageService.saveHistory(parsed.history);
        await StorageService.saveTemplates(parsed.workoutTemplates);
        if (parsed.templateOrder) await StorageService.saveTemplateOrder(parsed.templateOrder);
        if (parsed.exerciseCatalog) await StorageService.saveCatalog(parsed.exerciseCatalog);
        if (parsed.hiddenExercises) await StorageService.saveHiddenExercises(parsed.hiddenExercises);
        if (parsed.muscleGroups) await StorageService.saveMuscleGroups(parsed.muscleGroups);

        await loadAllData();
        setShowImportModal(false);
        setImportJsonText('');
        Alert.alert('Succès', 'Toutes les données ont été restaurées !');
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

        <TouchableOpacity style={styles.menuGlassRow} onPress={handleExportData} activeOpacity={0.7}>
          <View style={styles.glassReflectionTop} />
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
          style={styles.menuGlassRow}
          onPress={() => setShowImportModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.glassReflectionTop} />
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

        <View style={styles.infoGlassCard}>
          <View style={styles.glassReflectionTop} />
          <View style={styles.brandRow}>
            <ShieldCheck color={Colors.neonGreen} size={24} />
            <Text style={styles.brandText}>IRON TRACKER</Text>
          </View>
          <Text style={styles.versionText}>Version 1.0.0 (Design Liquid Glass Edition)</Text>
          <Text style={styles.descText}>
            Application moderne conçue pour suivre précisément ses charges, ses répétitions, ses temps de repos et sa progression à la salle de musculation.
          </Text>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal visible={showImportModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
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
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowImportModal(false)}
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Importer"
                variant="neon"
                onPress={handleImportData}
                style={{ flex: 1 }}
              />
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
    gap: Spacing.md,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: Spacing.sm,
  },
  menuGlassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuRowSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  versionText: {
    fontSize: 12,
    color: Colors.neonGreen,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalGlassCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
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
    height: 140,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
