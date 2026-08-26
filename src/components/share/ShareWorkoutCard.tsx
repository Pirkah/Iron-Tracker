import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { WorkoutSession } from '../../types/gym';
import { formatDateFr } from '../../utils/calculations';
import { Zap, Dumbbell, Award, Share2, Flame, Layers } from 'lucide-react-native';

interface ShareWorkoutCardProps {
  session: WorkoutSession;
  onClose?: () => void;
}

export const ShareWorkoutCard: React.FC<ShareWorkoutCardProps> = ({ session, onClose }) => {
  const cardRef = useRef<View>(null);

  // Stats calculation
  let totalSets = 0;
  let totalFailures = 0;
  let totalVolumeKg = 0;

  session.exercises.forEach(exo => {
    totalSets += exo.sets.length;
    exo.sets.forEach(set => {
      if (set.isFailure) totalFailures++;
      const w = set.weight || 0;
      const r = (set.reps || 0) + (set.repsRight || 0);
      totalVolumeKg += w * (exo.isUnilateral ? r / 2 : r);
      set.drops.forEach(d => {
        const dw = d.weight || 0;
        const dr = (d.reps || 0) + (d.repsRight || 0);
        totalVolumeKg += dw * (exo.isUnilateral ? dr / 2 : dr);
      });
    });
  });

  const volumeTonnes = Math.round((totalVolumeKg / 1000) * 10) / 10;

  const handleNativeShare = async () => {
    try {
      const exoSummary = session.exercises
        .map(e => `• ${e.name} (${e.sets.length} séries)`)
        .join('\n');

      const message = `🔥 Séance Validée sur Iron Tracker !\n📅 ${formatDateFr(session.date)}\n\nExercices :\n${exoSummary}\n\n📊 Bilan :\n💪 ${totalSets} séries au total\n🏋️‍♂️ ${volumeTonnes} tonnes soulevées\n⚡️ ${totalFailures} séries à l'échec\n\n#IronTracker #Fitness #Workout`;

      await Share.share({
        message,
        title: 'Bilan Séance - Iron Tracker',
      });
    } catch (e) {
      console.warn('Erreur partage:', e);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* The Card */}
        <View ref={cardRef} style={styles.card}>
          {/* Top Brand Header */}
          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Zap color={Colors.neonGreen} fill={Colors.neonGreen} size={20} />
              <Text style={styles.brandTitle}>IRON TRACKER</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>SÉANCE VALIDÉE</Text>
            <Text style={styles.dateText}>{formatDateFr(session.date)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Exercise List (up to 8 items) */}
          <View style={styles.exerciseList}>
            {session.exercises.slice(0, 8).map((exo, idx) => (
              <View key={exo.id || idx} style={styles.exoRow}>
                <View style={styles.setCountBadge}>
                  <Text style={styles.setCountText}>{exo.sets.length}x</Text>
                </View>
                <View style={styles.exoInfo}>
                  <Text style={styles.exoName} numberOfLines={1}>
                    {exo.name}
                  </Text>
                  {exo.supersetId && (
                    <Text style={styles.bisetTag}>BISET</Text>
                  )}
                </View>
              </View>
            ))}

            {session.exercises.length > 8 && (
              <Text style={styles.moreExoText}>
                + {session.exercises.length - 8} autres exercices...
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Stats Badges Footer */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Dumbbell color={Colors.neonGreen} size={18} />
              <Text style={styles.statVal}>{session.exercises.length}</Text>
              <Text style={styles.statLbl}>EXOS</Text>
            </View>

            <View style={styles.statBox}>
              <Layers color={Colors.neonGreen} size={18} />
              <Text style={styles.statVal}>{totalSets}</Text>
              <Text style={styles.statLbl}>SÉRIES</Text>
            </View>

            <View style={styles.statBox}>
              <Award color={Colors.neonGreen} size={18} />
              <Text style={styles.statVal}>{volumeTonnes} T</Text>
              <Text style={styles.statLbl}>VOLUME</Text>
            </View>

            {totalFailures > 0 && (
              <View style={styles.statBox}>
                <Flame color={Colors.failureGold} size={18} />
                <Text style={[styles.statVal, { color: Colors.failureGold }]}>{totalFailures}</Text>
                <Text style={styles.statLbl}>ÉCHECS</Text>
              </View>
            )}
          </View>

          {/* Card Footer Tag */}
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>#NOEXCUSES • IRONSQUAD</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleNativeShare}
          activeOpacity={0.8}
        >
          <Share2 color={Colors.textDark} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>PARTAGER LE BILAN</Text>
        </TouchableOpacity>

        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.neonGreenBorder,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  badge: {
    backgroundColor: Colors.neonGreenSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
  },
  badgeText: {
    color: Colors.neonGreen,
    fontSize: 10,
    fontWeight: 'bold',
  },
  titleSection: {
    marginBottom: Spacing.sm,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  setCountBadge: {
    backgroundColor: Colors.neonGreenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    minWidth: 32,
    alignItems: 'center',
  },
  setCountText: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: '900',
  },
  exoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exoName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  bisetTag: {
    color: Colors.bisetPurple,
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: Colors.bisetPurpleSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moreExoText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statVal: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginVertical: 2,
  },
  statLbl: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cardFooterText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    width: '100%',
    maxWidth: 380,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  shareButtonText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
