import React, { useState, useMemo } from 'react';
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
import { WorkoutSession, WorkoutExercise } from '../../types/gym';
import { formatDateFr, isSameDay } from '../../utils/calculations';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  BookmarkPlus,
  Dumbbell,
  Play,
  Layers,
} from 'lucide-react-native';
import { AddExerciseModal } from '../../components/modals/AddExerciseModal';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';

const DAYS_OF_WEEK = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

export const CalendarScreen: React.FC = () => {
  const {
    history,
    workoutTemplates,
    templateOrder,
    saveSession,
    updateSession,
    deleteSession,
    saveSessionAsTemplate,
  } = useGym();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(true);

  const [showAddExoModal, setShowAddExoModal] = useState<boolean>(false);
  const [isBisetAdd, setIsBisetAdd] = useState<boolean>(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');

  const [selectedExoDetail, setSelectedExoDetail] = useState<WorkoutExercise | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthTitle = useMemo(() => {
    return currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // Extract calendar days
  const calendarGridDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // In French week, Monday = 0, Sunday = 6
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonthDate]);

  // Selected session
  const selectedSession = useMemo(() => {
    return history.find(s => isSameDay(s.date, selectedDate));
  }, [history, selectedDate]);

  const hasSessionOnDate = (date: Date): boolean => {
    return history.some(s => isSameDay(s.date, date) && s.exercises.length > 0);
  };

  const handleStartSessionOnSelectedDate = (templateName?: string) => {
    const newExercises: WorkoutExercise[] = [];

    if (templateName && workoutTemplates[templateName]) {
      workoutTemplates[templateName].forEach(item => {
        newExercises.push({
          id: Math.random().toString(36).substring(2, 9),
          name: item.name,
          sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
          targetSetCount: 3,
          supersetId: item.supersetId || null,
          isUnilateral: false,
        });
      });
    }

    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      date: selectedDate.toISOString(),
      exercises: newExercises,
      isFinished: true,
    };

    saveSession(newSession);
    setShowTemplatePicker(false);
  };

  const handleAddExerciseToSelectedSession = (exo1: string, exo2?: string | null) => {
    if (!selectedSession) return;
    const updated = [...selectedSession.exercises];

    if (exo2 && exo2.trim()) {
      const supersetId = Math.random().toString(36).substring(2, 9);
      updated.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo1.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId,
        isUnilateral: false,
      });
      updated.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo2.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId,
        isUnilateral: false,
      });
    } else {
      updated.push({
        id: Math.random().toString(36).substring(2, 9),
        name: exo1.trim(),
        sets: [{ id: Math.random().toString(36).substring(2, 9), weight: null, reps: null, isFailure: false, drops: [] }],
        targetSetCount: 3,
        supersetId: null,
        isUnilateral: false,
      });
    }

    updateSession({ ...selectedSession, exercises: updated });
  };

  const handleDeleteSessionPrompt = () => {
    if (!selectedSession) return;
    Alert.alert(
      'Supprimer la séance ?',
      `Effacer la séance du ${formatDateFr(selectedSession.date)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteSession(selectedSession.id) },
      ]
    );
  };

  const handleSaveAsTemplate = () => {
    const clean = newTemplateName.trim();
    if (!clean || !selectedSession) return;
    saveSessionAsTemplate(selectedSession, clean);
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
    Alert.alert('Succès', `Le programme "${clean}" a été créé !`);
  };

  if (selectedExoDetail && selectedSession) {
    return (
      <ExerciseDetailScreen
        exercise={selectedExoDetail}
        sessionDate={selectedSession.date}
        onUpdate={updated => {
          const list = selectedSession.exercises.map(e => (e.id === updated.id ? updated : e));
          updateSession({ ...selectedSession, exercises: list });
          setSelectedExoDetail(updated);
        }}
        onBack={() => setSelectedExoDetail(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity style={styles.monthNavBtn} onPress={handlePrevMonth}>
            <ChevronLeft color={Colors.neonGreen} size={24} />
          </TouchableOpacity>
          <Text style={styles.monthTitleText}>{monthTitle.toUpperCase()}</Text>
          <TouchableOpacity style={styles.monthNavBtn} onPress={handleNextMonth}>
            <ChevronRight color={Colors.neonGreen} size={24} />
          </TouchableOpacity>
        </View>

        {isCalendarExpanded && (
          <>
            {/* Days of Week Row */}
            <View style={styles.daysOfWeekRow}>
              {DAYS_OF_WEEK.map(day => (
                <Text key={day} style={styles.dayOfWeekText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {calendarGridDays.map((date, idx) => {
                if (!date) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const hasSession = hasSessionOnDate(date);

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isToday && !isSelected && styles.dayCellToday,
                    ]}
                    onPress={() => setSelectedDate(date)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        isSelected && styles.dayNumberTextSelected,
                        isToday && !isSelected && styles.dayNumberTextToday,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {hasSession && (
                      <View
                        style={[
                          styles.sessionDot,
                          isSelected && styles.sessionDotSelected,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Collapsible Drawer Pull */}
        <TouchableOpacity
          style={styles.drawerToggle}
          onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.drawerPill} />
          {isCalendarExpanded ? (
            <ChevronUp color={Colors.textMuted} size={14} />
          ) : (
            <ChevronDown color={Colors.textMuted} size={14} />
          )}
        </TouchableOpacity>
      </View>

      {/* Selected Day Workout Content */}
      <ScrollView contentContainerStyle={styles.sessionScroll}>
        <View style={styles.sessionHeaderRow}>
          <Text style={styles.sessionDateTitle}>
            SÉANCE DU {formatDateFr(selectedDate.toISOString(), { short: true })}
          </Text>

          {!selectedSession && (
            <TouchableOpacity
              style={styles.addSessionBtn}
              onPress={() => setShowTemplatePicker(true)}
            >
              <Plus color={Colors.textDark} size={16} />
              <Text style={styles.addSessionBtnText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedSession && selectedSession.exercises.length > 0 ? (
          <View style={styles.sessionCard}>
            {selectedSession.exercises.map((exo, i) => {
              const isBiset = !!exo.supersetId;

              return (
                <TouchableOpacity
                  key={exo.id || i}
                  style={styles.exoRow}
                  onPress={() => setSelectedExoDetail(exo)}
                  activeOpacity={0.7}
                >
                  {isBiset && <View style={styles.bisetMarker} />}
                  <View style={styles.exoRowLeft}>
                    <Text style={styles.exoRowName} numberOfLines={1}>
                      {exo.name}
                    </Text>
                    {isBiset && <Text style={styles.bisetTag}>BISET</Text>}
                  </View>

                  <View style={styles.exoRowRight}>
                    <Text style={styles.setsCountText}>{exo.sets.length} séries</Text>
                    <ChevronRight color={Colors.textMuted} size={18} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Card Footer Actions */}
            <View style={styles.sessionCardFooter}>
              <TouchableOpacity
                style={styles.footerActionBtn}
                onPress={() => {
                  setIsBisetAdd(false);
                  setShowAddExoModal(true);
                }}
              >
                <Plus color={Colors.neonGreen} size={16} />
                <Text style={styles.footerActionText}>Ajouter un exercice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveAsTemplateActionBtn}
                onPress={() => setShowSaveTemplateModal(true)}
              >
                <BookmarkPlus color={Colors.textDark} size={16} style={{ marginRight: 6 }} />
                <Text style={styles.saveAsTemplateActionText}>Sauvegarder en programme</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteSessionActionBtn}
                onPress={handleDeleteSessionPrompt}
              >
                <Trash2 color={Colors.danger} size={15} style={{ marginRight: 6 }} />
                <Text style={styles.deleteSessionActionText}>Supprimer la séance</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.restDayCard}>
            <Dumbbell color={Colors.cardBorder} size={48} />
            <Text style={styles.restDayTitle}>Jour de repos</Text>
            <Text style={styles.restDaySub}>Aucun entraînement enregistré pour ce jour.</Text>
            <TouchableOpacity
              style={styles.startForDateBtn}
              onPress={() => setShowTemplatePicker(true)}
            >
              <Plus color={Colors.neonGreen} size={16} />
              <Text style={styles.startForDateBtnText}>Ajouter une séance à cette date</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExoModal}
        isBiset={isBisetAdd}
        onClose={() => setShowAddExoModal(false)}
        onSelect={handleAddExerciseToSelectedSession}
      />

      {/* Template Picker Modal for Selected Date */}
      <Modal visible={showTemplatePicker} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choisir un programme</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {templateOrder.map(tName => (
                <TouchableOpacity
                  key={tName}
                  style={styles.templateOptionBtn}
                  onPress={() => handleStartSessionOnSelectedDate(tName)}
                >
                  <Text style={styles.templateOptionText}>{tName}</Text>
                  <ChevronRight color={Colors.neonGreen} size={18} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.templateOptionBtn, { borderTopWidth: 1, borderTopColor: Colors.cardBorder }]}
                onPress={() => handleStartSessionOnSelectedDate(undefined)}
              >
                <Text style={[styles.templateOptionText, { color: Colors.textSecondary }]}>
                  Séance vide
                </Text>
                <Plus color={Colors.textSecondary} size={18} />
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowTemplatePicker(false)}
            >
              <Text style={styles.modalCancelText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save as Template Modal */}
      <Modal visible={showSaveTemplateModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sauvegarder en programme</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du programme (ex: Séance Dos / Bras)"
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
                <Text style={styles.modalConfirmText}>Enregistrer</Text>
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
  calendarSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  monthNavBtn: {
    padding: Spacing.xs,
  },
  monthTitleText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  dayOfWeekText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textMuted,
    width: 40,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.full,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.neonGreen,
    borderRadius: BorderRadius.full,
  },
  dayNumberText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberTextSelected: {
    color: Colors.textDark,
    fontWeight: '900',
  },
  dayNumberTextToday: {
    color: Colors.neonGreen,
    fontWeight: 'bold',
  },
  sessionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neonGreen,
    marginTop: 2,
  },
  sessionDotSelected: {
    backgroundColor: Colors.textDark,
  },
  drawerToggle: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  drawerPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
  },
  sessionScroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDateTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  addSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonGreen,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addSessionBtnText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  exoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  bisetMarker: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.bisetPurple,
  },
  exoRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exoRowName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  bisetTag: {
    color: Colors.bisetPurple,
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: Colors.bisetPurpleSoft,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  setsCountText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionCardFooter: {
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  footerActionText: {
    color: Colors.neonGreen,
    fontSize: 13,
    fontWeight: 'bold',
  },
  saveAsTemplateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  saveAsTemplateActionText: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: 'bold',
  },
  deleteSessionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
  },
  deleteSessionActionText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  restDayCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: Spacing.md,
  },
  restDayTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.md,
  },
  restDaySub: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  startForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonGreenSoft,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
  },
  startForDateBtnText: {
    color: Colors.neonGreen,
    fontSize: 13,
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
  templateOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  templateOptionText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
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
