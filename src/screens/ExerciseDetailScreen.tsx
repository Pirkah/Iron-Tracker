import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { WorkoutExercise, GymSet, GymDrop, isExerciseCardio } from '../types/gym';
import { useGym } from '../context/GymContext';
import { formatLastPerformanceSet, triggerHaptic } from '../utils/calculations';
import {
  Zap,
  CornerDownRight,
  Trash2,
  Plus,
  Minus,
  Timer,
  Info,
  ChevronLeft,
} from 'lucide-react-native';
import { MachineSettingsModal } from '../components/modals/MachineSettingsModal';
import { GlassButton } from '../components/common/GlassButton';

interface ExerciseDetailScreenProps {
  exercise: WorkoutExercise;
  sessionDate: string;
  onUpdate: (updated: WorkoutExercise) => void;
  onBack: () => void;
}

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  exercise,
  sessionDate,
  onUpdate,
  onBack,
}) => {
  const { getLastPerformance, startRestTimer, addToCatalog } = useGym();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lastPerf, setLastPerf] = useState<WorkoutExercise | null>(null);

  const isCardio = isExerciseCardio(exercise.name);

  // Fetch last performance on mount
  useEffect(() => {
    const prev = getLastPerformance(exercise.name, sessionDate);
    setLastPerf(prev);
  }, [exercise.name, sessionDate, getLastPerformance]);

  const updateExerciseState = (updated: WorkoutExercise) => {
    onUpdate(updated);
  };

  // Adjust target set count
  const handleSetTargetCount = (count: number) => {
    const newCount = Math.max(0, Math.min(20, count));
    const currentSets = [...exercise.sets];

    if (newCount > currentSets.length) {
      // Add missing sets, copying previous weight
      const lastSet = currentSets[currentSets.length - 1];
      const diff = newCount - currentSets.length;
      for (let i = 0; i < diff; i++) {
        currentSets.push({
          id: Math.random().toString(36).substring(2, 9),
          weight: lastSet ? lastSet.weight : null,
          reps: null,
          isFailure: false,
          drops: [],
        });
      }
    } else if (newCount < currentSets.length) {
      currentSets.splice(newCount);
    }

    updateExerciseState({
      ...exercise,
      targetSetCount: newCount,
      sets: currentSets,
    });
  };

  const handleSetFieldChange = (
    index: number,
    field: keyof GymSet,
    value: any
  ) => {
    const updated = [...exercise.sets];
    updated[index] = { ...updated[index], [field]: value };
    updateExerciseState({ ...exercise, sets: updated });
  };

  const toggleFailure = (index: number) => {
    triggerHaptic('medium');
    const updated = [...exercise.sets];
    updated[index] = { ...updated[index], isFailure: !updated[index].isFailure };
    updateExerciseState({ ...exercise, sets: updated });
  };

  const toggleNegativeWeight = (index: number) => {
    triggerHaptic('light');
    const updated = [...exercise.sets];
    const currentWeight = updated[index].weight;
    if (currentWeight !== null && currentWeight !== undefined) {
      updated[index] = { ...updated[index], weight: -currentWeight };
      updateExerciseState({ ...exercise, sets: updated });
    }
  };

  const handleAddDrop = (setIndex: number) => {
    triggerHaptic('light');
    const currentSets = [...exercise.sets];
    const targetSet = currentSets[setIndex];
    const updatedDrops = [
      ...targetSet.drops,
      {
        id: Math.random().toString(36).substring(2, 9),
        weight: targetSet.weight ? Math.max(0, targetSet.weight - 5) : null,
        reps: null,
      },
    ];
    currentSets[setIndex] = { ...targetSet, drops: updatedDrops };
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  const handleDeleteDrop = (setIndex: number, dropId: string) => {
    const currentSets = [...exercise.sets];
    const targetSet = currentSets[setIndex];
    const updatedDrops = targetSet.drops.filter(d => d.id !== dropId);
    currentSets[setIndex] = { ...targetSet, drops: updatedDrops };
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  const handleDropFieldChange = (
    setIndex: number,
    dropIndex: number,
    field: keyof GymDrop,
    value: any
  ) => {
    const currentSets = [...exercise.sets];
    const targetSet = currentSets[setIndex];
    const targetDrops = [...targetSet.drops];
    targetDrops[dropIndex] = { ...targetDrops[dropIndex], [field]: value };
    currentSets[setIndex] = { ...targetSet, drops: targetDrops };
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  const handleSaveSettings = (settings: string) => {
    const updated = { ...exercise, machineSettings: settings };
    updateExerciseState(updated);
    addToCatalog(exercise.name, 'Autre', settings);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ChevronLeft color={Colors.neonGreen} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exercise.name}
          </Text>
          {exercise.machineSettings ? (
            <Text style={styles.settingsBadgeText} numberOfLines={1}>
              ⚙️ {exercise.machineSettings}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.settingsGlassBtn}
          onPress={() => setShowSettingsModal(true)}
        >
          <Info color={exercise.machineSettings ? Colors.neonGreen : Colors.textMuted} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Configuration Glass Card */}
        <View style={styles.glassCard}>
          <View style={styles.glassReflectionTop} />
          <Text style={styles.sectionTitle}>CONFIGURATION</Text>

          {/* Sets Count Stepper */}
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>
              {isCardio ? 'Intervalles :' : 'Nombre de séries :'}
            </Text>
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                style={styles.stepperGlassBtn}
                onPress={() => handleSetTargetCount(exercise.sets.length - 1)}
              >
                <Minus color={Colors.textPrimary} size={15} />
              </TouchableOpacity>
              <Text style={styles.stepperText}>{exercise.sets.length}</Text>
              <TouchableOpacity
                style={styles.stepperGlassBtn}
                onPress={() => handleSetTargetCount(exercise.sets.length + 1)}
              >
                <Plus color={Colors.textPrimary} size={15} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unilateral Toggle (Only for Strength) */}
          {!isCardio && (
            <View style={[styles.configRow, { marginTop: Spacing.md }]}>
              <View>
                <Text style={styles.configLabel}>Mode Unilatéral</Text>
                <Text style={styles.configSubLabel}>Suivre Bras/Jambe Gauche & Droite</Text>
              </View>
              <Switch
                value={exercise.isUnilateral}
                onValueChange={v => {
                  triggerHaptic('light');
                  updateExerciseState({ ...exercise, isUnilateral: v });
                }}
                trackColor={{ false: Colors.cardBorder, true: Colors.neonGreen }}
                thumbColor={Colors.textPrimary}
              />
            </View>
          )}
        </View>

        {/* Sets & Performance Table Glass Card */}
        <View style={styles.glassCard}>
          <View style={styles.glassReflectionTop} />
          <View style={styles.perfHeaderRow}>
            <Text style={styles.sectionTitle}>PERFORMANCES</Text>
            <TouchableOpacity
              style={styles.quickTimerGlassBtn}
              onPress={() => startRestTimer(90)}
            >
              <Timer color={Colors.neonGreen} size={15} />
              <Text style={styles.quickTimerText}>Chrono</Text>
            </TouchableOpacity>
          </View>

          {exercise.sets.length === 0 ? (
            <Text style={styles.emptySetsText}>Aucune série. Ajoutes-en dans la configuration.</Text>
          ) : (
            exercise.sets.map((set, setIndex) => {
              const prevSet = lastPerf?.sets?.[setIndex];
              const prevHint = prevSet
                ? `Dernière fois : ${formatLastPerformanceSet(prevSet, isCardio, exercise.isUnilateral)}`
                : null;

              return (
                <View key={set.id || setIndex} style={styles.setContainer}>
                  {/* Previous performance reminder */}
                  {prevHint ? <Text style={styles.lastPerfText}>{prevHint}</Text> : null}

                  {/* Main Set Inputs Row */}
                  <View style={styles.setRow}>
                    <View style={styles.setNumberBadge}>
                      <Text style={styles.setNumberText}>S{setIndex + 1}</Text>
                    </View>

                    {isCardio ? (
                      /* Cardio Inputs */
                      <View style={styles.cardioInputsRow}>
                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="Min"
                            placeholderTextColor={Colors.textMuted}
                            value={set.duration !== null && set.duration !== undefined ? String(set.duration) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'duration', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>min</Text>
                        </View>

                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="Km/h"
                            placeholderTextColor={Colors.textMuted}
                            value={set.speed !== null && set.speed !== undefined ? String(set.speed) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'speed', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>km/h</Text>
                        </View>

                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="Incl."
                            placeholderTextColor={Colors.textMuted}
                            value={set.incline !== null && set.incline !== undefined ? String(set.incline) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'incline', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>%</Text>
                        </View>
                      </View>
                    ) : (
                      /* Strength Inputs */
                      <View style={styles.muscuInputsRow}>
                        {/* Assist +/- Toggle */}
                        <TouchableOpacity
                          style={styles.signGlassBtn}
                          onPress={() => toggleNegativeWeight(setIndex)}
                        >
                          <Text style={styles.signBtnText}>+/-</Text>
                        </TouchableOpacity>

                        {/* Weight (Kg) */}
                        <View style={styles.inputWrap}>
                          <TextInput
                            style={[
                              styles.smartInput,
                              (set.weight ?? 0) < 0 ? { color: Colors.danger } : null,
                            ]}
                            keyboardType="numeric"
                            placeholder="Kg"
                            placeholderTextColor={Colors.textMuted}
                            value={set.weight !== null && set.weight !== undefined ? String(set.weight) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'weight', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>kg</Text>
                        </View>

                        {/* Reps */}
                        <Text style={styles.timesSeparator}>{exercise.isUnilateral ? 'G' : 'x'}</Text>
                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="Reps"
                            placeholderTextColor={Colors.textMuted}
                            value={set.reps !== null && set.reps !== undefined ? String(set.reps) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'reps', v ? parseInt(v, 10) : null)}
                          />
                        </View>

                        {/* Unilateral Right Side Reps */}
                        {exercise.isUnilateral && (
                          <>
                            <Text style={styles.timesSeparator}>D</Text>
                            <View style={styles.inputWrap}>
                              <TextInput
                                style={styles.smartInput}
                                keyboardType="numeric"
                                placeholder="Reps"
                                placeholderTextColor={Colors.textMuted}
                                value={set.repsRight !== null && set.repsRight !== undefined ? String(set.repsRight) : ''}
                                onChangeText={v => handleSetFieldChange(setIndex, 'repsRight', v ? parseInt(v, 10) : null)}
                              />
                            </View>
                          </>
                        )}

                        {/* Failure Bolt ⚡️ */}
                        <TouchableOpacity
                          style={[
                            styles.failureGlassBtn,
                            set.isFailure && styles.failureGlassBtnActive,
                          ]}
                          onPress={() => toggleFailure(setIndex)}
                        >
                          <Zap
                            color={set.isFailure ? Colors.textDark : Colors.textMuted}
                            fill={set.isFailure ? Colors.textDark : 'transparent'}
                            size={16}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Drop Sets (Dégressif) List */}
                  {!isCardio && (
                    <View style={styles.dropsContainer}>
                      {set.drops.map((drop, dropIndex) => (
                        <View key={drop.id || dropIndex} style={styles.dropRow}>
                          <CornerDownRight color={Colors.dropRed} size={15} />

                          <View style={styles.dropInputWrap}>
                            <TextInput
                              style={[styles.smartInput, styles.dropInput]}
                              keyboardType="numeric"
                              placeholder="Kg"
                              placeholderTextColor={Colors.textMuted}
                              value={drop.weight !== null && drop.weight !== undefined ? String(drop.weight) : ''}
                              onChangeText={v => handleDropFieldChange(setIndex, dropIndex, 'weight', v ? parseFloat(v.replace(',', '.')) : null)}
                            />
                            <Text style={styles.inputUnit}>kg</Text>
                          </View>

                          <Text style={styles.timesSeparator}>{exercise.isUnilateral ? 'G' : 'x'}</Text>
                          <View style={styles.dropInputWrap}>
                            <TextInput
                              style={[styles.smartInput, styles.dropInput]}
                              keyboardType="numeric"
                              placeholder="Reps"
                              placeholderTextColor={Colors.textMuted}
                              value={drop.reps !== null && drop.reps !== undefined ? String(drop.reps) : ''}
                              onChangeText={v => handleDropFieldChange(setIndex, dropIndex, 'reps', v ? parseInt(v, 10) : null)}
                            />
                          </View>

                          {exercise.isUnilateral && (
                            <>
                              <Text style={styles.timesSeparator}>D</Text>
                              <View style={styles.dropInputWrap}>
                                <TextInput
                                  style={[styles.smartInput, styles.dropInput]}
                                  keyboardType="numeric"
                                  placeholder="Reps"
                                  placeholderTextColor={Colors.textMuted}
                                  value={drop.repsRight !== null && drop.repsRight !== undefined ? String(drop.repsRight) : ''}
                                  onChangeText={v => handleDropFieldChange(setIndex, dropIndex, 'repsRight', v ? parseInt(v, 10) : null)}
                                />
                              </View>
                            </>
                          )}

                          <TouchableOpacity
                            style={styles.deleteDropBtn}
                            onPress={() => handleDeleteDrop(setIndex, drop.id)}
                          >
                            <Trash2 color={Colors.textMuted} size={14} />
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* Add Drop Set Button */}
                      <TouchableOpacity
                        style={styles.addDropBtn}
                        onPress={() => handleAddDrop(setIndex)}
                      >
                        <CornerDownRight color={Colors.dropRed} size={13} />
                        <Text style={styles.addDropText}>Ajouter dégressif (Drop set)</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Machine Settings Modal */}
      <MachineSettingsModal
        visible={showSettingsModal}
        exerciseName={exercise.name}
        initialSettings={exercise.machineSettings}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  settingsBadgeText: {
    fontSize: 11,
    color: Colors.neonGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsGlassBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 110,
  },
  glassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  configSubLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  stepperGlassBtn: {
    padding: Spacing.sm,
  },
  stepperText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'center',
  },
  perfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickTimerGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassNeon,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  quickTimerText: {
    color: Colors.neonGreen,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptySetsText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  setContainer: {
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  lastPerfText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginLeft: 45,
    fontWeight: '500',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  setNumberBadge: {
    width: 36,
    alignItems: 'center',
  },
  setNumberText: {
    color: Colors.blueAccent,
    fontSize: 13,
    fontWeight: '900',
  },
  muscuInputsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardioInputsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  signGlassBtn: {
    backgroundColor: Colors.glassCard,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  signBtnText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 8,
  },
  smartInput: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 42,
    height: 38,
    textAlign: 'center',
  },
  inputUnit: {
    color: Colors.textMuted,
    fontSize: 11,
    marginLeft: 2,
  },
  timesSeparator: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
  },
  failureGlassBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glassCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginLeft: 'auto',
  },
  failureGlassBtnActive: {
    backgroundColor: Colors.failureGold,
    borderColor: Colors.failureGold,
    shadowColor: Colors.failureGold,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  dropsContainer: {
    marginLeft: 45,
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  dropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassRedBorder,
    paddingHorizontal: 6,
  },
  dropInput: {
    height: 32,
    fontSize: 13,
    minWidth: 36,
  },
  deleteDropBtn: {
    padding: Spacing.xs,
    marginLeft: 4,
  },
  addDropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 45,
    marginTop: Spacing.xs + 2,
    gap: 4,
  },
  addDropText: {
    color: Colors.dropRed,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
