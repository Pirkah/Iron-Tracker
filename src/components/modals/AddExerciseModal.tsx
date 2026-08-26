import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useGym } from '../../context/GymContext';
import { X, Search, Plus, Sparkles, Layers } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { GlassButton } from '../common/GlassButton';

interface AddExerciseModalProps {
  visible: boolean;
  isBiset?: boolean;
  onClose: () => void;
  onSelect: (exo1: string, exo2?: string | null) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  isBiset = false,
  onClose,
  onSelect,
}) => {
  const { getAllUniqueExercises, addToCatalog } = useGym();
  const [search, setSearch] = useState('');
  const [selectedExo1, setSelectedExo1] = useState<string | null>(null);

  const allExercises = getAllUniqueExercises();

  const filteredExercises = useMemo(() => {
    if (!search.trim()) return allExercises;
    const q = search.toLowerCase();
    return allExercises.filter(e => e.toLowerCase().includes(q));
  }, [allExercises, search]);

  const handlePickExercise = (name: string) => {
    if (isBiset) {
      if (!selectedExo1) {
        setSelectedExo1(name);
        setSearch('');
      } else {
        onSelect(selectedExo1, name);
        resetAndClose();
      }
    } else {
      onSelect(name, null);
      resetAndClose();
    }
  };

  const handleCreateNew = () => {
    const clean = search.trim();
    if (!clean) return;
    addToCatalog(clean, 'Autre');
    handlePickExercise(clean);
  };

  const resetAndClose = () => {
    setSearch('');
    setSelectedExo1(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <BlurView intensity={Platform.OS === 'ios' ? 85 : 100} tint="dark" style={styles.glassContent}>
          {/* Specular Highlight */}
          <View style={styles.glassReflectionTop} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {isBiset ? (
                <>
                  <Layers color={Colors.bisetPurple} size={18} style={{ marginRight: 6 }} />
                  <Text style={[styles.title, { color: Colors.bisetPurple }]}>
                    {selectedExo1 ? '2ÈME EXERCICE DU BISET' : '1ER EXERCICE DU BISET'}
                  </Text>
                </>
              ) : (
                <Text style={styles.title}>AJOUTER UN EXERCICE</Text>
              )}
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeGlassBtn}>
              <X color={Colors.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Biset Selected 1st Exo indicator */}
          {isBiset && selectedExo1 && (
            <View style={styles.bisetGlassBanner}>
              <Text style={styles.bisetBannerText}>
                1er exo : <Text style={{ fontWeight: 'bold' }}>{selectedExo1}</Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedExo1(null)}>
                <Text style={styles.bisetResetText}>Changer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchGlassBar}>
            <Search color={Colors.textMuted} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                isBiset
                  ? selectedExo1
                    ? 'Rechercher le 2ème exercice...'
                    : 'Rechercher le 1er exercice...'
                  : 'Rechercher ou créer un exercice...'
              }
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus={true}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X color={Colors.textMuted} size={18} />
              </TouchableOpacity>
            )}
          </View>

          {/* Create Button (If search query doesn't match exactly) */}
          {search.trim().length > 0 && !allExercises.some(e => e.toLowerCase() === search.trim().toLowerCase()) && (
            <GlassButton
              title={`Créer "${search.trim()}"`}
              variant="neon"
              icon={<Sparkles color={Colors.neonGreen} size={16} />}
              onPress={handleCreateNew}
              style={{ marginBottom: Spacing.md }}
            />
          )}

          {/* Exercise list */}
          <FlatList
            data={filteredExercises}
            keyExtractor={item => item}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseGlassItem}
                onPress={() => handlePickExercise(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.exerciseItemText}>{item}</Text>
                <Plus color={Colors.neonGreen} size={18} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              search.trim().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aucun exercice dans le catalogue</Text>
                </View>
              ) : null
            }
          />
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  glassContent: {
    backgroundColor: Colors.glassTabBar,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: '75%',
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 0.5,
  },
  closeGlassBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.full,
  },
  bisetGlassBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.glassPurple,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassPurpleBorder,
  },
  bisetBannerText: {
    color: Colors.textPrimary,
    fontSize: 13,
  },
  bisetResetText: {
    color: Colors.bisetPurple,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchGlassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    marginLeft: Spacing.sm,
  },
  list: {
    flex: 1,
  },
  exerciseGlassItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  exerciseItemText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
