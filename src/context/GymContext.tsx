import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  WorkoutSession,
  WorkoutExercise,
  TemplateItem,
  CatalogExercise,
  GymSet,
  isExerciseCardio,
} from '../types/gym';
import { StorageService, DEFAULT_MUSCLE_GROUPS, DEFAULT_TEMPLATES, DEFAULT_TEMPLATE_ORDER, DEFAULT_CATALOG } from '../services/storage';
import { calculate1RM, isSameDay, triggerHaptic } from '../utils/calculations';

interface RestTimerState {
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isVisible: boolean;
}

interface GymContextType {
  history: WorkoutSession[];
  workoutTemplates: Record<string, TemplateItem[]>;
  templateOrder: string[];
  exerciseCatalog: CatalogExercise[];
  hiddenExercises: string[];
  muscleGroups: string[];
  isLoading: boolean;
  restTimer: RestTimerState;

  // Session actions
  getSessionForDate: (date: Date | string) => WorkoutSession | undefined;
  startSessionFromTemplate: (templateName: string) => WorkoutSession;
  startEmptySession: () => WorkoutSession;
  saveSession: (session: WorkoutSession) => void;
  updateSession: (session: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  finishSession: (sessionId: string) => void;
  reopenSession: (sessionId: string) => void;

  // Template actions
  addTemplate: (name: string) => void;
  deleteTemplate: (name: string) => void;
  reorderTemplates: (newOrder: string[]) => void;
  saveSessionAsTemplate: (session: WorkoutSession, templateName: string) => void;
  addExerciseToTemplate: (templateName: string, exo1: string, exo2?: string | null) => void;
  deleteExerciseFromTemplate: (templateName: string, itemId: string) => void;
  updateTemplateItemName: (templateName: string, itemId: string, newName: string) => void;

  // Catalog & Muscle actions
  addToCatalog: (name: string, muscle: string, settings?: string | null) => void;
  getAllUniqueExercises: () => string[];
  globalRenameExercise: (oldName: string, newName: string) => void;
  globalDeleteExercise: (name: string) => void;
  addMuscleGroup: (name: string) => void;
  deleteMuscleGroup: (name: string) => void;
  changeMuscleForExercise: (exoName: string, newMuscle: string) => void;
  toggleHideExercise: (name: string) => void;

  // Statistics & Helpers
  getLastPerformance: (exerciseName: string, beforeDate?: Date | string) => WorkoutExercise | null;
  getAverageSessionsPerWeek: () => number;
  getFailurePercentage: () => number;
  getTotalVolume: () => number;
  getFavoriteExercise: () => string;
  getSessionFrequencies: () => { most: string; least: string };
  getTotalSessionsCount: () => number;

  // Rest Timer
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  stopRestTimer: () => void;
  hideRestTimer: () => void;
  showRestTimer: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<Record<string, TemplateItem[]>>(DEFAULT_TEMPLATES);
  const [templateOrder, setTemplateOrder] = useState<string[]>(DEFAULT_TEMPLATE_ORDER);
  const [exerciseCatalog, setExerciseCatalog] = useState<CatalogExercise[]>(DEFAULT_CATALOG);
  const [hiddenExercises, setHiddenExercises] = useState<string[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(DEFAULT_MUSCLE_GROUPS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Chrono de repos
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    initialSeconds: 90,
    remainingSeconds: 90,
    isRunning: false,
    isVisible: false,
  });

  const timerIntervalRef = useRef<any>(null);

  // Charger les données au montage
  useEffect(() => {
    async function initData() {
      try {
        const [h, t, to, c, hid, m] = await Promise.all([
          StorageService.loadHistory(),
          StorageService.loadTemplates(),
          StorageService.loadTemplateOrder(),
          StorageService.loadCatalog(),
          StorageService.loadHiddenExercises(),
          StorageService.loadMuscleGroups(),
        ]);
        setHistory(h);
        setWorkoutTemplates(t);
        setTemplateOrder(to);
        setExerciseCatalog(c);
        setHiddenExercises(hid);
        setMuscleGroups(m);
      } catch (e) {
        console.error('Erreur chargement données:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (restTimer.isRunning && restTimer.remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerIntervalRef.current);
            triggerHaptic('success');
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [restTimer.isRunning, restTimer.remainingSeconds]);

  // Sauvegardes
  const saveHistoryState = useCallback((newHistory: WorkoutSession[]) => {
    setHistory(newHistory);
    StorageService.saveHistory(newHistory);
  }, []);

  const saveTemplatesState = useCallback((newTemplates: Record<string, TemplateItem[]>, newOrder?: string[]) => {
    setWorkoutTemplates(newTemplates);
    StorageService.saveTemplates(newTemplates);
    if (newOrder) {
      setTemplateOrder(newOrder);
      StorageService.saveTemplateOrder(newOrder);
    }
  }, []);

  const saveCatalogState = useCallback((newCatalog: CatalogExercise[]) => {
    setExerciseCatalog(newCatalog);
    StorageService.saveCatalog(newCatalog);
  }, []);

  const saveHiddenExercisesState = useCallback((newHidden: string[]) => {
    setHiddenExercises(newHidden);
    StorageService.saveHiddenExercises(newHidden);
  }, []);

  const saveMusclesState = useCallback((newMuscles: string[]) => {
    setMuscleGroups(newMuscles);
    StorageService.saveMuscleGroups(newMuscles);
  }, []);

  // --- GESTION DES SÉANCES ---
  const getSessionForDate = useCallback(
    (date: Date | string) => {
      return history.find(s => isSameDay(s.date, date));
    },
    [history]
  );

  const startSessionFromTemplate = useCallback(
    (templateName: string): WorkoutSession => {
      const templateItems = workoutTemplates[templateName] || [];
      const exercises: WorkoutExercise[] = templateItems.map(item => {
        const catalogInfo = exerciseCatalog.find(c => c.name.toLowerCase() === item.name.toLowerCase());
        return {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: item.name,
          sets: [
            {
              id: Math.random().toString(36).substring(2, 9),
              weight: null,
              reps: null,
              isFailure: false,
              drops: [],
            },
          ],
          targetSetCount: 3,
          supersetId: item.supersetId || null,
          isUnilateral: false,
          machineSettings: catalogInfo?.machineSettings || null,
        };
      });

      const newSession: WorkoutSession = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        date: new Date().toISOString(),
        exercises,
        isFinished: false,
      };

      const existingIndex = history.findIndex(s => isSameDay(s.date, new Date()));
      let updated: WorkoutSession[];
      if (existingIndex >= 0) {
        updated = [...history];
        updated[existingIndex] = newSession;
      } else {
        updated = [newSession, ...history];
      }
      saveHistoryState(updated);
      triggerHaptic('medium');
      return newSession;
    },
    [history, workoutTemplates, exerciseCatalog, saveHistoryState]
  );

  const startEmptySession = useCallback((): WorkoutSession => {
    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      date: new Date().toISOString(),
      exercises: [],
      isFinished: false,
    };

    const existingIndex = history.findIndex(s => isSameDay(s.date, new Date()));
    let updated: WorkoutSession[];
    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = newSession;
    } else {
      updated = [newSession, ...history];
    }
    saveHistoryState(updated);
    triggerHaptic('medium');
    return newSession;
  }, [history, saveHistoryState]);

  const saveSession = useCallback(
    (session: WorkoutSession) => {
      const index = history.findIndex(s => isSameDay(s.date, session.date));
      let updated: WorkoutSession[];
      if (index >= 0) {
        updated = [...history];
        updated[index] = session;
      } else {
        updated = [session, ...history];
      }
      saveHistoryState(updated);
    },
    [history, saveHistoryState]
  );

  const updateSession = useCallback(
    (session: WorkoutSession) => {
      const index = history.findIndex(s => s.id === session.id);
      if (index >= 0) {
        const updated = [...history];
        updated[index] = session;
        saveHistoryState(updated);
      }
    },
    [history, saveHistoryState]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const updated = history.filter(s => s.id !== sessionId);
      saveHistoryState(updated);
      triggerHaptic('warning');
    },
    [history, saveHistoryState]
  );

  const finishSession = useCallback(
    (sessionId: string) => {
      const index = history.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        const updated = [...history];
        updated[index] = { ...updated[index], isFinished: true };
        saveHistoryState(updated);
        triggerHaptic('success');
      }
    },
    [history, saveHistoryState]
  );

  const reopenSession = useCallback(
    (sessionId: string) => {
      const index = history.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        const updated = [...history];
        updated[index] = { ...updated[index], isFinished: false };
        saveHistoryState(updated);
        triggerHaptic('medium');
      }
    },
    [history, saveHistoryState]
  );

  // --- GESTION DES PROGRAMMES ---
  const addTemplate = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean || workoutTemplates[clean]) return;
      const newTemplates = { ...workoutTemplates, [clean]: [] };
      const newOrder = [...templateOrder, clean];
      saveTemplatesState(newTemplates, newOrder);
      triggerHaptic('success');
    },
    [workoutTemplates, templateOrder, saveTemplatesState]
  );

  const deleteTemplate = useCallback(
    (name: string) => {
      const newTemplates = { ...workoutTemplates };
      delete newTemplates[name];
      const newOrder = templateOrder.filter(t => t !== name);
      saveTemplatesState(newTemplates, newOrder);
      triggerHaptic('warning');
    },
    [workoutTemplates, templateOrder, saveTemplatesState]
  );

  const reorderTemplates = useCallback(
    (newOrder: string[]) => {
      setTemplateOrder(newOrder);
      StorageService.saveTemplateOrder(newOrder);
    },
    []
  );

  const saveSessionAsTemplate = useCallback(
    (session: WorkoutSession, templateName: string) => {
      const clean = templateName.trim();
      if (!clean) return;
      const newItems: TemplateItem[] = session.exercises.map(e => ({
        id: Math.random().toString(36).substring(2, 9),
        name: e.name,
        supersetId: e.supersetId || null,
      }));

      const newTemplates = { ...workoutTemplates, [clean]: newItems };
      const newOrder = templateOrder.includes(clean) ? templateOrder : [...templateOrder, clean];
      saveTemplatesState(newTemplates, newOrder);
      triggerHaptic('success');
    },
    [workoutTemplates, templateOrder, saveTemplatesState]
  );

  const addExerciseToTemplate = useCallback(
    (templateName: string, exo1: string, exo2?: string | null) => {
      const clean1 = exo1.trim();
      if (!clean1) return;
      const current = workoutTemplates[templateName] ? [...workoutTemplates[templateName]] : [];

      if (exo2 && exo2.trim()) {
        const supersetId = Math.random().toString(36).substring(2, 9);
        current.push({ id: Math.random().toString(36).substring(2, 9), name: clean1, supersetId });
        current.push({ id: Math.random().toString(36).substring(2, 9), name: exo2.trim(), supersetId });
      } else {
        current.push({ id: Math.random().toString(36).substring(2, 9), name: clean1 });
      }

      saveTemplatesState({ ...workoutTemplates, [templateName]: current });
      triggerHaptic('light');
    },
    [workoutTemplates, saveTemplatesState]
  );

  const deleteExerciseFromTemplate = useCallback(
    (templateName: string, itemId: string) => {
      const current = workoutTemplates[templateName] || [];
      const updated = current.filter(i => i.id !== itemId);
      saveTemplatesState({ ...workoutTemplates, [templateName]: updated });
    },
    [workoutTemplates, saveTemplatesState]
  );

  const updateTemplateItemName = useCallback(
    (templateName: string, itemId: string, newName: string) => {
      const current = workoutTemplates[templateName] || [];
      const updated = current.map(item => (item.id === itemId ? { ...item, name: newName.trim() } : item));
      saveTemplatesState({ ...workoutTemplates, [templateName]: updated });
    },
    [workoutTemplates, saveTemplatesState]
  );

  // --- CATALOGUE & MUSCLES ---
  const addToCatalog = useCallback(
    (name: string, muscle: string, settings?: string | null) => {
      const clean = name.trim();
      if (!clean) return;
      const existingIndex = exerciseCatalog.findIndex(c => c.name.toLowerCase() === clean.toLowerCase());
      let updated: CatalogExercise[];
      if (existingIndex >= 0) {
        updated = [...exerciseCatalog];
        updated[existingIndex] = {
          ...updated[existingIndex],
          machineSettings: settings !== undefined ? settings : updated[existingIndex].machineSettings,
        };
      } else {
        updated = [
          ...exerciseCatalog,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: clean,
            muscle: muscle || 'Autre',
            machineSettings: settings || null,
          },
        ].sort((a, b) => a.name.localeCompare(b.name));
      }
      saveCatalogState(updated);
    },
    [exerciseCatalog, saveCatalogState]
  );

  const getAllUniqueExercises = useCallback((): string[] => {
    const map = new Map<string, string>();
    const add = (n: string) => {
      const clean = n.trim();
      if (clean && !map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), clean);
      }
    };
    exerciseCatalog.forEach(c => add(c.name));
    history.forEach(s => s.exercises.forEach(e => add(e.name)));
    Object.values(workoutTemplates).forEach(items => items.forEach(i => add(i.name)));
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [exerciseCatalog, history, workoutTemplates]);

  const globalRenameExercise = useCallback(
    (oldName: string, newName: string) => {
      const oldKey = oldName.trim().toLowerCase();
      const newClean = newName.trim();
      if (!newClean || oldKey === newClean.toLowerCase()) return;

      // 1. Update History
      const updatedHistory = history.map(session => ({
        ...session,
        exercises: session.exercises.map(exo =>
          exo.name.trim().toLowerCase() === oldKey ? { ...exo, name: newClean } : exo
        ),
      }));
      saveHistoryState(updatedHistory);

      // 2. Update Templates
      const updatedTemplates: Record<string, TemplateItem[]> = {};
      Object.keys(workoutTemplates).forEach(key => {
        updatedTemplates[key] = workoutTemplates[key].map(item =>
          item.name.trim().toLowerCase() === oldKey ? { ...item, name: newClean } : item
        );
      });
      saveTemplatesState(updatedTemplates);

      // 3. Update Catalog
      const updatedCatalog = exerciseCatalog.map(item =>
        item.name.trim().toLowerCase() === oldKey ? { ...item, name: newClean } : item
      );
      saveCatalogState(updatedCatalog);

      // 4. Update Hidden
      const updatedHidden = hiddenExercises.map(h =>
        h.trim().toLowerCase() === oldKey ? newClean : h
      );
      saveHiddenExercisesState(updatedHidden);
      triggerHaptic('success');
    },
    [history, workoutTemplates, exerciseCatalog, hiddenExercises, saveHistoryState, saveTemplatesState, saveCatalogState, saveHiddenExercisesState]
  );

  const globalDeleteExercise = useCallback(
    (name: string) => {
      const key = name.trim().toLowerCase();

      // 1. History
      const updatedHistory = history.map(session => ({
        ...session,
        exercises: session.exercises.filter(exo => exo.name.trim().toLowerCase() !== key),
      }));
      saveHistoryState(updatedHistory);

      // 2. Templates
      const updatedTemplates: Record<string, TemplateItem[]> = {};
      Object.keys(workoutTemplates).forEach(tName => {
        updatedTemplates[tName] = workoutTemplates[tName].filter(item => item.name.trim().toLowerCase() !== key);
      });
      saveTemplatesState(updatedTemplates);

      // 3. Catalog
      const updatedCatalog = exerciseCatalog.filter(item => item.name.trim().toLowerCase() !== key);
      saveCatalogState(updatedCatalog);

      // 4. Hidden
      const updatedHidden = hiddenExercises.filter(h => h.trim().toLowerCase() !== key);
      saveHiddenExercisesState(updatedHidden);
      triggerHaptic('warning');
    },
    [history, workoutTemplates, exerciseCatalog, hiddenExercises, saveHistoryState, saveTemplatesState, saveCatalogState, saveHiddenExercisesState]
  );

  const addMuscleGroup = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean || muscleGroups.includes(clean)) return;
      const updated = [...muscleGroups, clean].sort((a, b) => a.localeCompare(b));
      saveMusclesState(updated);
    },
    [muscleGroups, saveMusclesState]
  );

  const deleteMuscleGroup = useCallback(
    (name: string) => {
      const updatedCatalog = exerciseCatalog.map(c => (c.muscle === name ? { ...c, muscle: 'Autre' } : c));
      saveCatalogState(updatedCatalog);

      let updatedMuscles = muscleGroups.filter(m => m !== name);
      if (!updatedMuscles.includes('Autre')) updatedMuscles.push('Autre');
      saveMusclesState(updatedMuscles);
      triggerHaptic('warning');
    },
    [exerciseCatalog, muscleGroups, saveCatalogState, saveMusclesState]
  );

  const changeMuscleForExercise = useCallback(
    (exoName: string, newMuscle: string) => {
      const key = exoName.trim().toLowerCase();
      const existing = exerciseCatalog.find(c => c.name.trim().toLowerCase() === key);
      let updated: CatalogExercise[];
      if (existing) {
        updated = exerciseCatalog.map(c => (c.name.trim().toLowerCase() === key ? { ...c, muscle: newMuscle } : c));
      } else {
        updated = [...exerciseCatalog, { id: Math.random().toString(36).substring(2, 9), name: exoName.trim(), muscle: newMuscle }];
      }
      saveCatalogState(updated);
      triggerHaptic('light');
    },
    [exerciseCatalog, saveCatalogState]
  );

  const toggleHideExercise = useCallback(
    (name: string) => {
      const exists = hiddenExercises.includes(name);
      const updated = exists ? hiddenExercises.filter(h => h !== name) : [...hiddenExercises, name];
      saveHiddenExercisesState(updated);
      triggerHaptic('light');
    },
    [hiddenExercises, saveHiddenExercisesState]
  );

  // --- STATISTIQUES ---
  const getLastPerformance = useCallback(
    (exerciseName: string, beforeDate?: Date | string): WorkoutExercise | null => {
      const searchKey = exerciseName.trim().toLowerCase();
      const targetDate = beforeDate ? new Date(beforeDate).getTime() : Date.now();

      const previousSessions = history
        .filter(s => new Date(s.date).getTime() < targetDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      for (const session of previousSessions) {
        const found = session.exercises.find(e => e.name.trim().toLowerCase() === searchKey);
        if (found && found.sets.length > 0) {
          const hasData = found.sets.some(s => (s.weight || 0) > 0 || (s.reps || 0) > 0 || (s.duration || 0) > 0);
          if (hasData) return found;
        }
      }
      return null;
    },
    [history]
  );

  const getTotalSessionsCount = useCallback((): number => {
    return history.filter(s => s.exercises.length > 0).length;
  }, [history]);

  const getTotalVolume = useCallback((): number => {
    let volume = 0;
    for (const session of history) {
      for (const exo of session.exercises) {
        if (!isExerciseCardio(exo.name)) {
          for (const set of exo.sets) {
            const w = Math.abs(set.weight || 0);
            const r = (set.reps || 0) + (set.repsRight || 0);
            volume += w * (exo.isUnilateral ? r / 2 : r);
            for (const drop of set.drops) {
              const dw = Math.abs(drop.weight || 0);
              const dr = (drop.reps || 0) + (drop.repsRight || 0);
              volume += dw * (exo.isUnilateral ? dr / 2 : dr);
            }
          }
        }
      }
    }
    return Math.round((volume / 1000) * 10) / 10; // En tonnes
  }, [history]);

  const getAverageSessionsPerWeek = useCallback((): number => {
    const valid = history.filter(s => s.exercises.length > 0);
    if (valid.length <= 1) return valid.length;

    const dates = valid.map(s => new Date(s.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, diffDays / 7);
    return Math.round((valid.length / weeks) * 10) / 10;
  }, [history]);

  const getFailurePercentage = useCallback((): number => {
    let total = 0;
    let failures = 0;
    for (const s of history) {
      for (const e of s.exercises) {
        for (const set of e.sets) {
          total++;
          if (set.isFailure) failures++;
        }
      }
    }
    return total > 0 ? Math.round((failures / total) * 100) : 0;
  }, [history]);

  const getFavoriteExercise = useCallback((): string => {
    const counts: Record<string, number> = {};
    for (const s of history) {
      for (const e of s.exercises) {
        counts[e.name] = (counts[e.name] || 0) + 1;
      }
    }
    let max = 0;
    let fav = '-';
    Object.entries(counts).forEach(([name, count]) => {
      if (count > max) {
        max = count;
        fav = name;
      }
    });
    return fav;
  }, [history]);

  const getSessionFrequencies = useCallback((): { most: string; least: string } => {
    const counts: Record<string, number> = {};
    const valid = history.filter(s => s.exercises.length > 0);

    for (const s of valid) {
      const exoNames = s.exercises.map(e => e.name.toLowerCase()).sort().join(',');
      let matched = 'Séance Libre';

      for (const [tName, items] of Object.entries(workoutTemplates)) {
        const tNames = items.map(i => i.name.toLowerCase()).sort().join(',');
        if (tNames && exoNames.includes(tNames)) {
          matched = tName;
          break;
        }
      }
      counts[matched] = (counts[matched] || 0) + 1;
    }

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return { most: '-', least: '-' };
    return {
      most: entries[0][0],
      least: entries.length > 1 ? entries[entries.length - 1][0] : '(Pas assez)',
    };
  }, [history, workoutTemplates]);

  // --- REST TIMER ---
  const startRestTimer = useCallback((seconds: number) => {
    setRestTimer({
      initialSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      isVisible: true,
    });
    triggerHaptic('medium');
  }, []);

  const pauseRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isRunning: false }));
    triggerHaptic('light');
  }, []);

  const resumeRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isRunning: true }));
    triggerHaptic('light');
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isRunning: false, remainingSeconds: 0, isVisible: false }));
    triggerHaptic('light');
  }, []);

  const hideRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isVisible: true }));
  }, []);

  return (
    <GymContext.Provider
      value={{
        history,
        workoutTemplates,
        templateOrder,
        exerciseCatalog,
        hiddenExercises,
        muscleGroups,
        isLoading,
        restTimer,
        getSessionForDate,
        startSessionFromTemplate,
        startEmptySession,
        saveSession,
        updateSession,
        deleteSession,
        finishSession,
        reopenSession,
        addTemplate,
        deleteTemplate,
        reorderTemplates,
        saveSessionAsTemplate,
        addExerciseToTemplate,
        deleteExerciseFromTemplate,
        updateTemplateItemName,
        addToCatalog,
        getAllUniqueExercises,
        globalRenameExercise,
        globalDeleteExercise,
        addMuscleGroup,
        deleteMuscleGroup,
        changeMuscleForExercise,
        toggleHideExercise,
        getLastPerformance,
        getAverageSessionsPerWeek,
        getFailurePercentage,
        getTotalVolume,
        getFavoriteExercise,
        getSessionFrequencies,
        getTotalSessionsCount,
        startRestTimer,
        pauseRestTimer,
        resumeRestTimer,
        stopRestTimer,
        hideRestTimer,
        showRestTimer,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = (): GymContextType => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym doit être utilisé à l\'intérieur d\'un GymProvider');
  }
  return context;
};
