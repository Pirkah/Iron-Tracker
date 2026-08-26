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

export const CatalogScreen: React.FC = () => {
  const {
    exerciseCatalog,
    muscleGroups,
    getAllUniqueExercises,
    globalRenameExercise,
    globalDeleteExercise,
    addMuscleGroup,
    deleteMuscleGroup,
    changeMuscleForExercise,
    addToCatalog,
  } = useGym();

  const [searchText, setSearchText] = useState('');
  const [selectedMuscleDetail, setSelectedMuscleDetail] = useState<string | null>(null);

  // Modals state
  const [showNewMuscleModal, setShowNewMuscleModal] = useState(false);
  const [newMuscleName, setNewMuscleName] = useState('');

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedExoToRename, setSelectedExoToRename] = useState<string | null>(null);
  const [newExoName, setNewExoName] = useState('');

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [exoToMove, setExoToMove] = useState<string | null>(null);

  const [showAddExoModal, setShowAddExoModal] = useState(false);
  const [createExoName, setCreateExoName] = useState('');
  const [createExoMuscle, setCreateExoMuscle] = useState('Pectoraux');

  const allUniqueExercises = getAllUniqueExercises();

  // Grouped exercises
  const groupedExercises = useMemo(() => {
    const filtered = searchText.trim()
      ? allUniqueExercises.filter(e => e.toLowerCase().includes(searchText.toLowerCase()))
      : allUniqueExercises;

    const dict: Record<string, string[]> = {};
    if (!searchText.trim()) {
      muscleGroups.forEach(m => (dict[m] = []));
    }

    filtered.forEach(exo => {
      const match = exerciseCatalog.find(
        c => c.name.trim().toLowerCase() === exo.toLowerCase()
      );
      const muscle = match ? match.muscle : 'Autre';
      if (!dict[muscle]) dict[muscle] = [];
      dict[muscle].push(exo);
    });

    return Object.entries(dict)
      .map(([muscle, exos]) => ({ muscle, exos: exos.sort() }))
      .filter(g => g.exos.length > 0 || !searchText.trim())
      .sort((a, b) => a.muscle.localeCompare(b.muscle));
  }, [allUniqueExercises, searchText, muscleGroups, exerciseCatalog]);

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
            style={styles.backBtn}
            onPress={() => setSelectedMuscleDetail(null)}
          >
            <ChevronRight
              color={Colors.neonGreen}
              size={28}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedMuscleDetail.toUpperCase()}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {muscleExos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun exercice dans ce dossier</Text>
            </View>
          ) : (
            muscleExos.map(exo => (
              <View key={exo} style={styles.exoDetailRow}>
                <Text style={styles.exoDetailName} numberOfLines={1}>
                  {exo}
                </Text>
                <View style={styles.exoRowActions}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => {
                      setExoToMove(exo);
                      setShowMoveModal(true);
                    }}
                  >
                    <FolderInput color={Colors.warning} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => {
                      setSelectedExoToRename(exo);
                      setNewExoName(exo);
                      setShowRenameModal(true);
                    }}
                  >
                    <Edit2 color={Colors.blueAccent} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleGlobalDeletePrompt(exo)}
                  >
                    <Trash2 color={Colors.danger} size={18} />
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
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Renommer l'exercice</Text>
              <Text style={styles.modalSubNote}>Sera mis à jour partout dans l'application.</Text>
              <TextInput
                style={styles.modalInput}
                value={newExoName}
                onChangeText={setNewExoName}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowRenameModal(false)}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleGlobalRename}>
                  <Text style={styles.modalConfirmText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Move Exercise Modal */}
        <Modal visible={showMoveModal} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Déplacer vers un dossier</Text>
              <ScrollView style={{ maxHeight: 240, marginVertical: Spacing.sm }}>
                {muscleGroups.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={styles.muscleChoiceRow}
                    onPress={() => handleMoveExercise(m)}
                  >
                    <Text style={styles.muscleChoiceText}>{m}</Text>
                    <ChevronRight color={Colors.neonGreen} size={16} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowMoveModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
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
          style={styles.addFolderBtn}
          onPress={() => setShowNewMuscleModal(true)}
        >
          <FolderPlus color={Colors.neonGreen} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Add Custom Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseQuickBtn}
          onPress={() => setShowAddExoModal(true)}
          activeOpacity={0.8}
        >
          <Plus color={Colors.textDark} size={18} style={{ marginRight: 6 }} />
          <Text style={styles.addExerciseQuickBtnText}>NOUVEL EXERCICE AU CATALOGUE</Text>
        </TouchableOpacity>

        {/* If search is active, show flat list of matches */}
        {searchText.trim().length > 0 ? (
          <View style={styles.searchResultsList}>
            {groupedExercises.flatMap(g => g.exos).map(exo => (
              <View key={exo} style={styles.exoDetailRow}>
                <Text style={styles.exoDetailName} numberOfLines={1}>
                  {exo}
                </Text>
                <View style={styles.exoRowActions}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => {
                      setExoToMove(exo);
                      setShowMoveModal(true);
                    }}
                  >
                    <FolderInput color={Colors.warning} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => {
                      setSelectedExoToRename(exo);
                      setNewExoName(exo);
                      setShowRenameModal(true);
                    }}
                  >
                    <Edit2 color={Colors.blueAccent} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleGlobalDeletePrompt(exo)}
                  >
                    <Trash2 color={Colors.danger} size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Muscle Folders List */
          groupedExercises.map(group => (
            <TouchableOpacity
              key={group.muscle}
              style={styles.muscleFolderCard}
              onPress={() => setSelectedMuscleDetail(group.muscle)}
              activeOpacity={0.7}
            >
              <View style={styles.muscleFolderLeft}>
                <Text style={styles.muscleFolderName}>{group.muscle.toUpperCase()}</Text>
              </View>

              <View style={styles.muscleFolderRight}>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{group.exos.length}</Text>
                </View>

                {group.muscle !== 'Autre' && (
                  <TouchableOpacity
                    style={styles.deleteFolderBtn}
                    onPress={e => {
                      e.stopPropagation();
                      handleDeleteMusclePrompt(group.muscle);
                    }}
                  >
                    <Trash2 color={Colors.textMuted} size={16} />
                  </TouchableOpacity>
                )}

                <ChevronRight color={Colors.neonGreen} size={18} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {renderSharedModals()}

      {/* New Muscle Group Modal */}
      <Modal visible={showNewMuscleModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouveau Groupe Musculaire</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex : Avant-bras, Trapèzes, Cardio..."
              placeholderTextColor={Colors.textMuted}
              value={newMuscleName}
              onChangeText={setNewMuscleName}
              autoFocus={true}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNewMuscleModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCreateMuscle}>
                <Text style={styles.modalConfirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Custom Exercise to Catalog Modal */}
      <Modal visible={showAddExoModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ajouter au Catalogue</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de l'exercice"
              placeholderTextColor={Colors.textMuted}
              value={createExoName}
              onChangeText={setCreateExoName}
              autoFocus={true}
            />

            <Text style={styles.selectMuscleLabel}>Groupe musculaire :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleChipsScroll}>
              {muscleGroups.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.muscleChip,
                    createExoMuscle === m && styles.muscleChipActive,
                  ]}
                  onPress={() => setCreateExoMuscle(m)}
                >
                  <Text
                    style={[
                      styles.muscleChipText,
                      createExoMuscle === m && styles.muscleChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddExoModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCreateNewExo}>
                <Text style={styles.modalConfirmText}>Ajouter</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  addFolderBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.sm + 2,
    paddingBottom: 100,
  },
  addExerciseQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addExerciseQuickBtnText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  muscleFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  muscleFolderLeft: {
    flex: 1,
  },
  muscleFolderName: {
    color: Colors.neonGreen,
    fontSize: 15,
    fontWeight: '900',
  },
  muscleFolderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  countBadgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteFolderBtn: {
    padding: Spacing.xs,
  },
  searchResultsList: {
    gap: Spacing.xs,
  },
  exoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  exoDetailName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  exoRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconBtn: {
    padding: Spacing.xs,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
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
    marginBottom: Spacing.xs,
  },
  modalSubNote: {
    fontSize: 11,
    color: Colors.textMuted,
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
    marginBottom: Spacing.md,
  },
  selectMuscleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  muscleChipsScroll: {
    marginBottom: Spacing.lg,
  },
  muscleChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  muscleChipActive: {
    backgroundColor: Colors.neonGreenSoft,
    borderColor: Colors.neonGreen,
  },
  muscleChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  muscleChipTextActive: {
    color: Colors.neonGreen,
  },
  muscleChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  muscleChoiceText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
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
