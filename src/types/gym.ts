export interface GymDrop {
  id: string;
  weight?: number | null;
  reps?: number | null;
  repsRight?: number | null;
}

export interface GymSet {
  id: string;
  weight?: number | null;
  reps?: number | null;
  repsRight?: number | null;
  duration?: number | null;
  speed?: number | null;
  incline?: number | null;
  isFailure: boolean;
  drops: GymDrop[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: GymSet[];
  targetSetCount: number;
  supersetId?: string | null;
  isUnilateral: boolean;
  machineSettings?: string | null;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String (YYYY-MM-DDTHH:mm:ss.sssZ)
  exercises: WorkoutExercise[];
  isFinished: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  supersetId?: string | null;
}

export interface CatalogExercise {
  id: string;
  name: string;
  muscle: string;
  machineSettings?: string | null;
}

export interface ChartDataPoint {
  id: string;
  date: string;
  displayDate: string;
  value: number;
}

export type ExerciseStatus = 'notStarted' | 'inProgress' | 'completed';

export const CARDIO_KEYWORDS = ['Tapis', 'Vélo', 'Elliptique', 'Rameur', 'Escaliers', 'Cardio', 'Course', 'Sprint', 'Velo'];

export function isExerciseCardio(name: string): boolean {
  const lower = name.toLowerCase();
  return CARDIO_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}
