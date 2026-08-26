import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import {
  Dumbbell,
  Scale,
  Calendar,
  Zap,
  Star,
  ChevronRight,
  TrendingUp,
  EyeOff,
  Eye,
  Activity,
} from 'lucide-react-native';
import { ExerciseProgressScreen } from './ExerciseProgressScreen';

export const AnalyticsScreen: React.FC = () => {
  const {
    history,
    exerciseCatalog,
    hiddenExercises,
    muscleGroups,
    getTotalSessionsCount,
    getTotalVolume,
    getAverageSessionsPerWeek,
    getFailurePercentage,
    getFavoriteExercise,
    getSessionFrequencies,
    toggleHideExercise,
  } = useGym();

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExoForProgress, setSelectedExoForProgress] = useState<string | null>(null);
  const [showHiddenView, setShowHiddenView] = useState(false);

  const totalSessions = getTotalSessionsCount();
  const totalVolume = getTotalVolume();
  const avgPerWeek = getAverageSessionsPerWeek();
  const failurePercent = getFailurePercentage();
  const favExo = getFavoriteExercise();
  const freqs = getSessionFrequencies();

  // All exercises that have data in history
  const allRecordedExercises = useMemo(() => {
    const set = new Set<string>();
    history.forEach(s => {
      s.exercises.forEach(e => {
        if (e.sets.length > 0) set.add(e.name.trim());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [history]);

  // Grouped exercises by muscle
  const muscleGroupsWithExos = useMemo(() => {
    const visible = allRecordedExercises.filter(e => !hiddenExercises.includes(e));
    const dict: Record<string, string[]> = {};

    visible.forEach(exo => {
      const match = exerciseCatalog.find(
        c => c.name.trim().toLowerCase() === exo.toLowerCase()
      );
      const muscle = match ? match.muscle : 'Autre';
      if (!dict[muscle]) dict[muscle] = [];
      dict[muscle].push(exo);
    });

    return Object.entries(dict)
      .map(([muscle, exos]) => ({ muscle, exos: exos.sort() }))
      .sort((a, b) => a.muscle.localeCompare(b.muscle));
  }, [allRecordedExercises, hiddenExercises, exerciseCatalog]);

  const hiddenRecordedExercises = useMemo(() => {
    return allRecordedExercises.filter(e => hiddenExercises.includes(e));
  }, [allRecordedExercises, hiddenExercises]);

  // If viewing single exercise progression chart
  if (selectedExoForProgress) {
    return (
      <ExerciseProgressScreen
        exerciseName={selectedExoForProgress}
        onBack={() => setSelectedExoForProgress(null)}
      />
    );
  }

  // If viewing a single muscle folder
  if (selectedMuscle) {
    const currentExos = allRecordedExercises
      .filter(e => !hiddenExercises.includes(e))
      .filter(exo => {
        const match = exerciseCatalog.find(
          c => c.name.trim().toLowerCase() === exo.toLowerCase()
        );
        const muscle = match ? match.muscle : 'Autre';
        return muscle === selectedMuscle;
      });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedMuscle(null)}>
            <ChevronRight
              color={Colors.neonGreen}
              size={28}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedMuscle.toUpperCase()}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {currentExos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun exercice pour ce muscle</Text>
            </View>
          ) : (
            currentExos.map(exoName => (
              <TouchableOpacity
                key={exoName}
                style={styles.exoProgressRow}
                onPress={() => setSelectedExoForProgress(exoName)}
                activeOpacity={0.7}
              >
                <Text style={styles.exoProgressName}>{exoName}</Text>
                <View style={styles.exoRowActions}>
                  <TouchableOpacity
                    style={styles.hideBtn}
                    onPress={e => {
                      e.stopPropagation();
                      toggleHideExercise(exoName);
                    }}
                  >
                    <EyeOff color={Colors.textMuted} size={16} />
                  </TouchableOpacity>
                  <ChevronRight color={Colors.neonGreen} size={18} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // If viewing hidden exercises list
  if (showHiddenView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowHiddenView(false)}>
            <ChevronRight
              color={Colors.neonGreen}
              size={28}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EXERCICES MASQUÉS</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {hiddenRecordedExercises.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun exercice masqué</Text>
            </View>
          ) : (
            hiddenRecordedExercises.map(exoName => (
              <View key={exoName} style={styles.exoProgressRow}>
                <Text style={[styles.exoProgressName, { color: Colors.textMuted }]}>
                  {exoName}
                </Text>
                <TouchableOpacity
                  style={styles.unhideBtn}
                  onPress={() => toggleHideExercise(exoName)}
                >
                  <Eye color={Colors.neonGreen} size={16} style={{ marginRight: 4 }} />
                  <Text style={styles.unhideBtnText}>Restaurer</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // --- MAIN ANALYTICS DASHBOARD ---
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Sessions Big Hero Card */}
        <View style={styles.heroCard}>
          <Dumbbell color={Colors.neonGreen} size={32} />
          <Text style={styles.heroNumber}>{totalSessions}</Text>
          <Text style={styles.heroLabel}>SÉANCES VALIDÉES</Text>
        </View>

        {/* 2x2 Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Volume */}
          <View style={styles.statCard}>
            <Scale color={Colors.neonGreen} size={20} />
            <Text style={styles.statCardLabel}>VOLUME TOTAL</Text>
            <View style={styles.statCardValueRow}>
              <Text style={styles.statCardValue}>{totalVolume}</Text>
              <Text style={styles.statCardUnit}>Tonnes</Text>
            </View>
          </View>

          {/* Average Sessions/Week */}
          <View style={styles.statCard}>
            <Calendar color={Colors.neonGreen} size={20} />
            <Text style={styles.statCardLabel}>FRÉQUENCE</Text>
            <View style={styles.statCardValueRow}>
              <Text style={styles.statCardValue}>{avgPerWeek}</Text>
              <Text style={styles.statCardUnit}>/ sem</Text>
            </View>
          </View>

          {/* Failure Rate */}
          <View style={styles.statCard}>
            <Zap color={Colors.failureGold} size={20} />
            <Text style={styles.statCardLabel}>TAUX D'ÉCHEC</Text>
            <View style={styles.statCardValueRow}>
              <Text style={[styles.statCardValue, { color: Colors.failureGold }]}>
                {failurePercent}%
              </Text>
            </View>
          </View>

          {/* Favorite Exercise */}
          <View style={styles.statCard}>
            <Star color={Colors.bisetPurple} size={20} />
            <Text style={styles.statCardLabel}>EXO FAVORI</Text>
            <Text style={styles.statCardFavText} numberOfLines={1}>
              {favExo}
            </Text>
          </View>
        </View>

        {/* Program Frequency Breakdown */}
        {freqs.most !== '-' && (
          <View style={styles.freqCard}>
            <Text style={styles.sectionHeaderTitle}>FRÉQUENCE DES PROGRAMMES</Text>
            <View style={styles.freqRow}>
              <Text style={styles.freqRowLabel}>Le plus fréquent :</Text>
              <Text style={styles.freqRowValue}>{freqs.most}</Text>
            </View>
            <View style={styles.freqRow}>
              <Text style={styles.freqRowLabel}>Le moins fréquent :</Text>
              <Text style={[styles.freqRowValue, { color: Colors.textMuted }]}>
                {freqs.least}
              </Text>
            </View>
          </View>
        )}

        {/* Muscle Progression Categories */}
        <View style={styles.progressionSection}>
          <Text style={styles.sectionHeaderTitle}>COURBES DE PROGRESSION (PAR MUSCLE)</Text>

          {muscleGroupsWithExos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Activity color={Colors.textMuted} size={32} />
              <Text style={styles.emptyText}>Aucune statistique pour le moment</Text>
              <Text style={styles.emptySubText}>
                Valide tes premières séances pour voir ta progression.
              </Text>
            </View>
          ) : (
            muscleGroupsWithExos.map(group => (
              <TouchableOpacity
                key={group.muscle}
                style={styles.muscleRow}
                onPress={() => setSelectedMuscle(group.muscle)}
                activeOpacity={0.7}
              >
                <Text style={styles.muscleRowName}>{group.muscle.toUpperCase()}</Text>
                <View style={styles.muscleRowRight}>
                  <Text style={styles.muscleExoCount}>
                    {group.exos.length} exo{group.exos.length > 1 ? 's' : ''}
                  </Text>
                  <ChevronRight color={Colors.neonGreen} size={18} />
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Hidden Exercises Button */}
          {hiddenRecordedExercises.length > 0 && (
            <TouchableOpacity
              style={styles.hiddenSectionBtn}
              onPress={() => setShowHiddenView(true)}
            >
              <EyeOff color={Colors.textMuted} size={16} />
              <Text style={styles.hiddenSectionBtnText}>
                Exercices masqués ({hiddenRecordedExercises.length})
              </Text>
              <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  heroNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 4,
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  statCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  statCardUnit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  statCardFavText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  freqCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freqRowLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  freqRowValue: {
    color: Colors.neonGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressionSection: {
    gap: Spacing.sm,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  muscleRowName: {
    color: Colors.neonGreen,
    fontSize: 15,
    fontWeight: '900',
  },
  muscleRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  muscleExoCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  exoProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  exoProgressName: {
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
  hideBtn: {
    padding: Spacing.xs,
  },
  unhideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonGreenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  unhideBtnText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  hiddenSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  hiddenSectionBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.xs,
  },
  emptyText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
