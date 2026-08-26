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
import { Colors, Spacing, BorderRadius } from '../../theme';
import { WorkoutExercise, GymSet, GymDrop, isExerciseCardio } from '../../types/gym';
import { useGym } from '../../context/GymContext';
import { formatLastPerformanceSet, triggerHaptic } from '../../utils/calculations';
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
import { MachineSettingsModal } from '../../components/modals/MachineSettingsModal';

interface ExerciseDetailScreenProps {
  exercise: WorkoutExercise;
  sessionDate: string;
  onUpdate: (updated: WorkoutExercise) => void;
  onBack: () => void;
}

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  exercise: initialExercise,
  sessionDate,
  onUpdate,
  onBack,
}) => {
  const { getLastPerformance, startRestTimer, addToCatalog } = useGym();
  const [exercise, setExercise] = useState<WorkoutExercise>(initialExercise);
  const [lastPerf, setLastPerf] = useState<WorkoutExercise | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isCardio = isExerciseCardio(exercise.name);

  useEffect(() => {
    const perf = getLastPerformance(exercise.name, sessionDate);
    setLastPerf(perf);
  }, [exercise.name, sessionDate, getLastPerformance]);

  const updateExerciseState = (newExo: WorkoutExercise) => {
    setExercise(newExo);
    onUpdate(newExo);
  };

  const handleSetTargetCount = (target: number) => {
    const safeTarget = Math.max(0, Math.min(20, target));
    const currentSets = [...exercise.sets];

    if (safeTarget > currentSets.length) {
      const added = safeTarget - currentSets.length;
      for (let i = 0; i < added; i++) {
        // Pré-remplir avec la dernière série si dispo pour un confort maximal
        const prevSet = currentSets[currentSets.length - 1];
        currentSets.push({
          id: Math.random().toString(36).substring(2, 9),
          weight: prevSet ? prevSet.weight : null,
          reps: prevSet ? prevSet.reps : null,
          repsRight: prevSet ? prevSet.repsRight : null,
          duration: prevSet ? prevSet.duration : null,
          speed: prevSet ? prevSet.speed : null,
          incline: prevSet ? prevSet.incline : null,
          isFailure: false,
          drops: [],
        });
      }
    } else if (safeTarget < currentSets.length) {
      currentSets.splice(safeTarget);
    }

    updateExerciseState({
      ...exercise,
      targetSetCount: safeTarget,
      sets: currentSets,
    });
  };

  const handleSetFieldChange = (
    index: number,
    field: keyof GymSet,
    value: any
  ) => {
    const currentSets = [...exercise.sets];
    currentSets[index] = { ...currentSets[index], [field]: value };
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  const handleToggleFailure = (index: number) => {
    const currentSets = [...exercise.sets];
    const nextVal = !currentSets[index].isFailure;
    currentSets[index] = { ...currentSets[index], isFailure: nextVal };
    if (nextVal) triggerHaptic('medium');
    else triggerHaptic('light');
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  const handleToggleSign = (index: number) => {
    const currentSets = [...exercise.sets];
    const currentW = currentSets[index].weight || 0;
    currentSets[index] = { ...currentSets[index], weight: currentW * -1 };
    triggerHaptic('light');
    updateExerciseState({ ...exercise, sets: currentSets });
  };

  // Drop Sets (Dégressif)
  const handleAddDrop = (setIndex: number) => {
    const currentSets = [...exercise.sets];
    const targetSet = currentSets[setIndex];
    const lastWeight = targetSet.drops.length > 0
      ? targetSet.drops[targetSet.drops.length - 1].weight
      : targetSet.weight;

    const newDrops = [
      ...targetSet.drops,
      {
        id: Math.random().toString(36).substring(2, 9),
        weight: lastWeight ? Math.max(0, lastWeight - 5) : null,
        reps: null,
        repsRight: null,
      },
    ];

    currentSets[setIndex] = { ...targetSet, drops: newDrops };
    triggerHaptic('light');
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
          style={styles.settingsBtn}
          onPress={() => setShowSettingsModal(true)}
        >
          <Info color={exercise.machineSettings ? Colors.neonGreen : Colors.textMuted} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CONFIGURATION</Text>

          {/* Sets Count Stepper */}
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>
              {isCardio ? 'Intervalles :' : 'Nombre de séries :'}
            </Text>
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleSetTargetCount(exercise.sets.length - 1)}
              >
                <Minus color={Colors.textPrimary} size={16} />
              </TouchableOpacity>
              <Text style={styles.stepperText}>{exercise.sets.length}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleSetTargetCount(exercise.sets.length + 1)}
              >
                <Plus color={Colors.textPrimary} size={16} />
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

        {/* Sets & Performance Table */}
        <View style={styles.card}>
          <View style={styles.perfHeaderRow}>
            <Text style={styles.sectionTitle}>PERFORMANCES</Text>
            <TouchableOpacity
              style={styles.quickTimerBtn}
              onPress={() => startRestTimer(90)}
            >
              <Timer color={Colors.neonGreen} size={16} />
              <Text style={styles.quickTimerText}>Chrono</Text>
            </TouchableOpacity>
          </View>

          {exercise.sets.length === 0 ? (
            <Text style={styles.emptySetsText}>
              Ajoute des séries avec les boutons ci-dessus 👆
            </Text>
          ) : (
            exercise.sets.map((set, setIndex) => {
              const lastSet = lastPerf && setIndex < lastPerf.sets.length ? lastPerf.sets[setIndex] : null;

              return (
                <View key={set.id || setIndex} style={styles.setContainer}>
                  {/* Previous Performance Hint */}
                  {lastSet ? (
                    <Text style={styles.lastPerfText}>
                      Dernière fois : {formatLastPerformanceSet(lastSet, isCardio, exercise.isUnilateral)}
                    </Text>
                  ) : lastPerf ? (
                    <Text style={[styles.lastPerfText, { color: Colors.textMuted }]}>
                      Pas de donnée pour cette série
                    </Text>
                  ) : null}

                  {/* Set Row Input */}
                  <View style={styles.setRow}>
                    <View style={styles.setNumberBadge}>
                      <Text style={styles.setNumberText}>#{setIndex + 1}</Text>
                    </View>

                    {/* Cardio vs Strength Input */}
                    {isCardio ? (
                      <View style={styles.cardioInputsRow}>
                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="Min"
                            placeholderTextColor={Colors.textMuted}
                            value={set.duration ? String(set.duration) : ''}
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
                            value={set.speed ? String(set.speed) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'speed', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>km/h</Text>
                        </View>

                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.smartInput}
                            keyboardType="numeric"
                            placeholder="%"
                            placeholderTextColor={Colors.textMuted}
                            value={set.incline ? String(set.incline) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'incline', v ? parseFloat(v.replace(',', '.')) : null)}
                          />
                          <Text style={styles.inputUnit}>%</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.muscuInputsRow}>
                        {/* +/- Assist Toggle */}
                        <TouchableOpacity
                          style={styles.signBtn}
                          onPress={() => handleToggleSign(setIndex)}
                        >
                          <Text style={styles.signBtnText}>+/-</Text>
                        </TouchableOpacity>

                        {/* Weight (Kg) */}
                        <View style={styles.inputWrap}>
                          <TextInput
                            style={[styles.smartInput, set.weight && set.weight < 0 && { color: Colors.danger }]}
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
                            keyboardType="number-pad"
                            placeholder="Reps"
                            placeholderTextColor={Colors.textMuted}
                            value={set.reps !== null && set.reps !== undefined ? String(set.reps) : ''}
                            onChangeText={v => handleSetFieldChange(setIndex, 'reps', v ? parseInt(v, 10) : null)}
                          />
                        </View>

                        {/* Right Reps if Unilateral */}
                        {exercise.isUnilateral && (
                          <>
                            <Text style={styles.timesSeparator}>D</Text>
                            <View style={styles.inputWrap}>
                              <TextInput
                                style={styles.smartInput}
                                keyboardType="number-pad"
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
                            styles.failureBtn,
                            set.isFailure && styles.failureBtnActive,
                          ]}
                          onPress={() => handleToggleFailure(setIndex)}
                        >
                          <Zap
                            color={set.isFailure ? Colors.textDark : Colors.textMuted}
                            fill={set.isFailure ? Colors.textDark : 'none'}
                            size={18}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Drop Sets (Dégressif) List */}
                  {set.drops && set.drops.length > 0 && (
                    <View style={styles.dropsContainer}>
                      {set.drops.map((drop, dropIndex) => (
                        <View key={drop.id || dropIndex} style={styles.dropRow}>
                          <CornerDownRight color={Colors.dropRed} size={16} />
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
                              keyboardType="number-pad"
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
                                  keyboardType="number-pad"
                                  placeholder="Reps"
                                  placeholderTextColor={Colors.textMuted}
                                  value={drop.repsRight !== null && drop.repsRight !== undefined ? String(drop.repsRight) : ''}
                                  onChangeText={v => handleDropFieldChange(setIndex, dropIndex, 'repsRight', v ? parseInt(v, 10) : null)}
                                />
                              </View>
                            </>
                          )}

                          <TouchableOpacity
                            onPress={() => handleDeleteDrop(setIndex, drop.id)}
                            style={styles.deleteDropBtn}
                          >
                            <Trash2 color={Colors.textMuted} size={16} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Drop Button */}
                  {!isCardio && (
                    <TouchableOpacity
                      style={styles.addDropBtn}
                      onPress={() => handleAddDrop(setIndex)}
                    >
                      <CornerDownRight color={Colors.dropRed} size={14} />
                      <Text style={styles.addDropText}>Dégressif (Drop set)</Text>
                    </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
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
  settingsBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepperBtn: {
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
  quickTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonGreenSoft,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
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
    width: 38,
    alignItems: 'center',
  },
  setNumberText: {
    color: Colors.blueAccent,
    fontSize: 14,
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
  signBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  signBtnText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 8,
  },
  smartInput: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 44,
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
  failureBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginLeft: 'auto',
  },
  failureBtnActive: {
    backgroundColor: Colors.failureGold,
    borderColor: Colors.failureGold,
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dropRed,
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
