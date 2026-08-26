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

  const allExercises = useGym().getAllUniqueExercises();

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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {isBiset ? (
                <Layers color={Colors.bisetPurple} size={22} style={{ marginRight: 8 }} />
              ) : (
                <Sparkles color={Colors.neonGreen} size={22} style={{ marginRight: 8 }} />
              )}
              <Text style={[styles.title, isBiset && { color: Colors.bisetPurple }]}>
                {isBiset
                  ? selectedExo1
                    ? 'CHOISIR LE 2ÈME EXERCICE (BISET)'
                    : 'CHOISIR LE 1ER EXERCICE (BISET)'
                  : 'AJOUTER UN EXERCICE'}
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          {/* Biset Step Tag */}
          {isBiset && selectedExo1 && (
            <View style={styles.bisetBanner}>
              <Text style={styles.bisetBannerText}>
                1er exo : <Text style={{ color: Colors.neonGreen, fontWeight: 'bold' }}>{selectedExo1}</Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedExo1(null)}>
                <Text style={styles.bisetResetText}>Changer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search color={Colors.textMuted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher ou créer un exercice..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="words"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X color={Colors.textMuted} size={18} />
              </TouchableOpacity>
            )}
          </View>

          {/* Create New Exercise Button if search doesn't match exactly */}
          {search.trim().length > 0 &&
            !allExercises.some(e => e.toLowerCase() === search.trim().toLowerCase()) && (
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateNew}>
                <Plus color={Colors.textDark} size={18} />
                <Text style={styles.createBtnText}>Créer "{search.trim()}"</Text>
              </TouchableOpacity>
            )}

          {/* Exercise List */}
          <FlatList
            data={filteredExercises}
            keyExtractor={item => item}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handlePickExercise(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.exerciseItemText}>{item}</Text>
                <Plus color={Colors.neonGreen} size={18} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun exercice trouvé</Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
    minHeight: '60%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
  closeBtn: {
    padding: Spacing.xs,
  },
  bisetBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bisetPurpleSoft,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bisetPurpleBorder,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    marginLeft: Spacing.sm,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  createBtnText: {
    color: Colors.textDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  exerciseItem: {
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
