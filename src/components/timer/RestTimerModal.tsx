import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import { formatSecondsToMMSS } from '../../utils/calculations';
import { Play, Pause, Square, X, Plus, Minus } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';

export const RestTimerModal: React.FC = () => {
  const { restTimer, startRestTimer, pauseRestTimer, resumeRestTimer, stopRestTimer, hideRestTimer } = useGym();
  const [customMinutes, setCustomMinutes] = useState(1);
  const [customSeconds, setCustomSeconds] = useState(30);

  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = restTimer.initialSeconds > 0
    ? restTimer.remainingSeconds / restTimer.initialSeconds
    : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const handleStartCustom = () => {
    const total = customMinutes * 60 + customSeconds;
    if (total > 0) {
      startRestTimer(total);
    }
  };

  return (
    <Modal
      visible={restTimer.isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={hideRestTimer}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={Platform.OS === 'ios' ? 85 : 100} tint="dark" style={styles.glassModalContent}>
          {/* Specular Top Reflection */}
          <View style={styles.glassReflectionTop} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>CHRONO DE REPOS</Text>
            <TouchableOpacity onPress={hideRestTimer} style={styles.closeGlassButton}>
              <X color={Colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Circular Countdown */}
          <View style={styles.circleContainer}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
              <Circle
                cx={110}
                cy={110}
                r={radius}
                stroke={Colors.glassBorder}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={110}
                cy={110}
                r={radius}
                stroke={restTimer.remainingSeconds === 0 ? Colors.danger : Colors.neonGreen}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
            </Svg>
            <View style={styles.timeCenter}>
              <Text style={styles.timeText}>
                {formatSecondsToMMSS(restTimer.remainingSeconds)}
              </Text>
              {restTimer.remainingSeconds === 0 && restTimer.initialSeconds > 0 ? (
                <Text style={styles.timeDone}>C'est reparti ! 💪</Text>
              ) : (
                <Text style={styles.timeStatus}>
                  {restTimer.isRunning ? 'En cours...' : 'En pause'}
                </Text>
              )}
            </View>
          </View>

          {/* Preset Buttons */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetGlassButton}
              onPress={() => startRestTimer(30)}
              activeOpacity={0.8}
            >
              <Text style={styles.presetButtonText}>30s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetGlassButton}
              onPress={() => startRestTimer(60)}
              activeOpacity={0.8}
            >
              <Text style={styles.presetButtonText}>1 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetGlassButton}
              onPress={() => startRestTimer(120)}
              activeOpacity={0.8}
            >
              <Text style={styles.presetButtonText}>2 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetGlassButton}
              onPress={() => startRestTimer(180)}
              activeOpacity={0.8}
            >
              <Text style={styles.presetButtonText}>3 min</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Time Selector */}
          <View style={styles.customGlassSection}>
            <Text style={styles.customSectionTitle}>TEMPS PERSONNALISÉ</Text>
            <View style={styles.customPickersRow}>
              {/* Minutes */}
              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCustomMinutes(m => Math.max(0, m - 1))}
                >
                  <Minus color={Colors.textPrimary} size={15} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{customMinutes} min</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCustomMinutes(m => Math.min(20, m + 1))}
                >
                  <Plus color={Colors.textPrimary} size={15} />
                </TouchableOpacity>
              </View>

              {/* Seconds */}
              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCustomSeconds(s => (s <= 0 ? 45 : s - 15))}
                >
                  <Minus color={Colors.textPrimary} size={15} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{customSeconds} s</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setCustomSeconds(s => (s >= 45 ? 0 : s + 15))}
                >
                  <Plus color={Colors.textPrimary} size={15} />
                </TouchableOpacity>
              </View>

              {/* Start custom button */}
              <TouchableOpacity
                style={styles.playCustomGlassBtn}
                onPress={handleStartCustom}
                activeOpacity={0.8}
              >
                <Play color={Colors.neonGreen} fill={Colors.neonGreen} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Controls Bar */}
          <View style={styles.controlsRow}>
            {(restTimer.isRunning || restTimer.remainingSeconds > 0) && (
              <>
                <TouchableOpacity
                  style={[styles.controlCircle, { backgroundColor: Colors.glassRed, borderColor: Colors.glassRedBorder }]}
                  onPress={stopRestTimer}
                >
                  <Square color={Colors.danger} fill={Colors.danger} size={18} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCircle, { backgroundColor: Colors.glassNeon, borderColor: Colors.glassNeonBorder }]}
                  onPress={restTimer.isRunning ? pauseRestTimer : resumeRestTimer}
                >
                  {restTimer.isRunning ? (
                    <Pause color={Colors.neonGreen} fill={Colors.neonGreen} size={22} />
                  ) : (
                    <Play color={Colors.neonGreen} fill={Colors.neonGreen} size={22} />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  glassModalContent: {
    backgroundColor: Colors.glassTabBar,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 1,
  },
  closeGlassButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.full,
  },
  circleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  timeCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timeStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  timeDone: {
    fontSize: 14,
    color: Colors.neonGreen,
    marginTop: Spacing.xs,
    fontWeight: 'bold',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
    width: '100%',
  },
  presetGlassButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  presetButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  customGlassSection: {
    width: '100%',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  customSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  customPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperValue: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
    minWidth: 46,
    textAlign: 'center',
  },
  playCustomGlassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassNeon,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    minHeight: 60,
  },
  controlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
