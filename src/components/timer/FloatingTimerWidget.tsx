import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import { formatSecondsToMMSS } from '../../utils/calculations';
import { Timer, Pause, Play } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export const FloatingTimerWidget: React.FC = () => {
  const { restTimer, showRestTimer, pauseRestTimer, resumeRestTimer } = useGym();

  if (restTimer.remainingSeconds <= 0 && !restTimer.isRunning) {
    return null;
  }

  return (
    <View style={styles.outerWrapper}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.glassContainer}>
        {/* Specular Highlight */}
        <View style={styles.glassReflectionTop} />

        <TouchableOpacity
          style={styles.contentRow}
          activeOpacity={0.85}
          onPress={showRestTimer}
        >
          <View style={styles.left}>
            <View style={styles.iconCircle}>
              <Timer color={Colors.neonGreen} size={16} />
            </View>
            <View>
              <Text style={styles.title}>REPOS</Text>
              <Text style={styles.timerValue}>
                {formatSecondsToMMSS(restTimer.remainingSeconds)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.toggleGlassBtn}
            onPress={e => {
              e.stopPropagation();
              if (restTimer.isRunning) pauseRestTimer();
              else resumeRestTimer();
            }}
          >
            {restTimer.isRunning ? (
              <Pause color={Colors.neonGreen} fill={Colors.neonGreen} size={15} />
            ) : (
              <Play color={Colors.neonGreen} fill={Colors.neonGreen} size={15} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 82,
    alignSelf: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
  },
  glassContainer: {
    backgroundColor: Colors.glassTabBar,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.glassNeonBorder,
    overflow: 'hidden',
    minWidth: 190,
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1.5,
    backgroundColor: Colors.glassBorderTop,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.glassNeon,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
  title: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.neonGreen,
    fontVariant: ['tabular-nums'],
  },
  toggleGlassBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glassNeon,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassNeonBorder,
  },
});
