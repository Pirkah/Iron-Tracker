import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
import { TemplateItem } from '../types/gym';
import {
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react-native';
import { AddExerciseModal } from '../components/modals/AddExerciseModal';
import { GlassButton } from '../components/common/GlassButton';

export const ProgramsScreen: React.FC = () => {
  const {
    workoutTemplates,
    templateOrder,
    addTemplate,
    deleteTemplate,
    reorderTemplates,
    addExerciseToTemplate,
    deleteExerciseFromTemplate,
    updateTemplateItemName,
  } = useGym();

  const [isEditOrderMode, setIsEditOrderMode] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');

  // Add Exercise to Program state
  const [selectedTemplateForAdd, setSelectedTemplateForAdd] = useState<string | null>(null);
  const [isBisetAdd, setIsBisetAdd] = useState(false);

  // Edit item name state
  const [itemBeingEdited, setItemBeingEdited] = useState<{
    templateName: string;
    item: TemplateItem;
  } | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleCreateProgram = () => {
    const clean = newProgramName.trim();
    if (!clean) return;
    addTemplate(clean);
    setNewProgramName('');
    setShowAddProgramModal(false);
  };

  const handleDeleteProgramPrompt = (templateName: string) => {
    Alert.alert(
      'Supprimer le programme ?',
      `Le programme "${templateName}" sera définitivement effacé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteTemplate(templateName),
        },
      ]
    );
  };

  const handleMoveTemplate = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= templateOrder.length) return;
    const newOrder = [...templateOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    reorderTemplates(newOrder);
  };

  const handleSaveEditItem = () => {
    if (!itemBeingEdited || !editedName.trim()) return;
    updateTemplateItemName(
      itemBeingEdited.templateName,
      itemBeingEdited.item.id,
      editedName.trim()
    );
    setItemBeingEdited(null);
    setEditedName('');
  };

  return (
    <View style={styles.container}>
      {/* Sub Header Action Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.reorderToggleGlassBtn,
            isEditOrderMode && styles.reorderToggleGlassBtnActive,
          ]}
          onPress={() => setIsEditOrderMode(!isEditOrderMode)}
        >
          <ArrowUpDown
            color={isEditOrderMode ? Colors.neonGreen : Colors.textSecondary}
            size={14}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.reorderToggleText,
              isEditOrderMode && { color: Colors.neonGreen },
            ]}
          >
            {isEditOrderMode ? 'Terminer' : 'Réorganiser'}
          </Text>
        </TouchableOpacity>

        <GlassButton
          title="NOUVEAU"
          variant="neon"
          size="sm"
          icon={<FolderPlus color={Colors.neonGreen} size={16} />}
          onPress={() => setShowAddProgramModal(true)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {templateOrder.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun programme enregistré.</Text>
            <Text style={styles.emptySubText}>
              Crée ton premier programme avec le bouton ci-dessus.
            </Text>
          </View>
        ) : (
          templateOrder.map((templateName, index) => {
            const items = workoutTemplates[templateName] || [];

            return (
              <View key={templateName} style={styles.programGlassCard}>
                {/* Specular glass reflection */}
                <View style={styles.glassReflectionTop} />

                {/* Header of Program Card */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderTitleWrap}>
                    <Text style={styles.cardTitle}>{templateName.toUpperCase()}</Text>
                    <Text style={styles.cardSubTitle}>
                      {items.length} EXERCICE{items.length > 1 ? 'S' : ''}
                    </Text>
                  </View>

                  {isEditOrderMode ? (
                    <View style={styles.reorderArrows}>
                      <TouchableOpacity
                        style={styles.arrowGlassBtn}
                        onPress={() => handleMoveTemplate(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp
                          color={index === 0 ? Colors.textMuted : Colors.textPrimary}
                          size={16}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.arrowGlassBtn}
                        onPress={() => handleMoveTemplate(index, 'down')}
                        disabled={index === templateOrder.length - 1}
                      >
                        <ArrowDown
                          color={
                            index === templateOrder.length - 1
                              ? Colors.textMuted
                              : Colors.textPrimary
                          }
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.deleteProgGlassBtn}
                      onPress={() => handleDeleteProgramPrompt(templateName)}
                    >
                      <Trash2 color={Colors.danger} size={16} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Items List */}
                <View style={styles.itemsList}>
                  {items.length === 0 ? (
                    <Text style={styles.noExoText}>Aucun exercice pour l'instant</Text>
                  ) : (
                    items.map(item => {
                      const isBiset = !!item.supersetId;

                      return (
                        <View key={item.id} style={styles.itemRow}>
                          {isBiset && <View style={styles.bisetStrip} />}
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {isBiset && <Text style={styles.bisetTag}>BISET</Text>}

                          <View style={styles.itemActions}>
                            <TouchableOpacity
                              style={styles.itemActionGlassBtn}
                              onPress={() => {
                                setItemBeingEdited({ templateName, item });
                                setEditedName(item.name);
                              }}
                            >
                              <Edit2 color={Colors.textSecondary} size={14} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.itemActionGlassBtn}
                              onPress={() => deleteExerciseFromTemplate(templateName, item.id)}
                            >
                              <Trash2 color={Colors.danger} size={14} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Card Action Buttons */}
                {!isEditOrderMode && (
                  <View style={styles.cardBottomActions}>
                    <TouchableOpacity
                      style={styles.addSimpleGlassBtn}
                      onPress={() => {
                        setSelectedTemplateForAdd(templateName);
                        setIsBisetAdd(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Plus color={Colors.neonGreen} size={15} />
                      <Text style={styles.addSimpleText}>Ajouter Exo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addBisetGlassBtn}
                      onPress={() => {
                        setSelectedTemplateForAdd(templateName);
                        setIsBisetAdd(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Layers color={Colors.bisetPurple} size={15} />
                      <Text style={styles.addBisetText}>Ajouter Biset</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      {selectedTemplateForAdd && (
        <AddExerciseModal
          visible={!!selectedTemplateForAdd}
          isBiset={isBisetAdd}
          onClose={() => setSelectedTemplateForAdd(null)}
          onSelect={(exo1, exo2) => {
            addExerciseToTemplate(selectedTemplateForAdd, exo1, exo2);
            setSelectedTemplateForAdd(null);
          }}
        />
      )}

      {/* New Program Modal */}
      <Modal visible={showAddProgramModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Text style={styles.modalTitle}>Nouveau Programme</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex : Full Body, Bras / Épaules..."
              placeholderTextColor={Colors.textMuted}
              value={newProgramName}
              onChangeText={setNewProgramName}
              autoFocus={true}
            />
            <View style={styles.modalActions}>
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowAddProgramModal(false)}
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Créer"
                variant="neon"
                onPress={handleCreateProgram}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Name Modal */}
      {itemBeingEdited && (
        <Modal visible={!!itemBeingEdited} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalGlassCard}>
              <View style={styles.glassReflectionTop} />
              <Text style={styles.modalTitle}>Renommer dans ce programme</Text>
              <TextInput
                style={styles.modalInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <GlassButton
                  title="Annuler"
                  variant="glass"
                  onPress={() => setItemBeingEdited(null)}
                  style={{ flex: 1 }}
                />
                <GlassButton
                  title="Valider"
                  variant="neon"
                  onPress={handleSaveEditItem}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  reorderToggleGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  reorderToggleGlassBtnActive: {
    backgroundColor: Colors.glassNeon,
    borderColor: Colors.glassNeonBorder,
  },
  reorderToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  scrollList: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 110,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  programGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  cardHeaderTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 0.5,
  },
  cardSubTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  deleteProgGlassBtn: {
    padding: 7,
    backgroundColor: Colors.glassRed,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassRedBorder,
  },
  reorderArrows: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  arrowGlassBtn: {
    padding: 6,
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  itemsList: {
    paddingVertical: Spacing.xs,
  },
  noExoText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    padding: Spacing.md,
    fontSize: 13,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  bisetStrip: {
    width: 3,
    height: 18,
    backgroundColor: Colors.bisetPurple,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  bisetTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.bisetPurple,
    backgroundColor: Colors.bisetPurpleSoft,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  itemActionGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
  },
  cardBottomActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  addSimpleGlassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
  },
  addSimpleText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addBisetGlassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addBisetText: {
    color: Colors.bisetPurple,
    fontSize: 12,
    fontWeight: 'bold',
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
    maxWidth: 360,
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
