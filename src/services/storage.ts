import { WorkoutSession, TemplateItem, CatalogExercise } from '../types/gym';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  HISTORY: '@iron_tracker_history_v1',
  TEMPLATES: '@iron_tracker_templates_v1',
  TEMPLATE_ORDER: '@iron_tracker_template_order_v1',
  CATALOG: '@iron_tracker_catalog_v1',
  HIDDEN_EXERCISES: '@iron_tracker_hidden_exos_v1',
  MUSCLE_GROUPS: '@iron_tracker_muscles_v1',
};

export const DEFAULT_MUSCLE_GROUPS = [
  'Pectoraux',
  'Dos',
  'Jambes',
  'Épaules',
  'Biceps',
  'Triceps',
  'Abdos',
  'Cardio',
  'Autre',
];

export const DEFAULT_CATALOG: CatalogExercise[] = [
  { id: '1', name: 'Développé Couché Haltères', muscle: 'Pectoraux', machineSettings: 'Banc plat' },
  { id: '2', name: 'Développé Incliné Barre', muscle: 'Pectoraux', machineSettings: 'Banc incliné 30°' },
  { id: '3', name: 'Écarté Poulie Vis-à-Vis', muscle: 'Pectoraux', machineSettings: 'Poulies mi-hauteur' },
  { id: '4', name: 'Dips Pectoraux', muscle: 'Pectoraux', machineSettings: 'Ceinture de lest' },
  { id: '5', name: 'Tractions Pronation', muscle: 'Dos', machineSettings: '' },
  { id: '6', name: 'Tirage Vertical Poitrine', muscle: 'Dos', machineSettings: 'Cale genoux cran 3' },
  { id: '7', name: 'Rowing Barre Buste Penché', muscle: 'Dos', machineSettings: 'Prise neutre' },
  { id: '8', name: 'Rowing Bûcheron Haltère', muscle: 'Dos', machineSettings: '' },
  { id: '9', name: 'Développé Militaire Haltères', muscle: 'Épaules', machineSettings: 'Dossier 75°' },
  { id: '10', name: 'Élévations Latérales Poulie', muscle: 'Épaules', machineSettings: 'Poulie basse, poignée simple' },
  { id: '11', name: 'Face Pull Poulie', muscle: 'Épaules', machineSettings: 'Hauteur des yeux, corde' },
  { id: '12', name: 'Curl Incliné Haltères', muscle: 'Biceps', machineSettings: 'Incliné 45°' },
  { id: '13', name: 'Curl Barre EZ', muscle: 'Biceps', machineSettings: '' },
  { id: '14', name: 'Curl Marteau', muscle: 'Biceps', machineSettings: '' },
  { id: '15', name: 'Extensions Triceps Corde', muscle: 'Triceps', machineSettings: 'Poulie haute' },
  { id: '16', name: 'Barre au Front', muscle: 'Triceps', machineSettings: '' },
  { id: '17', name: 'Squat Barre', muscle: 'Jambes', machineSettings: 'Sécurités cran 8' },
  { id: '18', name: 'Presse à Cuisses', muscle: 'Jambes', machineSettings: 'Dossier cran 2' },
  { id: '19', name: 'Leg Extension', muscle: 'Jambes', machineSettings: 'Dossier 4, Rouleau 2' },
  { id: '20', name: 'Leg Curl Ischios', muscle: 'Jambes', machineSettings: 'Rouleau cheville 3' },
  { id: '21', name: 'Soulevé de Terre Roumain', muscle: 'Jambes', machineSettings: '' },
  { id: '22', name: 'Mollets Debout Machine', muscle: 'Jambes', machineSettings: 'Hauteur épaulières 5' },
  { id: '23', name: 'Crunch Poulie Haute', muscle: 'Abdos', machineSettings: 'Corde' },
  { id: '24', name: 'Relevés de Jambes Suspendu', muscle: 'Abdos', machineSettings: '' },
  { id: '25', name: 'Tapis de Course', muscle: 'Cardio', machineSettings: '' },
  { id: '26', name: 'Vélo Stationnaire', muscle: 'Cardio', machineSettings: 'Selle 6' },
];

export const DEFAULT_TEMPLATES: Record<string, TemplateItem[]> = {
  'Push': [
    { id: 'p1', name: 'Développé Couché Haltères' },
    { id: 'p2', name: 'Développé Incliné Barre' },
    { id: 'p3', name: 'Écarté Poulie Vis-à-Vis' },
    { id: 'p4', name: 'Élévations Latérales Poulie' },
    { id: 'p5', name: 'Extensions Triceps Corde' },
  ],
  'Pull': [
    { id: 'pl1', name: 'Tractions Pronation' },
    { id: 'pl2', name: 'Tirage Vertical Poitrine' },
    { id: 'pl3', name: 'Rowing Barre Buste Penché' },
    { id: 'pl4', name: 'Face Pull Poulie' },
    { id: 'pl5', name: 'Curl Incliné Haltères' },
  ],
  'Legs': [
    { id: 'lg1', name: 'Squat Barre' },
    { id: 'lg2', name: 'Presse à Cuisses' },
    { id: 'lg3', name: 'Leg Extension' },
    { id: 'lg4', name: 'Leg Curl Ischios' },
    { id: 'lg5', name: 'Mollets Debout Machine' },
  ],
  'Upper Body': [
    { id: 'u1', name: 'Développé Couché Haltères' },
    { id: 'u2', name: 'Tirage Vertical Poitrine' },
    { id: 'u3', name: 'Développé Militaire Haltères' },
    { id: 'u4', name: 'Rowing Bûcheron Haltère' },
    { id: 'u5', name: 'Extensions Triceps Corde' },
    { id: 'u6', name: 'Curl Barre EZ' },
  ],
};

export const DEFAULT_TEMPLATE_ORDER = ['Push', 'Pull', 'Legs', 'Upper Body'];

// Mémoire locale interne (fallback rapide web & mobile)
let memoryCache: Record<string, string> = {};

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } else if (memoryCache[key]) {
      return JSON.parse(memoryCache[key]);
    }
  } catch (error) {
    console.warn(`[Storage] Failed to read ${key}:`, error);
  }
  return defaultValue;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const stringValue = JSON.stringify(value);
    memoryCache[key] = stringValue;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, stringValue);
    }
  } catch (error) {
    console.warn(`[Storage] Failed to write ${key}:`, error);
  }
}

export const StorageService = {
  async loadHistory(): Promise<WorkoutSession[]> {
    return getItem<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
  },
  async saveHistory(history: WorkoutSession[]): Promise<void> {
    return setItem(STORAGE_KEYS.HISTORY, history);
  },

  async loadTemplates(): Promise<Record<string, TemplateItem[]>> {
    return getItem<Record<string, TemplateItem[]>>(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
  },
  async saveTemplates(templates: Record<string, TemplateItem[]>): Promise<void> {
    return setItem(STORAGE_KEYS.TEMPLATES, templates);
  },

  async loadTemplateOrder(): Promise<string[]> {
    return getItem<string[]>(STORAGE_KEYS.TEMPLATE_ORDER, DEFAULT_TEMPLATE_ORDER);
  },
  async saveTemplateOrder(order: string[]): Promise<void> {
    return setItem(STORAGE_KEYS.TEMPLATE_ORDER, order);
  },

  async loadCatalog(): Promise<CatalogExercise[]> {
    return getItem<CatalogExercise[]>(STORAGE_KEYS.CATALOG, DEFAULT_CATALOG);
  },
  async saveCatalog(catalog: CatalogExercise[]): Promise<void> {
    return setItem(STORAGE_KEYS.CATALOG, catalog);
  },

  async loadHiddenExercises(): Promise<string[]> {
    return getItem<string[]>(STORAGE_KEYS.HIDDEN_EXERCISES, []);
  },
  async saveHiddenExercises(hidden: string[]): Promise<void> {
    return setItem(STORAGE_KEYS.HIDDEN_EXERCISES, hidden);
  },

  async loadMuscleGroups(): Promise<string[]> {
    return getItem<string[]>(STORAGE_KEYS.MUSCLE_GROUPS, DEFAULT_MUSCLE_GROUPS);
  },
  async saveMuscleGroups(muscles: string[]): Promise<void> {
    return setItem(STORAGE_KEYS.MUSCLE_GROUPS, muscles);
  },

  async exportAllData(): Promise<string> {
    const history = await this.loadHistory();
    const templates = await this.loadTemplates();
    const templateOrder = await this.loadTemplateOrder();
    const catalog = await this.loadCatalog();
    const hidden = await this.loadHiddenExercises();
    const muscles = await this.loadMuscleGroups();

    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      history,
      templates,
      templateOrder,
      catalog,
      hidden,
      muscles,
    }, null, 2);
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.history) await this.saveHistory(data.history);
      if (data.templates) await this.saveTemplates(data.templates);
      if (data.templateOrder) await this.saveTemplateOrder(data.templateOrder);
      if (data.catalog) await this.saveCatalog(data.catalog);
      if (data.hidden) await this.saveHiddenExercises(data.hidden);
      if (data.muscles) await this.saveMuscleGroups(data.muscles);
      return true;
    } catch {
      return false;
    }
  }
};
