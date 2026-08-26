import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
import {
  Search,
  FolderPlus,
  Edit2,
  Trash2,
  FolderInput,
  ChevronRight,
  Plus,
  X,
  Dumbbell,
} from 'lucide-react-native';
import { GlassButton } from '../components/common/GlassButton';

export const CatalogScreen: React.FC = () => {
  const {
    exerciseCatalog,
    muscleGroups,
    getAllUniqueExercises,
    globalRenameExercise,
    globalDeleteExercise,
    changeMuscleForExercise,
    addMuscleGroup,
    deleteMuscleGroup,
    addToCatalog,
  } = useGym();

  const [searchText, setSearchText] = useState('');
  const [selectedMuscleDetail, setSelectedMuscleDetail] = useState<string | null>(null);

  // Rename modal state
  const [selectedExoToRename, setSelectedExoToRename] = useState<string | null>(null);
  const [newExoName, setNewExoName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);

  // Move modal state
  const [exoToMove, setExoToMove] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Add muscle modal state
  const [showNewMuscleModal, setShowNewMuscleModal] = useState(false);
  const [newMuscleName, setNewMuscleName] = useState('');

  // Add new exercise modal state
  const [showAddExoModal, setShowAddExoModal] = useState(false);
  const [createExoName, setCreateExoName] = useState('');
  const [createExoMuscle, setCreateExoMuscle] = useState('Autre');

  const allUniqueExercises = useMemo(() => {
    return getAllUniqueExercises();
  }, [getAllUniqueExercises]);

  // Filtered exercises by search
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const query = searchText.trim().toLowerCase();
    return allUniqueExercises.filter(exo => exo.toLowerCase().includes(query));
  }, [searchText, allUniqueExercises]);

  // Muscle folder statistics
  const muscleFoldersWithCounts = useMemo(() => {
    return muscleGroups.map(m => {
      const count = allUniqueExercises.filter(exo => {
        const match = exerciseCatalog.find(
          c => c.name.trim().toLowerCase() === exo.toLowerCase()
        );
        const muscle = match ? match.muscle : 'Autre';
        return muscle === m;
      }).length;
      return { muscle: m, count };
    });
  }, [muscleGroups, allUniqueExercises, exerciseCatalog]);

  const handleCreateMuscle = () => {
    const clean = newMuscleName.trim();
    if (!clean) return;
    addMuscleGroup(clean);
    setNewMuscleName('');
    setShowNewMuscleModal(false);
  };

  const handleDeleteMusclePrompt = (muscleName: string) => {
    if (muscleName === 'Autre') return;
    Alert.alert(
      'Supprimer le dossier muscle ?',
      `Tous les exercices du dossier "${muscleName}" seront déplacés dans "Autre".`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteMuscleGroup(muscleName) },
      ]
    );
  };

  const handleGlobalRename = () => {
    if (!selectedExoToRename || !newExoName.trim()) return;
    globalRenameExercise(selectedExoToRename, newExoName.trim());
    setSelectedExoToRename(null);
    setNewExoName('');
    setShowRenameModal(false);
  };

  const handleGlobalDeletePrompt = (exoName: string) => {
    Alert.alert(
      '⚠️ SUPPRESSION GLOBALE',
      `Supprimer définitivement "${exoName}" ?\nCet exercice et ses performances seront effacés de tous les programmes et de l'historique.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer partout', style: 'destructive', onPress: () => globalDeleteExercise(exoName) },
      ]
    );
  };

  const handleMoveExercise = (destMuscle: string) => {
    if (!exoToMove) return;
    changeMuscleForExercise(exoToMove, destMuscle);
    setExoToMove(null);
    setShowMoveModal(false);
  };

  const handleCreateNewExo = () => {
    const clean = createExoName.trim();
    if (!clean) return;
    addToCatalog(clean, createExoMuscle);
    setCreateExoName('');
    setShowAddExoModal(false);
  };

  // If viewing exercises inside a specific muscle folder
  if (selectedMuscleDetail) {
    const muscleExos = allUniqueExercises
      .filter(exo => {
        const match = exerciseCatalog.find(
          c => c.name.trim().toLowerCase() === exo.toLowerCase()
        );
        const muscle = match ? match.muscle : 'Autre';
        return muscle === selectedMuscleDetail;
      })
      .sort();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backGlassBtn}
            onPress={() => setSelectedMuscleDetail(null)}
          >
            <ChevronRight
              color={Colors.neonGreen}
              size={24}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedMuscleDetail.toUpperCase()}</Text>
          <TouchableOpacity
            style={styles.addExoHeaderGlassBtn}
            onPress={() => {
              setCreateExoMuscle(selectedMuscleDetail);
              setShowAddExoModal(true);
            }}
          >
            <Plus color={Colors.neonGreen} size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollList}>
          {muscleExos.length === 0 ? (
            <View style={styles.emptyGlassCard}>
              <Text style={styles.emptyText}>Aucun exercice dans ce dossier</Text>
            </View>
          ) : (
            muscleExos.map(exo => (
              <View key={exo} style={styles.exoGlassCard}>
                <View style={styles.glassReflectionTop} />
                <Text style={styles.exoName} numberOfLines={1}>
                  {exo}
                </Text>
                <View style={styles.exoCardActions}>
                  <TouchableOpacity
                    style={styles.actionIconGlassBtn}
                    onPress={() => {
                      setSelectedExoToRename(exo);
                      setNewExoName(exo);
                      setShowRenameModal(true);
                    }}
                  >
                    <Edit2 color={Colors.textSecondary} size={15} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconGlassBtn}
                    onPress={() => {
                      setExoToMove(exo);
                      setShowMoveModal(true);
                    }}
                  >
                    <FolderInput color={Colors.textSecondary} size={15} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconGlassBtn}
                    onPress={() => handleGlobalDeletePrompt(exo)}
                  >
                    <Trash2 color={Colors.danger} size={15} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Modals */}
        {renderSharedModals()}
      </View>
    );
  }

  function renderSharedModals() {
    return (
      <>
        {/* Rename Modal */}
        <Modal visible={showRenameModal} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalGlassCard}>
              <View style={styles.glassReflectionTop} />
              <Text style={styles.modalTitle}>Renommer l'exercice</Text>
              <Text style={styles.modalSubNote}>Sera mis à jour partout dans l'application.</Text>
              <TextInput
                style={styles.modalInput}
                value={newExoName}
                onChangeText={setNewExoName}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <GlassButton
                  title="Annuler"
                  variant="glass"
                  onPress={() => setShowRenameModal(false)}
                  style={{ flex: 1 }}
                />
                <GlassButton
                  title="Valider"
                  variant="neon"
                  onPress={handleGlobalRename}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Move Exercise Modal */}
        <Modal visible={showMoveModal} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalGlassCard}>
              <View style={styles.glassReflectionTop} />
              <Text style={styles.modalTitle}>Déplacer vers un dossier</Text>
              <ScrollView style={{ maxHeight: 240, marginVertical: Spacing.sm }}>
                {muscleGroups.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={styles.muscleChoiceGlassRow}
                    onPress={() => handleMoveExercise(m)}
                  >
                    <Text style={styles.muscleChoiceText}>{m}</Text>
                    <ChevronRight color={Colors.neonGreen} size={16} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowMoveModal(false)}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Search color={Colors.textMuted} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un exercice..."
            placeholderTextColor={Colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X color={Colors.textMuted} size={18} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addFolderGlassBtn}
          onPress={() => setShowNewMuscleModal(true)}
        >
          <FolderPlus color={Colors.neonGreen} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {/* If searching */}
        {searchText.trim().length > 0 ? (
          <View>
            <Text style={styles.sectionHeaderTitle}>RÉSULTATS ({searchResults.length})</Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyGlassCard}>
                <Text style={styles.emptyText}>Aucun exercice trouvé</Text>
                <GlassButton
                  title="Créer cet exercice"
                  variant="neon"
                  onPress={() => {
                    setCreateExoName(searchText.trim());
                    setShowAddExoModal(true);
                  }}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : (
              searchResults.map(exo => (
                <View key={exo} style={styles.exoGlassCard}>
                  <View style={styles.glassReflectionTop} />
                  <Text style={styles.exoName} numberOfLines={1}>
                    {exo}
                  </Text>
                  <View style={styles.exoCardActions}>
                    <TouchableOpacity
                      style={styles.actionIconGlassBtn}
                      onPress={() => {
                        setSelectedExoToRename(exo);
                        setNewExoName(exo);
                        setShowRenameModal(true);
                      }}
                    >
                      <Edit2 color={Colors.textSecondary} size={15} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconGlassBtn}
                      onPress={() => {
                        setExoToMove(exo);
                        setShowMoveModal(true);
                      }}
                    >
                      <FolderInput color={Colors.textSecondary} size={15} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconGlassBtn}
                      onPress={() => handleGlobalDeletePrompt(exo)}
                    >
                      <Trash2 color={Colors.danger} size={15} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* Normal Muscle Folders List */
          <View>
            <Text style={styles.sectionHeaderTitle}>DOSSIERS PAR GROUPE MUSCULAIRE</Text>
            {muscleFoldersWithCounts.map(folder => (
              <TouchableOpacity
                key={folder.muscle}
                style={styles.muscleFolderGlassCard}
                onPress={() => setSelectedMuscleDetail(folder.muscle)}
                activeOpacity={0.7}
              >
                <View style={styles.glassReflectionTop} />
                <View style={styles.muscleFolderLeft}>
                  <Text style={styles.muscleFolderName}>{folder.muscle.toUpperCase()}</Text>
                  <Text style={styles.muscleFolderCount}>
                    {folder.count} exercice{folder.count > 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.muscleFolderRight}>
                  {folder.muscle !== 'Autre' && (
                    <TouchableOpacity
                      style={styles.deleteFolderGlassBtn}
                      onPress={e => {
                        e.stopPropagation();
                        handleDeleteMusclePrompt(folder.muscle);
                      }}
                    >
                      <Trash2 color={Colors.textMuted} size={15} />
                    </TouchableOpacity>
                  )}
                  <ChevronRight color={Colors.neonGreen} size={20} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderSharedModals()}

      {/* New Muscle Folder Modal */}
      <Modal visible={showNewMuscleModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Text style={styles.modalTitle}>Nouveau dossier muscle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Avant-bras, Trapèzes..."
              placeholderTextColor={Colors.textMuted}
              value={newMuscleName}
              onChangeText={setNewMuscleName}
              autoFocus={true}
            />
            <View style={styles.modalActions}>
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowNewMuscleModal(false)}
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Créer"
                variant="neon"
                onPress={handleCreateMuscle}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create New Exercise Modal */}
      <Modal visible={showAddExoModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Text style={styles.modalTitle}>Nouvel exercice</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de l'exercice"
              placeholderTextColor={Colors.textMuted}
              value={createExoName}
              onChangeText={setCreateExoName}
              autoFocus={true}
            />
            <Text style={styles.modalFieldLabel}>Dossier musculaire :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
              {muscleGroups.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.musclePill,
                    createExoMuscle === m && styles.musclePillActive,
                  ]}
                  onPress={() => setCreateExoMuscle(m)}
                >
                  <Text
                    style={[
                      styles.musclePillText,
                      createExoMuscle === m && styles.musclePillTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowAddExoModal(false)}
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Créer"
                variant="neon"
                onPress={handleCreateNewExo}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  addFolderGlassBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.glassNeon,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
  },
  addExoHeaderGlassBtn: {
    padding: 6,
    backgroundColor: Colors.glassNeon,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollList: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  muscleFolderGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm + 2,
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
  muscleFolderLeft: {
    flex: 1,
  },
  muscleFolderName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  muscleFolderCount: {
    fontSize: 11,
    color: Colors.neonGreen,
    fontWeight: 'bold',
    marginTop: 2,
  },
  muscleFolderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deleteFolderGlassBtn: {
    padding: 6,
  },
  exoGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  exoName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  exoCardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionIconGlassBtn: {
    padding: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.sm,
  },
  emptyGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
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
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  muscleChoiceGlassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  muscleChoiceText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  musclePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  musclePillActive: {
    backgroundColor: Colors.glassNeon,
    borderColor: Colors.neonGreen,
  },
  musclePillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  musclePillTextActive: {
    color: Colors.neonGreen,
  },
});
