import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore, MealTime } from '../../store/logStore';
import { useUserStore } from '../../store/userStore';
import { useMealsStore, Meal, MealMacros } from '../../store/mealsStore';
import { useNutrition } from '../../services/useNutrition';
import { useLogs } from '../../services/useLogs';
import { useMeals } from '../../services/useMeals';

const GREEN = '#22C55E';
const ORANGE = '#F97316';
const RED = '#EF4444';
const BLUE = '#3B82F6';
const PURPLE = '#A855F7';
const GRAY_100 = '#F3F4F6';
const GRAY_600 = '#4B5563';
const GRAY_900 = '#111827';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultMealTime(): MealTime {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'BREAKFAST';
  if (h >= 11 && h < 15) return 'LUNCH';
  if (h >= 17 && h < 22) return 'DINNER';
  return 'SNACK';
}

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  BREAKFAST: '🌅 Petit-déjeuner',
  LUNCH: '☀️ Déjeuner',
  DINNER: '🌙 Dîner',
  SNACK: '🍎 Collation',
};

// ─── Macro ring (simplified bar) ─────────────────────────────────────────────

function MacroBar({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const over = consumed > target;

  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroBarHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={[styles.macroValue, over && { color: RED }]}>
          {Math.round(consumed)}g / {Math.round(target)}g
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${pct * 100}%`, backgroundColor: over ? RED : color },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Calorie ring summary card ────────────────────────────────────────────────

function CalorieCard({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const remaining = target - consumed;
  const over = remaining < 0;

  return (
    <View style={styles.calorieCard}>
      <Text style={styles.calorieLabel}>Calories aujourd'hui</Text>
      <Text style={[styles.calorieMain, over && { color: RED }]}>
        {Math.round(consumed)}
      </Text>
      <Text style={styles.calorieTarget}>/ {Math.round(target)} kcal</Text>
      <Text style={[styles.calorieRemaining, over && { color: RED }]}>
        {over
          ? `${Math.abs(Math.round(remaining))} kcal en excès`
          : `${Math.round(remaining)} kcal restantes`}
      </Text>
    </View>
  );
}

// ─── Recent meals list ────────────────────────────────────────────────────────

function MealTimeLabel({ time }: { time: string }) {
  const labels: Record<string, string> = {
    BREAKFAST: '🌅 Petit-déjeuner',
    LUNCH: '☀️ Déjeuner',
    DINNER: '🌙 Dîner',
    SNACK: '🍎 Collation',
  };
  return <Text style={styles.mealTimeLabel}>{labels[time] ?? time}</Text>;
}

// ─── Quick-add meal modal ─────────────────────────────────────────────────────

function QuickAddModal({
  visible,
  onClose,
  onAdded,
}: {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [selectedTime, setSelectedTime] = useState<MealTime>(defaultMealTime());
  const [adding, setAdding] = useState<string | null>(null); // meal id being added

  const meals = useMealsStore((s) => s.meals);
  const todayLog = useLogStore((s) => s.todayLog);
  const { fetchMeals } = useMeals();
  const { addMeal } = useLogs();

  useEffect(() => {
    if (visible) {
      fetchMeals();
      setSelectedTime(defaultMealTime());
    }
  }, [visible]);

  async function handleAdd(meal: Meal) {
    if (!todayLog) return;
    setAdding(meal.id);
    const ok = await addMeal(todayLog.id, meal.id, selectedTime);
    setAdding(null);
    if (ok) {
      onAdded();
      onClose();
    }
  }

  function macroLine(macros?: MealMacros) {
    if (!macros) return null;
    return (
      `${Math.round(macros.calories)} kcal · P ${Math.round(macros.proteins_g)}g · ` +
      `G ${Math.round(macros.carbs_g)}g · L ${Math.round(macros.fats_g)}g`
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={quickAdd.container}>
        {/* Header */}
        <View style={quickAdd.header}>
          <Text style={quickAdd.title}>Ajouter un repas</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={GRAY_900} />
          </TouchableOpacity>
        </View>

        {/* Meal time selector */}
        <View style={quickAdd.timeSection}>
          <Text style={quickAdd.sectionLabel}>Moment du repas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={quickAdd.chipRow}>
            {(Object.keys(MEAL_TIME_LABELS) as MealTime[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[quickAdd.chip, selectedTime === t && quickAdd.chipActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[quickAdd.chipText, selectedTime === t && quickAdd.chipTextActive]}>
                  {MEAL_TIME_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meal list */}
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={quickAdd.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Text style={quickAdd.emptyText}>Aucun repas disponible. Créez-en un dans l'onglet Repas.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={quickAdd.mealCard}
              onPress={() => handleAdd(item)}
              disabled={adding === item.id}
            >
              <View style={{ flex: 1 }}>
                <View style={quickAdd.mealCardHeader}>
                  <Text style={quickAdd.mealName}>{item.name}</Text>
                  {item.is_template && (
                    <View style={quickAdd.badge}>
                      <Text style={quickAdd.badgeText}>template</Text>
                    </View>
                  )}
                </View>
                {item.macros && (
                  <Text style={quickAdd.mealMacros}>{macroLine(item.macros)}</Text>
                )}
                <Text style={quickAdd.mealFoods}>
                  {item.meal_foods.length} aliment{item.meal_foods.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {adding === item.id ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : (
                <Ionicons name="add-circle" size={28} color={GREEN} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const quickAdd = StyleSheet.create({
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
  timeSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: GRAY_600, textTransform: 'uppercase', marginBottom: 8 },
  chipRow: { gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_100,
    backgroundColor: GRAY_100,
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 13, color: GRAY_600, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  list: { padding: 16 },
  emptyText: { fontSize: 13, color: GRAY_600, textAlign: 'center', paddingVertical: 24 },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_100,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  mealCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealName: { fontSize: 15, fontWeight: '600', color: GRAY_900 },
  mealMacros: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  mealFoods: { fontSize: 11, color: GRAY_600, marginTop: 2 },
  badge: { backgroundColor: '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#0284C7', fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const user = useUserStore((s) => s.user);
  const summary = useLogStore((s) => s.nutritionSummary);
  const todayLog = useLogStore((s) => s.todayLog);

  const { fetchTodaySummary, isLoading: loadingSummary } = useNutrition();
  const { fetchToday, removeMeal, isLoading: loadingLog } = useLogs();

  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const isLoading = loadingSummary || loadingLog;

  async function refresh() {
    await Promise.all([fetchToday(), fetchTodaySummary()]);
  }

  function confirmRemoveMeal(mealLogId: string, mealName: string) {
    Alert.alert(
      'Supprimer du journal',
      `Retirer "${mealName}" du repas du jour ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!todayLog) return;
            const ok = await removeMeal(todayLog.id, mealLogId);
            if (ok) fetchTodaySummary();
          },
        },
      ],
    );
  }

  useEffect(() => {
    refresh();
  }, []);

  if (isLoading && !summary) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={GREEN}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Bonjour, {user?.name?.split(' ')[0] ?? 'vous'} 👋
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        {/* Calorie summary */}
        {summary ? (
          <>
            <CalorieCard
              consumed={summary.consumed.calories}
              target={summary.targets.calories}
            />

            {/* Macro bars */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Macros</Text>
              <MacroBar
                label="Protéines"
                consumed={summary.consumed.proteins_g}
                target={summary.targets.proteins_g}
                color={BLUE}
              />
              <MacroBar
                label="Glucides"
                consumed={summary.consumed.carbs_g}
                target={summary.targets.carbs_g}
                color={ORANGE}
              />
              <MacroBar
                label="Lipides"
                consumed={summary.consumed.fats_g}
                target={summary.targets.fats_g}
                color={PURPLE}
              />
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Commencez à enregistrer vos repas pour voir votre suivi.
            </Text>
          </View>
        )}

        {/* Today's meals */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Repas du jour</Text>
          {todayLog && todayLog.daily_log_meals.length > 0 ? (
            todayLog.daily_log_meals.map((entry) => (
              <View key={entry.id} style={styles.mealRow}>
                <View style={{ flex: 1 }}>
                  <MealTimeLabel time={entry.meal_time} />
                  <Text style={styles.mealName}>{entry.meal.name}</Text>
                  {entry.meal.macros && (
                    <Text style={styles.mealMacros}>
                      {Math.round(entry.meal.macros.calories)} kcal · P {Math.round(entry.meal.macros.proteins_g)}g ·
                      G {Math.round(entry.meal.macros.carbs_g)}g · L {Math.round(entry.meal.macros.fats_g)}g
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => confirmRemoveMeal(entry.id, entry.meal.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={RED} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucun repas enregistré aujourd'hui.</Text>
          )}
        </View>

        {/* Bottom padding for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuickAdd(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAdded={refresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GRAY_100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 12 },

  header: { marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: '700', color: GRAY_900 },
  dateText: { fontSize: 13, color: GRAY_600, marginTop: 2, textTransform: 'capitalize' },

  calorieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieLabel: { fontSize: 13, color: GRAY_600, marginBottom: 4 },
  calorieMain: { fontSize: 52, fontWeight: '800', color: GREEN },
  calorieTarget: { fontSize: 14, color: GRAY_600 },
  calorieRemaining: { marginTop: 6, fontSize: 13, color: GREEN, fontWeight: '600' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: GRAY_900 },

  macroBarContainer: { gap: 4 },
  macroBarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { fontSize: 13, color: GRAY_600 },
  macroValue: { fontSize: 13, fontWeight: '600', color: GRAY_900 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: GRAY_100, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
    paddingBottom: 8,
  },
  mealTimeLabel: { fontSize: 11, color: GRAY_600 },
  mealName: { fontSize: 14, fontWeight: '600', color: GRAY_900 },
  mealMacros: { fontSize: 11, color: GRAY_600 },

  emptyText: { fontSize: 13, color: GRAY_600, textAlign: 'center', paddingVertical: 8 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
