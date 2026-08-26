import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { BlurView } from 'expo-blur';
import { triggerHaptic } from '../../utils/calculations';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'neon' | 'purple' | 'glass' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'neon',
  icon,
  style,
  textStyle,
  disabled = false,
  size = 'md',
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('light');
    onPress();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'neon':
        return styles.neonBtn;
      case 'purple':
        return styles.purpleBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'ghost':
        return styles.ghostBtn;
      case 'glass':
      default:
        return styles.glassBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'neon':
        return styles.neonText;
      case 'purple':
        return styles.purpleText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      case 'glass':
      default:
        return styles.glassText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseBtn, getContainerStyle(), getSizeStyle(), disabled && styles.disabled, style]}
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled}
    >
      {/* Top Glass Light Reflection Edge */}
      <View style={styles.glassReflectionTop} />

      <View style={styles.contentRow}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={[getTextStyle(), styles.baseText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
  },
  iconWrap: {
    marginRight: 2,
  },
  baseText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: Colors.glassBorderTop,
    borderRadius: 1,
  },
  sizeSm: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
  },
  sizeMd: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sizeLg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  neonBtn: {
    backgroundColor: 'rgba(51, 255, 85, 0.16)',
    borderColor: Colors.glassNeonBorder,
    shadowColor: Colors.neonGreen,
    shadowOpacity: 0.25,
  },
  neonText: {
    color: Colors.neonGreen,
    fontSize: 13,
  },
  purpleBtn: {
    backgroundColor: Colors.glassPurple,
    borderColor: Colors.glassPurpleBorder,
    shadowColor: Colors.bisetPurple,
    shadowOpacity: 0.25,
  },
  purpleText: {
    color: Colors.bisetPurple,
    fontSize: 13,
  },
  glassBtn: {
    backgroundColor: Colors.glassCard,
    borderColor: Colors.glassBorder,
  },
  glassText: {
    color: Colors.textPrimary,
    fontSize: 13,
  },
  dangerBtn: {
    backgroundColor: Colors.glassRed,
    borderColor: Colors.glassRedBorder,
  },
  dangerText: {
    color: Colors.danger,
    fontSize: 13,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
  },
  ghostText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.45,
  },
});
