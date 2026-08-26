import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import { formatSecondsToMMSS } from '../../utils/calculations';
import { Timer, Pause, Play } from 'lucide-react-native';

export const FloatingTimerWidget: React.FC = () => {
  const { restTimer, showRestTimer, pauseRestTimer, resumeRestTimer } = useGym();

  if (restTimer.remainingSeconds <= 0 && !restTimer.isRunning) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={showRestTimer}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Timer color={Colors.neonGreen} size={18} />
        </View>
        <View>
          <Text style={styles.title}>REPOS</Text>
          <Text style={styles.timerValue}>
            {formatSecondsToMMSS(restTimer.remainingSeconds)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={e => {
          e.stopPropagation();
          if (restTimer.isRunning) pauseRestTimer();
          else resumeRestTimer();
        }}
      >
        {restTimer.isRunning ? (
          <Pause color={Colors.textDark} fill={Colors.textDark} size={16} />
        ) : (
          <Play color={Colors.textDark} fill={Colors.textDark} size={16} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
    minWidth: 180,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neonGreenSoft,
    justifyContent: 'center',
    alignItems: 'center',
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
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
});
