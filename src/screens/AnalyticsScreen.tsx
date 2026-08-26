import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
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
import { GlassButton } from '../components/common/GlassButton';

export const AnalyticsScreen: React.FC = () => {
  const {
    history,
    exerciseCatalog,
    hiddenExercises,
    muscleGroups,
    toggleHideExercise,
    getTotalVolume,
    getAverageSessionsPerWeek,
    getFailurePercentage,
    getFavoriteExercise,
    getSessionFrequencies,
    getAllUniqueExercises,
  } = useGym();

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExoForProgress, setSelectedExoForProgress] = useState<string | null>(null);
  const [showHiddenView, setShowHiddenView] = useState(false);

  // Global calculations
  const totalSessions = history.filter(s => s.isFinished).length;
  const totalVolume = getTotalVolume();
  const avgPerWeek = getAverageSessionsPerWeek();
  const failurePercent = getFailurePercentage();
  const favExo = getFavoriteExercise();
  const freqs = getSessionFrequencies();

  // All exercises recorded in history (excluding hidden)
  const recordedExos = useMemo(() => {
    return getAllUniqueExercises().filter((name: string) => !hiddenExercises.includes(name));
  }, [getAllUniqueExercises, hiddenExercises]);

  // Hidden exercises
  const hiddenRecordedExercises = useMemo(() => {
    return getAllUniqueExercises().filter((name: string) => hiddenExercises.includes(name));
  }, [getAllUniqueExercises, hiddenExercises]);

  // Muscle groups that have recorded exercises
  const muscleGroupsWithExos = useMemo(() => {
    const list: { muscle: string; count: number }[] = [];

    muscleGroups.forEach((m: string) => {
      const count = recordedExos.filter((exoName: string) => {
        const match = exerciseCatalog.find(
          c => c.name.trim().toLowerCase() === exoName.toLowerCase()
        );
        const muscle = match ? match.muscle : 'Autre';
        return muscle === m;
      }).length;

      if (count > 0) {
        list.push({ muscle: m, count });
      }
    });

    return list;
  }, [muscleGroups, recordedExos, exerciseCatalog]);

  // If viewing single exercise progression chart
  if (selectedExoForProgress) {
    return (
      <ExerciseProgressScreen
        exerciseName={selectedExoForProgress}
        onBack={() => setSelectedExoForProgress(null)}
      />
    );
  }

  // If viewing exercises in a specific muscle folder
  if (selectedMuscle) {
    const currentExos = recordedExos.filter((exo: string) => {
      const match = exerciseCatalog.find(
        c => c.name.trim().toLowerCase() === exo.toLowerCase()
      );
      const muscle = match ? match.muscle : 'Autre';
      return muscle === selectedMuscle;
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backGlassBtn} onPress={() => setSelectedMuscle(null)}>
            <ChevronRight
              color={Colors.neonGreen}
              size={24}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedMuscle.toUpperCase()}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {currentExos.length === 0 ? (
            <View style={styles.emptyGlassCard}>
              <Text style={styles.emptyText}>Aucun exercice pour ce muscle</Text>
            </View>
          ) : (
            currentExos.map((exoName: string) => (
              <TouchableOpacity
                key={exoName}
                style={styles.exoProgressGlassRow}
                onPress={() => setSelectedExoForProgress(exoName)}
                activeOpacity={0.7}
              >
                <View style={styles.glassReflectionTop} />
                <Text style={styles.exoProgressName}>{exoName}</Text>
                <View style={styles.exoRowActions}>
                  <TouchableOpacity
                    style={styles.hideGlassBtn}
                    onPress={e => {
                      e.stopPropagation();
                      toggleHideExercise(exoName);
                    }}
                  >
                    <EyeOff color={Colors.textMuted} size={15} />
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
          <TouchableOpacity style={styles.backGlassBtn} onPress={() => setShowHiddenView(false)}>
            <ChevronRight
              color={Colors.neonGreen}
              size={24}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EXERCICES MASQUÉS</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {hiddenRecordedExercises.length === 0 ? (
            <View style={styles.emptyGlassCard}>
              <Text style={styles.emptyText}>Aucun exercice masqué</Text>
            </View>
          ) : (
            hiddenRecordedExercises.map((exoName: string) => (
              <View key={exoName} style={styles.exoProgressGlassRow}>
                <View style={styles.glassReflectionTop} />
                <Text style={[styles.exoProgressName, { color: Colors.textMuted }]}>
                  {exoName}
                </Text>
                <TouchableOpacity
                  style={styles.unhideGlassBtn}
                  onPress={() => toggleHideExercise(exoName)}
                >
                  <Eye color={Colors.neonGreen} size={15} style={{ marginRight: 4 }} />
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
        {/* Total Sessions Big Hero Glass Card */}
        <View style={styles.heroGlassCard}>
          <View style={styles.glassReflectionTop} />
          <Dumbbell color={Colors.neonGreen} size={32} />
          <Text style={styles.heroNumber}>{totalSessions}</Text>
          <Text style={styles.heroLabel}>SÉANCES VALIDÉES</Text>
        </View>

        {/* 2x2 Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Volume */}
          <View style={styles.statGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Scale color={Colors.neonGreen} size={18} />
            <Text style={styles.statCardLabel}>VOLUME TOTAL</Text>
            <View style={styles.statCardValueRow}>
              <Text style={styles.statCardValue}>{totalVolume}</Text>
              <Text style={styles.statCardUnit}>Tonnes</Text>
            </View>
          </View>

          {/* Average Sessions/Week */}
          <View style={styles.statGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Calendar color={Colors.neonGreen} size={18} />
            <Text style={styles.statCardLabel}>FRÉQUENCE</Text>
            <View style={styles.statCardValueRow}>
              <Text style={styles.statCardValue}>{avgPerWeek}</Text>
              <Text style={styles.statCardUnit}>/ sem</Text>
            </View>
          </View>

          {/* Failure Rate */}
          <View style={styles.statGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Zap color={Colors.failureGold} size={18} />
            <Text style={styles.statCardLabel}>TAUX D'ÉCHEC</Text>
            <View style={styles.statCardValueRow}>
              <Text style={[styles.statCardValue, { color: Colors.failureGold }]}>
                {failurePercent}%
              </Text>
            </View>
          </View>

          {/* Favorite Exercise */}
          <View style={styles.statGlassCard}>
            <View style={styles.glassReflectionTop} />
            <Star color={Colors.bisetPurple} size={18} />
            <Text style={styles.statCardLabel}>EXO FAVORI</Text>
            <Text style={styles.statCardFavText} numberOfLines={1}>
              {favExo}
            </Text>
          </View>
        </View>

        {/* Program Frequency Breakdown */}
        {freqs.most !== '-' && (
          <View style={styles.freqGlassCard}>
            <View style={styles.glassReflectionTop} />
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
            <View style={styles.emptyGlassCard}>
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
                style={styles.muscleFolderGlassCard}
                onPress={() => setSelectedMuscle(group.muscle)}
                activeOpacity={0.7}
              >
                <View style={styles.glassReflectionTop} />
                <View>
                  <Text style={styles.muscleFolderName}>{group.muscle.toUpperCase()}</Text>
                  <Text style={styles.muscleFolderCount}>
                    {group.count} exercice{group.count > 1 ? 's' : ''} pratiqué{group.count > 1 ? 's' : ''}
                  </Text>
                </View>
                <ChevronRight color={Colors.neonGreen} size={20} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Hidden Exercises Footer Button */}
        {hiddenRecordedExercises.length > 0 && (
          <TouchableOpacity
            style={styles.hiddenExosGlassBtn}
            onPress={() => setShowHiddenView(true)}
          >
            <EyeOff color={Colors.textMuted} size={15} style={{ marginRight: 6 }} />
            <Text style={styles.hiddenExosBtnText}>
              Gérer les exercices masqués ({hiddenRecordedExercises.length})
            </Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
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
    paddingBottom: 110,
  },
  heroGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.glassNeonBorder,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
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
  heroNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginVertical: Spacing.xs,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statGlassCard: {
    width: '47.5%',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: Spacing.xs + 2,
    marginBottom: Spacing.xs,
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
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  statCardFavText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  freqGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  freqRowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  freqRowValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressionSection: {
    gap: Spacing.sm,
  },
  muscleFolderGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  muscleFolderName: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  muscleFolderCount: {
    fontSize: 11,
    color: Colors.neonGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  exoProgressGlassRow: {
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
  exoProgressName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  exoRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hideGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.sm,
  },
  unhideGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassNeon,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  unhideBtnText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
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
  hiddenExosGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  hiddenExosBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
