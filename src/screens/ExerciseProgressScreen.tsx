import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useGym } from '../context/GymContext';
import { calculate1RM, formatDateFr } from '../utils/calculations';
import { ChevronLeft, Trophy, TrendingUp, Calendar, Zap } from 'lucide-react-native';
import Svg, { Line, Circle as SvgCircle, Polyline, Text as SvgText } from 'react-native-svg';

interface ExerciseProgressScreenProps {
  exerciseName: string;
  onBack: () => void;
}

export const ExerciseProgressScreen: React.FC<ExerciseProgressScreenProps> = ({
  exerciseName,
  onBack,
}) => {
  const { history } = useGym();

  // Extract all sessions containing this exercise
  const sessionsWithExo = useMemo(() => {
    const list: { sessionDate: string; sets: any[]; isUnilateral: boolean }[] = [];

    history.forEach(session => {
      const match = session.exercises.find(
        e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
      );
      if (match && match.sets && match.sets.length > 0) {
        list.push({
          sessionDate: session.date,
          sets: match.sets,
          isUnilateral: match.isUnilateral,
        });
      }
    });

    // Sort chronologically (oldest to newest)
    return list.sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );
  }, [history, exerciseName]);

  // Calculate 1RM chart points
  const chartPoints = useMemo(() => {
    const points: { date: string; displayDate: string; oneRM: number }[] = [];

    sessionsWithExo.forEach(item => {
      let max1RM = 0;
      item.sets.forEach(set => {
        const w = set.weight || 0;
        const r = set.reps || 0;
        if (w > 0 && r > 0) {
          const score = calculate1RM(w, r);
          if (score > max1RM) max1RM = score;
        } else if (w === 0 && r > 0) {
          if (r > max1RM) max1RM = r;
        }
      });

      if (max1RM > 0) {
        points.push({
          date: item.sessionDate,
          displayDate: formatDateFr(item.sessionDate, { short: true }),
          oneRM: Math.round(max1RM * 10) / 10,
        });
      }
    });

    return points;
  }, [sessionsWithExo]);

  const maxPR = useMemo(() => {
    if (chartPoints.length === 0) return 0;
    return Math.max(...chartPoints.map(p => p.oneRM));
  }, [chartPoints]);

  // Reverse sessions for reverse chronological display
  const reversedHistory = useMemo(() => {
    return [...sessionsWithExo].reverse();
  }, [sessionsWithExo]);

  // Chart Dimensions & calculations
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 64, 280);
  const chartHeight = 180;
  const paddingX = 30;
  const paddingY = 25;

  const minVal = chartPoints.length > 0 ? Math.min(...chartPoints.map(p => p.oneRM)) * 0.9 : 0;
  const maxVal = chartPoints.length > 0 ? Math.max(...chartPoints.map(p => p.oneRM)) * 1.1 : 100;
  const valRange = Math.max(1, maxVal - minVal);

  const getSvgCoordinates = (index: number, val: number) => {
    const x =
      chartPoints.length === 1
        ? chartWidth / 2
        : paddingX + (index / (chartPoints.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const polylinePoints = chartPoints
    .map((p, i) => {
      const { x, y } = getSvgCoordinates(i, p.oneRM);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backGlassBtn} onPress={onBack}>
          <ChevronLeft color={Colors.neonGreen} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exerciseName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Estimated 1RM Record Glass Card */}
        <View style={styles.prGlassCard}>
          <View style={styles.glassReflectionTop} />
          <View style={styles.prHeader}>
            <Trophy color={Colors.neonGreen} size={20} />
            <Text style={styles.prLabel}>RECORD ESTIMÉ (1RM)</Text>
          </View>
          <View style={styles.prValueRow}>
            <Text style={styles.prValue}>{maxPR}</Text>
            <Text style={styles.prUnit}>kg</Text>
          </View>
        </View>

        {/* 1RM Line Chart Glass Card */}
        <View style={styles.chartGlassCard}>
          <View style={styles.glassReflectionTop} />
          <View style={styles.chartHeader}>
            <TrendingUp color={Colors.neonGreen} size={18} />
            <Text style={styles.chartTitle}>ÉVOLUTION DE LA FORCE</Text>
          </View>

          {chartPoints.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>
                Fais cet exercice avec du poids et des répétitions pour générer la courbe.
              </Text>
            </View>
          ) : (
            <View style={styles.chartSvgWrap}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Horizontal Guide Lines */}
                <Line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke={Colors.glassBorder}
                  strokeWidth="1"
                />
                <Line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke={Colors.glassBorder}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />

                {/* Main Curve */}
                {chartPoints.length > 1 && (
                  <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={Colors.neonGreen}
                    strokeWidth="3"
                  />
                )}

                {/* Point Marks & Labels */}
                {chartPoints.map((point, index) => {
                  const { x, y } = getSvgCoordinates(index, point.oneRM);
                  return (
                    <React.Fragment key={point.date + index}>
                      <SvgCircle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={Colors.textPrimary}
                        stroke={Colors.neonGreen}
                        strokeWidth="2"
                      />
                      <SvgText
                        x={x}
                        y={chartHeight - 6}
                        fill={Colors.textMuted}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {point.displayDate}
                      </SvgText>
                      <SvgText
                        x={x}
                        y={y - 10}
                        fill={Colors.textPrimary}
                        fontSize="10"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {point.oneRM}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
              <Text style={styles.formulaNote}>
                Calculé selon la formule universelle de Brzycki
              </Text>
            </View>
          )}
        </View>

        {/* Chronological Sets History */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>HISTORIQUE DES SÉANCES</Text>

          {reversedHistory.length === 0 ? (
            <Text style={styles.emptyHistoryText}>Aucune séance enregistrée</Text>
          ) : (
            reversedHistory.map((item, idx) => (
              <View key={item.sessionDate + idx} style={styles.historyGlassCard}>
                <View style={styles.glassReflectionTop} />
                <View style={styles.historyCardHeader}>
                  <Calendar color={Colors.neonGreen} size={14} />
                  <Text style={styles.historyDateText}>
                    {formatDateFr(item.sessionDate)}
                  </Text>
                </View>

                <View style={styles.historySetsList}>
                  {item.sets.map((set, sIdx) => {
                    const failure = set.isFailure;
                    const w = set.weight || 0;
                    const r = set.reps || 0;
                    const rr = set.repsRight || 0;

                    let setText = '';
                    if (set.duration) {
                      setText = `${Math.round(set.duration)} min à ${Math.round(set.speed || 0)} km/h`;
                    } else if (item.isUnilateral) {
                      setText = `${w}kg x G:${r} D:${rr}`;
                    } else {
                      setText = `${w}kg x ${r}`;
                    }

                    return (
                      <View key={set.id || sIdx} style={styles.historySetGlassRow}>
                        <Text style={styles.historySetIdx}>Set {sIdx + 1}</Text>
                        <Text style={styles.historySetText}>{setText}</Text>
                        {failure && (
                          <View style={styles.failureBadge}>
                            <Zap color={Colors.failureGold} fill={Colors.failureGold} size={12} />
                            <Text style={styles.failureBadgeText}>Échec</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
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
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 110,
  },
  prGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassNeonBorder,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  prLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  prValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  prValue: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  prUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  chartGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 1,
  },
  emptyChart: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyChartText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  chartSvgWrap: {
    alignItems: 'center',
  },
  formulaNote: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
  historySection: {
    gap: Spacing.sm,
  },
  historySectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  emptyHistoryText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  historyGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  historyDateText: {
    color: Colors.neonGreen,
    fontSize: 13,
    fontWeight: 'bold',
  },
  historySetsList: {
    gap: 6,
  },
  historySetGlassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  historySetIdx: {
    width: 48,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  historySetText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  failureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.failureGoldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  failureBadgeText: {
    color: Colors.failureGold,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
