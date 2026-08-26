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
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react-native';
import { AddExerciseModal } from '../components/modals/AddExerciseModal';

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
          style={styles.reorderToggleBtn}
          onPress={() => setIsEditOrderMode(!isEditOrderMode)}
        >
          <ArrowUpDown
            color={isEditOrderMode ? Colors.neonGreen : Colors.textSecondary}
            size={16}
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

        <TouchableOpacity
          style={styles.newProgramBtn}
          onPress={() => setShowAddProgramModal(true)}
          activeOpacity={0.8}
        >
          <FolderPlus color={Colors.textDark} size={18} style={{ marginRight: 6 }} />
          <Text style={styles.newProgramBtnText}>NOUVEAU</Text>
        </TouchableOpacity>
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
              <View key={templateName} style={styles.programCard}>
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
                        style={styles.arrowBtn}
                        onPress={() => handleMoveTemplate(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp
                          color={index === 0 ? Colors.textMuted : Colors.textPrimary}
                          size={18}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => handleMoveTemplate(index, 'down')}
                        disabled={index === templateOrder.length - 1}
                      >
                        <ArrowDown
                          color={
                            index === templateOrder.length - 1
                              ? Colors.textMuted
                              : Colors.textPrimary
                          }
                          size={18}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.deleteProgBtn}
                      onPress={() => handleDeleteProgramPrompt(templateName)}
                    >
                      <Trash2 color={Colors.danger} size={18} />
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
                              style={styles.itemActionBtn}
                              onPress={() => {
                                setItemBeingEdited({ templateName, item });
                                setEditedName(item.name);
                              }}
                            >
                              <Edit2 color={Colors.textSecondary} size={15} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.itemActionBtn}
                              onPress={() => deleteExerciseFromTemplate(templateName, item.id)}
                            >
                              <Trash2 color={Colors.textMuted} size={15} />
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
                      style={styles.addSimpleBtn}
                      onPress={() => {
                        setSelectedTemplateForAdd(templateName);
                        setIsBisetAdd(false);
                      }}
                    >
                      <Plus color={Colors.neonGreen} size={16} />
                      <Text style={styles.addSimpleText}>Ajouter Exo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addBisetBtn}
                      onPress={() => {
                        setSelectedTemplateForAdd(templateName);
                        setIsBisetAdd(true);
                      }}
                    >
                      <Layers color={Colors.bisetPurple} size={16} />
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
          <View style={styles.modalCard}>
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
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddProgramModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCreateProgram}>
                <Text style={styles.modalConfirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Name Modal */}
      {itemBeingEdited && (
        <Modal visible={!!itemBeingEdited} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Renommer dans ce programme</Text>
              <TextInput
                style={styles.modalInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setItemBeingEdited(null)}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveEditItem}>
                  <Text style={styles.modalConfirmText}>Valider</Text>
                </TouchableOpacity>
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
  reorderToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  reorderToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  newProgramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  newProgramBtnText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollList: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
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
  programCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md + 2,
    backgroundColor: Colors.cardSecondary,
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
  deleteProgBtn: {
    padding: Spacing.xs,
  },
  reorderArrows: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  arrowBtn: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
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
    gap: Spacing.sm,
  },
  itemActionBtn: {
    padding: Spacing.xs,
  },
  cardBottomActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
  },
  addSimpleBtn: {
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
  addBisetBtn: {
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
  modalCard: {
    width: '100%',
    maxWidth: 360,
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
