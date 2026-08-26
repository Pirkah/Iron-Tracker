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
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
import { WorkoutSession, WorkoutExercise } from '../types/gym';
import { formatDateFr, isSameDay } from '../utils/calculations';
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
import { AddExerciseModal } from '../components/modals/AddExerciseModal';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';
import { GlassButton } from '../components/common/GlassButton';

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

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

  // Detail view state
  const [selectedExoDetail, setSelectedExoDetail] = useState<WorkoutExercise | null>(null);

  // Add exercise to selected date state
  const [showAddExoModal, setShowAddExoModal] = useState(false);
  const [isBisetAdd, setIsBisetAdd] = useState(false);

  // Template picker state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Save template state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

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

  const handleAddExerciseToSession = (exo1: string, exo2?: string | null) => {
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
      {/* Calendar Glass Section */}
      <View style={styles.calendarGlassSection}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity style={styles.monthNavGlassBtn} onPress={handlePrevMonth}>
            <ChevronLeft color={Colors.neonGreen} size={20} />
          </TouchableOpacity>
          <Text style={styles.monthTitleText}>{monthTitle.toUpperCase()}</Text>
          <TouchableOpacity style={styles.monthNavGlassBtn} onPress={handleNextMonth}>
            <ChevronRight color={Colors.neonGreen} size={20} />
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
            <GlassButton
              title="Ajouter"
              variant="neon"
              size="sm"
              icon={<Plus color={Colors.neonGreen} size={14} />}
              onPress={() => setShowTemplatePicker(true)}
            />
          )}
        </View>

        {selectedSession && selectedSession.exercises.length > 0 ? (
          <View style={styles.sessionGlassCard}>
            <View style={styles.glassReflectionTop} />

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
                <Plus color={Colors.neonGreen} size={15} />
                <Text style={styles.footerActionText}>Ajouter un exercice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveAsTemplateActionBtn}
                onPress={() => setShowSaveTemplateModal(true)}
              >
                <BookmarkPlus color={Colors.textPrimary} size={15} style={{ marginRight: 6 }} />
                <Text style={styles.saveAsTemplateActionText}>Sauvegarder en programme</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : selectedSession && selectedSession.exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Séance vide pour ce jour.</Text>
            <GlassButton
              title="Ajouter un exercice"
              variant="neon"
              onPress={() => {
                setIsBisetAdd(false);
                setShowAddExoModal(true);
              }}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun entraînement ce jour-là.</Text>
            <GlassButton
              title="Créer une séance rétroactive"
              variant="glass"
              onPress={() => setShowTemplatePicker(true)}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        )}

        {/* Delete session button if exists */}
        {selectedSession && (
          <TouchableOpacity
            style={styles.deleteSessionGlassBtn}
            onPress={handleDeleteSessionPrompt}
          >
            <Trash2 color={Colors.danger} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.deleteSessionText}>Supprimer cette séance</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExoModal}
        isBiset={isBisetAdd}
        onClose={() => setShowAddExoModal(false)}
        onSelect={handleAddExerciseToSession}
      />

      {/* Template Picker Modal (When creating a retroactive session) */}
      <Modal visible={showTemplatePicker} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Text style={styles.modalTitle}>Choisir une séance</Text>
            <Text style={styles.modalSubTitle}>
              Pour le {formatDateFr(selectedDate.toISOString())}
            </Text>

            <ScrollView style={{ maxHeight: 260, marginVertical: Spacing.md }}>
              <TouchableOpacity
                style={styles.templateOptionGlass}
                onPress={() => handleStartSessionOnSelectedDate()}
              >
                <Dumbbell color={Colors.neonGreen} size={18} style={{ marginRight: 10 }} />
                <Text style={styles.templateOptionText}>Séance Libre (Vide)</Text>
              </TouchableOpacity>

              {templateOrder.map(name => (
                <TouchableOpacity
                  key={name}
                  style={styles.templateOptionGlass}
                  onPress={() => handleStartSessionOnSelectedDate(name)}
                >
                  <Play color={Colors.neonGreen} size={16} style={{ marginRight: 10 }} />
                  <Text style={styles.templateOptionText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <GlassButton
              title="Annuler"
              variant="glass"
              onPress={() => setShowTemplatePicker(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Save Template Modal */}
      <Modal visible={showSaveTemplateModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Text style={styles.modalTitle}>Sauvegarder en programme</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du nouveau programme"
              placeholderTextColor={Colors.textMuted}
              value={newTemplateName}
              onChangeText={setNewTemplateName}
              autoFocus={true}
            />
            <View style={styles.modalActions}>
              <GlassButton
                title="Annuler"
                variant="glass"
                onPress={() => setShowSaveTemplateModal(false)}
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Créer"
                variant="neon"
                onPress={handleSaveAsTemplate}
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
  calendarGlassSection: {
    backgroundColor: Colors.glassCard,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.glassBorder,
    paddingTop: Spacing.sm,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  monthNavGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  dayCellSelected: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.neonGreen,
  },
  sessionDotSelected: {
    backgroundColor: Colors.textDark,
  },
  drawerToggle: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  drawerPill: {
    width: 36,
    height: 3,
    backgroundColor: Colors.glassBorder,
    borderRadius: 2,
  },
  sessionScroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 110,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDateTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  sessionGlassCard: {
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
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bisetTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.bisetPurple,
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
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 4,
  },
  sessionCardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  footerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
  },
  footerActionText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveAsTemplateActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  saveAsTemplateActionText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
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
    fontWeight: '600',
  },
  deleteSessionGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  deleteSessionText: {
    color: Colors.danger,
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
  modalSubTitle: {
    fontSize: 12,
    color: Colors.neonGreen,
    fontWeight: '600',
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
  templateOptionGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  templateOptionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
