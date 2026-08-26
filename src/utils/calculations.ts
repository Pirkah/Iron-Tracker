import { GymSet, WorkoutExercise, isExerciseCardio } from '../types/gym';
import { Platform } from 'react-native';

/**
 * Calcul du 1RM estimé avec la formule de Brzycki :
 * 1RM = Poids / (1.0278 - (0.0278 * Reps))
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 30) return weight * 1.5; // Limite pour reps très élevées
  const oneRM = weight / (1.0278 - 0.0278 * reps);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Formate le texte d'une série passée ("80kg x 8 ⚡️", "Cardio: 20min à 10km/h")
 */
export function formatLastPerformanceSet(set: GymSet, isCardio: boolean, isUnilateral: boolean): string {
  if (isCardio) {
    const duration = Math.round(set.duration || 0);
    const speed = set.speed ? ` à ${Math.round(set.speed)} km/h` : '';
    const incline = set.incline ? ` (${Math.round(set.incline)}%)` : '';
    return `${duration} min${speed}${incline}`;
  }

  const weight = Math.round((set.weight || 0) * 10) / 10;
  const failure = set.isFailure ? ' ⚡️' : '';

  if (isUnilateral) {
    const left = set.reps || 0;
    const right = set.repsRight || 0;
    return `${weight}kg x G:${left} D:${right}${failure}`;
  }

  const reps = set.reps || 0;
  return `${weight}kg x ${reps}${failure}`;
}

/**
 * Formate un nombre de secondes en MM:SS
 */
export function formatSecondsToMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate une date en français
 */
export function formatDateFr(dateString: string, options?: { short?: boolean, includeDay?: boolean }): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (options?.short) {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }

    if (options?.includeDay) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Retourne le début de journée en format YYYY-MM-DD
 */
export function getDayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compare si deux dates sont le même jour
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Déclenchement de vibrations haptiques sécurisées
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  try {
    if (Platform.OS !== 'web') {
      const Haptics = await import('expo-haptics');
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch {
    // Ignorer si les haptiques ne sont pas dispo
  }
}
