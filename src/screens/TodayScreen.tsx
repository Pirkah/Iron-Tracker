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
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import { WorkoutSession, WorkoutExercise, ExerciseStatus, isExerciseCardio } from '../../types/gym';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  Share2,
  BookmarkPlus,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { AddExerciseModal } from '../../components/modals/AddExerciseModal';
import { ShareWorkoutCard } from '../../components/share/ShareWorkoutCard';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';
import { MachineSettingsModal } from '../../components/modals/MachineSettingsModal';

export const TodayScreen: React.FC = () => {
  const {
    history,
    workoutTemplates,
    templateOrder,
    startSessionFromTemplate,
    startEmptySession,
    saveSession,
    updateSession,
    deleteSession,
    finishSession,
    reopenSession,
    saveSessionAsTemplate,
    addToCatalog,
  } = useGym();

  const [isEditOrderMode, setIsEditOrderMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isBisetAdd, setIsBisetAdd] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<WorkoutExercise | null>(null);

  // Rename Exercise modal
  const [exerciseToRename, setExerciseToRename] = useState<WorkoutExercise | null>(null);
  const [renameText, setRenameText] = useState('');

  // Machine Settings modal
  const [settingsExercise, setSettingsExercise] = useState<WorkoutExercise | null>(null);

  // Find today's session
  const todayDate = new Date();
  const currentSession = history.find(s => {
    const d = new Date(s.date);
    return (
      d.getFullYear() === todayDate.getFullYear() &&
      d.getMonth() === todayDate.getMonth() &&
      d.getDate() === todayDate.getDate()
    );
  });

  const getExerciseStatus = (exercise: WorkoutExercise): ExerciseStatus => {
    if (!exercise.sets || exercise.sets.length === 0) return 'notStarted';
    const isCardio = isExerciseCardio(exercise.name);

    const allFilled = exercise.sets.every(set => {
      if (isCardio) return (set.duration || 0) > 0;
      return (set.reps || 0) > 0 || (set.weight || 0) > 0;
    });

    const anyFilled = exercise.sets.some(set => {
      if (isCardio) return (set.duration || 0) > 0;
      return (set.reps || 0) > 0 || (set.weight || 0) > 0;
    });

    if (allFilled) return 'completed';
    if (anyFilled) return 'inProgress';
    return 'notStarted';
  };

  const handleAddExercise = (exo1: string, exo2?: string | null) => {
    if (!currentSession) return;
    const updatedExercises = [...currentSession.exercises];

    if (exo2 && exo2.trim()) {
      const supersetId = Math.random().toString(36).substring(2, 9);
      updatedExercises.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo1.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId,
        isUnilateral: false,
      });
      updatedExercises.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo2.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId,
        isUnilateral: false,
      });
    } else {
      updatedExercises.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo1.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId: null,
        isUnilateral: false,
      });
    }

    updateSession({ ...currentSession, exercises: updatedExercises });
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!currentSession) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSession.exercises.length) return;

    const list = [...currentSession.exercises];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    updateSession({ ...currentSession, exercises: list });
  };

  const handleDeleteExercise = (exoId: string) => {
    if (!currentSession) return;
    const list = currentSession.exercises.filter(e => e.id !== exoId);
    updateSession({ ...currentSession, exercises: list });
  };

  const handleFinishPrompt = () => {
    if (!currentSession) return;
    const hasUnfinished = currentSession.exercises.some(e => getExerciseStatus(e) !== 'completed');

    if (hasUnfinished) {
      Alert.alert(
        'Terminer la séance ?',
        'Certains exercices ou séries ne semblent pas complétés.',
        [
          { text: 'Continuer l\'entraînement', style: 'cancel' },
          { text: 'Valider et Fermer', onPress: () => finishSession(currentSession.id) },
        ]
      );
    } else {
      finishSession(currentSession.id);
    }
  };

  const handleResetSessionPrompt = () => {
    if (!currentSession) return;
    Alert.alert(
      'Annuler la séance ?',
      'Toutes les séries enregistrées aujourd\'hui seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteSession(currentSession.id) },
      ]
    );
  };

  const handleSaveAsTemplate = () => {
    const clean = newTemplateName.trim();
    if (!clean || !currentSession) return;
    saveSessionAsTemplate(currentSession, clean);
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
    Alert.alert('Succès', `Le programme "${clean}" a été créé !`);
  };

  // If viewing single exercise detail
  if (selectedExerciseForDetail && currentSession) {
    return (
      <ExerciseDetailScreen
        exercise={selectedExerciseForDetail}
        sessionDate={currentSession.date}
        onUpdate={updated => {
          const list = currentSession.exercises.map(e => (e.id === updated.id ? updated : e));
          updateSession({ ...currentSession, exercises: list });
          setSelectedExerciseForDetail(updated);
        }}
        onBack={() => setSelectedExerciseForDetail(null)}
      />
    );
  }

  // --- 1. SÉANCE TERMINÉE ---
  if (currentSession && currentSession.isFinished) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.finishedContainer}>
          <View style={styles.finishIconWrap}>
            <CheckCircle2 color={Colors.neonGreen} size={80} />
          </View>
          <Text style={styles.finishTitle}>SÉANCE TERMINÉE !</Text>
          <Text style={styles.finishSub}>Super entraînement validé aujourd'hui.</Text>

          {/* Action: Share Story Card */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => setShowShareModal(true)}
            activeOpacity={0.8}
          >
            <Share2 color={Colors.textDark} size={22} style={{ marginRight: 8 }} />
            <Text style={styles.shareBtnText}>CRÉER UNE IMAGE DE PARTAGE</Text>
          </TouchableOpacity>

          {/* Action: Save As Template */}
          <TouchableOpacity
            style={styles.saveTemplateBtn}
            onPress={() => setShowSaveTemplateModal(true)}
            activeOpacity={0.8}
          >
            <BookmarkPlus color={Colors.textPrimary} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.saveTemplateBtnText}>SAUVEGARDER EN PROGRAMME</Text>
          </TouchableOpacity>

          {/* Action: Reopen Session */}
          <TouchableOpacity
            style={styles.reopenBtn}
            onPress={() => reopenSession(currentSession.id)}
            activeOpacity={0.8}
          >
            <RotateCcw color={Colors.textSecondary} size={18} style={{ marginRight: 6 }} />
            <Text style={styles.reopenBtnText}>Modifier / Rouvrir la séance</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Share Modal */}
        <Modal visible={showShareModal} animationType="slide" onRequestClose={() => setShowShareModal(false)}>
          <ShareWorkoutCard session={currentSession} onClose={() => setShowShareModal(false)} />
        </Modal>

        {/* Save Template Modal */}
        <Modal visible={showSaveTemplateModal} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Sauvegarder en programme</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nom (ex : Push Lourd, Upper Focus...)"
                placeholderTextColor={Colors.textMuted}
                value={newTemplateName}
                onChangeText={setNewTemplateName}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowSaveTemplateModal(false)}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveAsTemplate}>
                  <Text style={styles.modalConfirmText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // --- 2. SÉANCE ACTIVE EN COURS ---
  if (currentSession && !currentSession.isFinished) {
    return (
      <View style={styles.container}>
        {/* Top Workout Sub-header */}
        <View style={styles.activeHeader}>
          <View>
            <Text style={styles.activeHeaderCount}>
              {currentSession.exercises.length} EXERCICE{currentSession.exercises.length > 1 ? 'S' : ''}
            </Text>
          </View>

          <View style={styles.activeHeaderRight}>
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

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetSessionPrompt}>
              <Trash2 color={Colors.danger} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.exercisesList}>
          {currentSession.exercises.map((exercise, index) => {
            const status = getExerciseStatus(exercise);
            const isBiset = !!exercise.supersetId;

            return (
              <TouchableOpacity
                key={exercise.id || index}
                style={[
                  styles.exerciseCard,
                  isBiset && styles.bisetExerciseCard,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (!isEditOrderMode) setSelectedExerciseForDetail(exercise);
                }}
              >
                {/* Biset Purple Marker Strip */}
                {isBiset && <View style={styles.bisetMarker} />}

                {/* Status Indicator Circle */}
                {!isEditOrderMode && (
                  <View
                    style={[
                      styles.statusCircle,
                      status === 'completed' && styles.statusCircleCompleted,
                      status === 'inProgress' && styles.statusCircleInProgress,
                    ]}
                  >
                    {status === 'completed' && (
                      <CheckCircle2 color={Colors.neonGreen} size={16} />
                    )}
                    {status === 'inProgress' && <View style={styles.inProgressDot} />}
                  </View>
                )}

                {/* Exercise Info */}
                <View style={styles.exerciseInfo}>
                  <View style={styles.exoTitleRow}>
                    <Text style={styles.exoTitle} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                    {isBiset && <Text style={styles.bisetTag}>BISET</Text>}
                  </View>

                  {/* Machine note preview */}
                  {exercise.machineSettings ? (
                    <Text style={styles.machineSettingsTag} numberOfLines={1}>
                      ⚙️ {exercise.machineSettings}
                    </Text>
                  ) : null}

                  {/* Sets status label */}
                  <Text style={styles.exoSetsLabel}>
                    {status === 'notStarted' && 'À faire'}
                    {status === 'inProgress' && `${exercise.sets.length} série(s) en cours`}
                    {status === 'completed' && `${exercise.sets.length} série(s) validée(s)`}
                  </Text>
                </View>

                {/* Reorder Buttons in Edit Mode */}
                {isEditOrderMode ? (
                  <View style={styles.reorderControls}>
                    <TouchableOpacity
                      style={styles.reorderArrowBtn}
                      onPress={() => handleMoveExercise(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp color={index === 0 ? Colors.textMuted : Colors.textPrimary} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.reorderArrowBtn}
                      onPress={() => handleMoveExercise(index, 'down')}
                      disabled={index === currentSession.exercises.length - 1}
                    >
                      <ArrowDown
                        color={
                          index === currentSession.exercises.length - 1
                            ? Colors.textMuted
                            : Colors.textPrimary
                        }
                        size={18}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteExoBtn}
                      onPress={() => handleDeleteExercise(exercise.id)}
                    >
                      <Trash2 color={Colors.danger} size={18} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.exoCardRight}>
                    <TouchableOpacity
                      style={styles.infoBtn}
                      onPress={() => setSettingsExercise(exercise)}
                    >
                      <Info
                        color={exercise.machineSettings ? Colors.neonGreen : Colors.textMuted}
                        size={18}
                      />
                    </TouchableOpacity>
                    <ChevronRight color={Colors.textSecondary} size={20} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Add Exercise Buttons */}
          <View style={styles.addButtonsRow}>
            <TouchableOpacity
              style={styles.addExoBtn}
              onPress={() => {
                setIsBisetAdd(false);
                setShowAddModal(true);
              }}
              activeOpacity={0.8}
            >
              <Plus color={Colors.textDark} size={18} />
              <Text style={styles.addExoBtnText}>AJOUTER UN EXERCICE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBisetBtn}
              onPress={() => {
                setIsBisetAdd(true);
                setShowAddModal(true);
              }}
              activeOpacity={0.8}
            >
              <Layers color={Colors.bisetPurple} size={18} />
              <Text style={styles.addBisetBtnText}>AJOUTER UN BISET</Text>
            </TouchableOpacity>
          </View>

          {/* Finish Button */}
          <TouchableOpacity
            style={styles.finishWorkoutBtn}
            onPress={handleFinishPrompt}
            activeOpacity={0.8}
          >
            <Text style={styles.finishWorkoutBtnText}>TERMINER L'ENTRAÎNEMENT</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Exercise Modal */}
        <AddExerciseModal
          visible={showAddModal}
          isBiset={isBisetAdd}
          onClose={() => setShowAddModal(false)}
          onSelect={handleAddExercise}
        />

        {/* Machine Settings Modal */}
        {settingsExercise && (
          <MachineSettingsModal
            visible={!!settingsExercise}
            exerciseName={settingsExercise.name}
            initialSettings={settingsExercise.machineSettings}
            onClose={() => setSettingsExercise(null)}
            onSave={settings => {
              const list = currentSession.exercises.map(e =>
                e.id === settingsExercise.id ? { ...e, machineSettings: settings } : e
              );
              updateSession({ ...currentSession, exercises: list });
              addToCatalog(settingsExercise.name, 'Autre', settings);
              setSettingsExercise(null);
            }}
          />
        )}
      </View>
    );
  }

  // --- 3. PAS DE SÉANCE EN COURS (SÉLECTION DE PROGRAMME) ---
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.templatesContainer}>
        <Text style={styles.sectionHeaderTitle}>PROGRAMME DU JOUR</Text>

        {templateOrder.map(templateName => {
          const items = workoutTemplates[templateName] || [];
          return (
            <TouchableOpacity
              key={templateName}
              style={styles.templateCard}
              activeOpacity={0.8}
              onPress={() => startSessionFromTemplate(templateName)}
            >
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{templateName.toUpperCase()}</Text>
                <Text style={styles.templateExoCount}>
                  {items.length} EXERCICE{items.length > 1 ? 'S' : ''}
                </Text>
              </View>

              <View style={styles.playCircle}>
                <Play color={Colors.textDark} fill={Colors.textDark} size={20} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        {/* Empty Workout Button */}
        <TouchableOpacity
          style={styles.emptySessionBtn}
          onPress={startEmptySession}
          activeOpacity={0.8}
        >
          <Sparkles color={Colors.textSecondary} size={18} style={{ marginRight: 8 }} />
          <Text style={styles.emptySessionBtnText}>SÉANCE LIBRE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  templatesContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  templateExoCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginTop: 4,
  },
  playCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  emptySessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptySessionBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  activeHeaderCount: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  activeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  resetBtn: {
    padding: 6,
  },
  exercisesList: {
    padding: Spacing.lg,
    gap: Spacing.sm + 2,
    paddingBottom: 110,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  bisetExerciseCard: {
    borderColor: Colors.bisetPurpleBorder,
    backgroundColor: 'rgba(153, 77, 255, 0.04)',
  },
  bisetMarker: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.bisetPurple,
  },
  statusCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statusCircleCompleted: {
    borderColor: Colors.neonGreen,
    backgroundColor: Colors.neonGreenSoft,
  },
  statusCircleInProgress: {
    borderColor: Colors.warning,
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  exerciseInfo: {
    flex: 1,
  },
  exoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  bisetTag: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.bisetPurple,
    backgroundColor: Colors.bisetPurpleSoft,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  machineSettingsTag: {
    fontSize: 11,
    color: Colors.neonGreen,
    marginTop: 2,
    fontWeight: '600',
  },
  exoSetsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  exoCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoBtn: {
    padding: Spacing.xs,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reorderArrowBtn: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  deleteExoBtn: {
    padding: 6,
    marginLeft: 4,
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addExoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addExoBtnText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  addBisetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bisetPurpleSoft,
    borderWidth: 1,
    borderColor: Colors.bisetPurpleBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addBisetBtnText: {
    color: Colors.bisetPurple,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  finishWorkoutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    marginTop: Spacing.sm,
  },
  finishWorkoutBtnText: {
    color: Colors.neonGreen,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  finishedContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%',
    gap: Spacing.lg,
  },
  finishIconWrap: {
    marginBottom: Spacing.sm,
  },
  finishTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  finishSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    width: '100%',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  shareBtnText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  saveTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  saveTemplateBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  reopenBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
  modalCardTitle: {
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
