import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMealsStore, Meal } from '../../store/mealsStore';
import { useMeals } from '../../services/useMeals';
import { useFoods, Food, ExternalFood } from '../../services/useFoods';

const GREEN = '#22C55E';
const GRAY_100 = '#F3F4F6';
const GRAY_600 = '#4B5563';
const GRAY_900 = '#111827';
const RED = '#EF4444';

// ─── Food search row ──────────────────────────────────────────────────────────

// Compute macros for a given quantity
function calcMacros(food: Food, qty: number) {
  const ratio = qty / 100;
  return {
    kcal: food.calories_per_100g * ratio,
    p: food.proteins_per_100g * ratio,
    c: food.carbs_per_100g * ratio,
    l: food.fats_per_100g * ratio,
  };
}

function FoodRow({
  food,
  quantity,
  onQuantityChange,
  onAdd,
  onRemove,
  isAdded,
}: {
  food: Food;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAdd: () => void;
  onRemove: () => void;
  isAdded: boolean;
}) {
  const macros = isAdded && quantity > 0 ? calcMacros(food, quantity) : null;
  const hasExtended = food.sugar_per_100g !== null || food.saturated_fats_per_100g !== null || food.salt_per_100g !== null;

  return (
    <View style={foodRowStyles.container}>
      <View style={{ flex: 1 }}>
        <Text style={foodRowStyles.name}>{food.name}</Text>
        {food.brand && <Text style={foodRowStyles.brand}>{food.brand}</Text>}

        {/* Per-100g index: always visible */}
        <Text style={foodRowStyles.macros100}>
          {Math.round(food.calories_per_100g)} kcal · P {food.proteins_per_100g.toFixed(1)}g ·
          G {food.carbs_per_100g.toFixed(1)}g · L {food.fats_per_100g.toFixed(1)}g /100g
        </Text>

        {/* Real-time calculation for current quantity */}
        {macros && (
          <Text style={foodRowStyles.macrosQty}>
            → pour {quantity}g : {Math.round(macros.kcal)} kcal · P {Math.round(macros.p)}g · G {Math.round(macros.c)}g · L {Math.round(macros.l)}g
          </Text>
        )}

        {/* Extended metrics for processed foods */}
        {hasExtended && (
          <Text style={foodRowStyles.extended}>
            {[
              food.sugar_per_100g !== null ? `Sucres ${food.sugar_per_100g.toFixed(1)}g` : null,
              food.saturated_fats_per_100g !== null ? `AGS ${food.saturated_fats_per_100g.toFixed(1)}g` : null,
              food.salt_per_100g !== null ? `Sel ${food.salt_per_100g.toFixed(2)}g` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            {' '}(pour 100g)
          </Text>
        )}
      </View>

      {isAdded ? (
        <View style={foodRowStyles.qtyRow}>
          <TextInput
            style={foodRowStyles.qtyInput}
            value={String(quantity)}
            keyboardType="numeric"
            onChangeText={(t) => onQuantityChange(Number(t) || 0)}
          />
          <Text style={foodRowStyles.qtyUnit}>g</Text>
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="remove-circle" size={24} color={RED} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onAdd}>
          <Ionicons name="add-circle" size={28} color={GREEN} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const foodRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  name: { fontSize: 14, fontWeight: '600', color: GRAY_900 },
  brand: { fontSize: 11, color: GRAY_600 },
  macros100: { fontSize: 11, color: GRAY_600, marginTop: 2 },
  macrosQty: { fontSize: 11, color: GREEN, marginTop: 2, fontWeight: '600' },
  extended: { fontSize: 10, color: '#F97316', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyInput: {
    borderWidth: 1,
    borderColor: GRAY_100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    color: GRAY_900,
  },
  qtyUnit: { fontSize: 12, color: GRAY_600 },
});

// ─── Create meal modal ────────────────────────────────────────────────────────

interface SelectedFood {
  food: Food;
  quantity_g: number;
}

function CreateMealModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SelectedFood[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  const {
    foods,
    externalFoods,
    searchFoods,
    searchExternal,
    importExternalFood,
    isLoading: searchLoading,
    isExternalLoading,
  } = useFoods();
  const { createMeal, isLoading: creating } = useMeals();

  useEffect(() => {
    if (searchQuery.length > 1) {
      searchFoods(searchQuery);
    }
  }, [searchQuery]);

  function handleAddFood(food: Food) {
    setSelected((prev) => [...prev, { food, quantity_g: 100 }]);
  }

  async function handleAddExternal(ext: ExternalFood) {
    setImportingId(ext.external_id);
    const food = await importExternalFood(ext);
    setImportingId(null);
    if (food) {
      setSelected((prev) => {
        // Don't add if already selected
        if (prev.some((s) => s.food.id === food.id)) return prev;
        return [...prev, { food, quantity_g: 100 }];
      });
    }
  }

  function handleRemoveFood(foodId: string) {
    setSelected((prev) => prev.filter((s) => s.food.id !== foodId));
  }

  function handleQuantityChange(foodId: string, qty: number) {
    setSelected((prev) =>
      prev.map((s) => (s.food.id === foodId ? { ...s, quantity_g: qty } : s)),
    );
  }

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Donnez un nom à votre repas');
      return;
    }
    if (selected.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins un aliment');
      return;
    }

    const ok = await createMeal({
      name: name.trim(),
      foods: selected.map((s) => ({ food_id: s.food.id, quantity_g: s.quantity_g })),
    });

    if (ok) {
      setName('');
      setSelected([]);
      setSearchQuery('');
      onClose();
    }
  }

  const selectedIds = new Set(selected.map((s) => s.food.id));
  const localResults = foods.filter((f) => !selectedIds.has(f.id));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={createModal.container}>
        <View style={createModal.header}>
          <Text style={createModal.title}>Nouveau repas</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={GRAY_900} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={createModal.scroll} keyboardShouldPersistTaps="handled">
          {/* Meal name */}
          <TextInput
            style={createModal.nameInput}
            placeholder="Nom du repas"
            value={name}
            onChangeText={setName}
          />

          {/* Selected foods summary */}
          {selected.length > 0 && (
            <View style={createModal.selectedSection}>
              <Text style={createModal.sectionLabel}>Aliments ajoutés ({selected.length})</Text>
              {selected.map((s) => (
                <FoodRow
                  key={s.food.id}
                  food={s.food}
                  quantity={s.quantity_g}
                  onQuantityChange={(q) => handleQuantityChange(s.food.id, q)}
                  onAdd={() => {}}
                  onRemove={() => handleRemoveFood(s.food.id)}
                  isAdded
                />
              ))}
            </View>
          )}

          {/* Search bar */}
          <View style={createModal.searchBar}>
            <Ionicons name="search" size={16} color={GRAY_600} />
            <TextInput
              style={createModal.searchInput}
              placeholder="Rechercher un aliment…"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={GRAY_600} />
              </TouchableOpacity>
            )}
          </View>

          {/* Local results */}
          {searchLoading && <ActivityIndicator color={GREEN} style={{ marginVertical: 8 }} />}

          {localResults.map((food) => (
            <FoodRow
              key={food.id}
              food={food}
              quantity={100}
              onQuantityChange={() => {}}
              onAdd={() => handleAddFood(food)}
              onRemove={() => {}}
              isAdded={false}
            />
          ))}

          {/* Open Food Facts section */}
          {searchQuery.length > 1 && (
            <View style={createModal.offSection}>
              <View style={createModal.offHeader}>
                <View style={createModal.offBadge}>
                  <Text style={createModal.offBadgeText}>Open Food Facts</Text>
                </View>
                <TouchableOpacity
                  style={createModal.offSearchBtn}
                  onPress={() => searchExternal(searchQuery)}
                  disabled={isExternalLoading}
                >
                  {isExternalLoading ? (
                    <ActivityIndicator size="small" color={GREEN} />
                  ) : (
                    <>
                      <Ionicons name="globe-outline" size={14} color={GREEN} />
                      <Text style={createModal.offSearchBtnText}>Rechercher en ligne</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {externalFoods.map((ext) => {
                const isImporting = importingId === ext.external_id;
                return (
                  <View key={ext.external_id} style={createModal.offRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={foodRowStyles.name}>{ext.name}</Text>
                      {ext.brand && <Text style={foodRowStyles.brand}>{ext.brand}</Text>}
                      <Text style={foodRowStyles.macros100}>
                        {Math.round(ext.calories_per_100g)} kcal · P {ext.proteins_per_100g.toFixed(1)}g ·
                        G {ext.carbs_per_100g.toFixed(1)}g · L {ext.fats_per_100g.toFixed(1)}g /100g
                      </Text>
                      {(ext.sugar_per_100g !== null || ext.salt_per_100g !== null) && (
                        <Text style={foodRowStyles.extended}>
                          {[
                            ext.sugar_per_100g !== null ? `Sucres ${ext.sugar_per_100g.toFixed(1)}g` : null,
                            ext.saturated_fats_per_100g !== null ? `AGS ${ext.saturated_fats_per_100g.toFixed(1)}g` : null,
                            ext.salt_per_100g !== null ? `Sel ${ext.salt_per_100g.toFixed(2)}g` : null,
                          ].filter(Boolean).join(' · ')}
                          {' '}(pour 100g)
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleAddExternal(ext)} disabled={isImporting}>
                      {isImporting ? (
                        <ActivityIndicator size="small" color={GREEN} />
                      ) : (
                        <Ionicons name="add-circle" size={28} color={GREEN} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

              {externalFoods.length === 0 && !isExternalLoading && (
                <Text style={createModal.offHint}>
                  Appuyez sur "Rechercher en ligne" pour chercher parmi des millions de produits.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={createModal.footer}>
          <TouchableOpacity
            style={[createModal.createBtn, creating && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={createModal.createBtnText}>Créer le repas</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createModal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  title: { fontSize: 18, fontWeight: '700', color: GRAY_900 },
  scroll: { padding: 16, gap: 12 },
  nameInput: {
    borderWidth: 1,
    borderColor: GRAY_100,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: GRAY_900,
    backgroundColor: GRAY_100,
  },
  selectedSection: { gap: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: GRAY_600, textTransform: 'uppercase' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: GRAY_100,
    borderRadius: 10,
    padding: 10,
    backgroundColor: GRAY_100,
  },
  searchInput: { flex: 1, fontSize: 14, color: GRAY_900 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: GRAY_100 },
  createBtn: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Open Food Facts section
  offSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: GRAY_100,
    paddingTop: 12,
    gap: 4,
  },
  offHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  offBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  offBadgeText: { fontSize: 11, fontWeight: '600', color: '#C2410C' },
  offSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
  },
  offSearchBtnText: { fontSize: 12, color: GREEN, fontWeight: '600' },
  offRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  offHint: { fontSize: 12, color: GRAY_600, textAlign: 'center', paddingVertical: 8 },
});

// ─── Meal card ────────────────────────────────────────────────────────────────

function MealCard({ meal, onDelete }: { meal: Meal; onDelete: (id: string) => void }) {
  function confirmDelete() {
    Alert.alert(
      'Supprimer',
      `Supprimer le repas "${meal.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(meal.id) },
      ],
    );
  }

  return (
    <View style={mealCard.container}>
      <View style={{ flex: 1 }}>
        <View style={mealCard.header}>
          <Text style={mealCard.name}>{meal.name}</Text>
          {meal.is_template && (
            <View style={mealCard.badge}>
              <Text style={mealCard.badgeText}>template</Text>
            </View>
          )}
        </View>
        {meal.macros && (
          <Text style={mealCard.macros}>
            {Math.round(meal.macros.calories)} kcal · P {Math.round(meal.macros.proteins_g)}g ·
            G {Math.round(meal.macros.carbs_g)}g · L {Math.round(meal.macros.fats_g)}g
          </Text>
        )}
        <Text style={mealCard.foods}>
          {meal.meal_foods.length} aliment{meal.meal_foods.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {!meal.is_template && (
        <TouchableOpacity onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={20} color={RED} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const mealCard = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: GRAY_900 },
  macros: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  foods: { fontSize: 11, color: GRAY_600, marginTop: 2 },
  badge: { backgroundColor: '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#0284C7', fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RepasScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const meals = useMealsStore((s) => s.meals);
  const { fetchMeals, deleteMeal, isLoading } = useMeals();

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Mes repas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMeals} tintColor={GREEN} />
        }
        renderItem={({ item }) => (
          <MealCard meal={item} onDelete={deleteMeal} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={GRAY_600} />
            <Text style={styles.emptyTitle}>Aucun repas</Text>
            <Text style={styles.emptySubtitle}>
              Créez votre premier repas en appuyant sur +
            </Text>
          </View>
        }
      />

      <CreateMealModal visible={showCreate} onClose={() => { setShowCreate(false); fetchMeals(); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GRAY_100 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  screenTitle: { fontSize: 20, fontWeight: '700', color: GRAY_900 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: GRAY_900 },
  emptySubtitle: { fontSize: 13, color: GRAY_600, textAlign: 'center', paddingHorizontal: 24 },
});
