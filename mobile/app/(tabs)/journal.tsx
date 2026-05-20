import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore, DailyLogMeal, MealTime } from '../../store/logStore';
import { useMealsStore } from '../../store/mealsStore';
import { useLogs } from '../../services/useLogs';
import { useMeals } from '../../services/useMeals';
import { useNutrition } from '../../services/useNutrition';

const GREEN = '#22C55E';
const GRAY_100 = '#F3F4F6';
const GRAY_600 = '#4B5563';
const GRAY_900 = '#111827';
const RED = '#EF4444';

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  BREAKFAST: '🌅 Petit-déjeuner',
  LUNCH: '☀️ Déjeuner',
  DINNER: '🌙 Dîner',
  SNACK: '🍎 Collation',
};

const MEAL_TIMES: MealTime[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

// ─── Add Meal Modal ───────────────────────────────────────────────────────────

function AddMealModal({
  visible,
  logId,
  onClose,
}: {
  visible: boolean;
  logId: string;
  onClose: () => void;
}) {
  const [selectedTime, setSelectedTime] = useState<MealTime>('BREAKFAST');
  const meals = useMealsStore((s) => s.meals);
  const { addMeal, isLoading } = useLogs();

  async function handleAdd(mealId: string) {
    const ok = await addMeal(logId, mealId, selectedTime);
    if (ok) onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Ajouter un repas</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={GRAY_900} />
          </TouchableOpacity>
        </View>

        {/* Meal time selector */}
        <View style={modal.timePicker}>
          {MEAL_TIMES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[modal.timeChip, selectedTime === t && modal.timeChipActive]}
              onPress={() => setSelectedTime(t)}
            >
              <Text style={[modal.timeChipText, selectedTime === t && modal.timeChipTextActive]}>
                {MEAL_TIME_LABELS[t].split(' ')[1]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={modal.mealItem}
              onPress={() => handleAdd(item.id)}
              disabled={isLoading}
            >
              <View>
                <Text style={modal.mealName}>{item.name}</Text>
                {item.macros && (
                  <Text style={modal.mealMacros}>
                    {Math.round(item.macros.calories)} kcal · P {Math.round(item.macros.proteins_g)}g
                  </Text>
                )}
              </View>
              {item.is_template && (
                <View style={modal.templateBadge}>
                  <Text style={modal.templateText}>template</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ color: GRAY_600, textAlign: 'center' }}>
              Aucun repas disponible. Créez-en un dans l'onglet Repas.
            </Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Log entry row ────────────────────────────────────────────────────────────

function LogMealRow({
  entry,
  logId,
  onDelete,
}: {
  entry: DailyLogMeal;
  logId: string;
  onDelete: (logId: string, mealLogId: string) => void;
}) {
  function confirmDelete() {
    Alert.alert(
      'Supprimer',
      `Supprimer "${entry.meal.name}" du journal ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDelete(logId, entry.id),
        },
      ],
    );
  }

  return (
    <View style={styles.logRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.logMealName}>{entry.meal.name}</Text>
        <Text style={styles.logMealTime}>{MEAL_TIME_LABELS[entry.meal_time]}</Text>
        {entry.meal.macros && (
          <Text style={styles.logMealMacros}>
            {Math.round(entry.meal.macros.calories)} kcal · P{' '}
            {Math.round(entry.meal.macros.proteins_g)}g · G{' '}
            {Math.round(entry.meal.macros.carbs_g)}g · L{' '}
            {Math.round(entry.meal.macros.fats_g)}g
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={20} color={RED} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const todayLog = useLogStore((s) => s.todayLog);

  const { fetchToday, removeMeal, isLoading } = useLogs();
  const { fetchMeals } = useMeals();
  const { fetchTodaySummary } = useNutrition();

  async function refresh() {
    await Promise.all([fetchToday(), fetchMeals(), fetchTodaySummary()]);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleOpenAdd() {
    fetchMeals();
    setShowAddModal(true);
  }

  async function handleDelete(logId: string, mealLogId: string) {
    await removeMeal(logId, mealLogId);
    await fetchTodaySummary();
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Journal alimentaire</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleOpenAdd}
          disabled={!todayLog}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={GREEN} />
        }
      >
        <Text style={styles.dateHeader}>{dateLabel}</Text>

        {todayLog ? (
          todayLog.daily_log_meals.length > 0 ? (
            todayLog.daily_log_meals.map((entry) => (
              <LogMealRow
                key={entry.id}
                entry={entry}
                logId={todayLog.id}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="journal-outline" size={48} color={GRAY_600} />
              <Text style={styles.emptyTitle}>Aucun repas enregistré</Text>
              <Text style={styles.emptySubtitle}>
                Appuyez sur + pour ajouter votre premier repas de la journée.
              </Text>
            </View>
          )
        ) : (
          <ActivityIndicator color={GREEN} style={{ marginTop: 32 }} />
        )}
      </ScrollView>

      {todayLog && (
        <AddMealModal
          visible={showAddModal}
          logId={todayLog.id}
          onClose={() => {
            setShowAddModal(false);
            fetchTodaySummary();
          }}
        />
      )}
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
  scroll: { padding: 16, gap: 10 },
  dateHeader: { fontSize: 13, color: GRAY_600, textTransform: 'capitalize', marginBottom: 4 },
  logRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logMealName: { fontSize: 15, fontWeight: '600', color: GRAY_900 },
  logMealTime: { fontSize: 12, color: GRAY_600, marginTop: 1 },
  logMealMacros: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: GRAY_900 },
  emptySubtitle: { fontSize: 13, color: GRAY_600, textAlign: 'center', paddingHorizontal: 24 },
});

const modal = StyleSheet.create({
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
  timePicker: { flexDirection: 'row', padding: 12, gap: 8 },
  timeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GRAY_100,
    alignItems: 'center',
  },
  timeChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  timeChipText: { fontSize: 12, color: GRAY_600, fontWeight: '500' },
  timeChipTextActive: { color: '#fff' },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: GRAY_100,
    borderRadius: 10,
  },
  mealName: { fontSize: 14, fontWeight: '600', color: GRAY_900 },
  mealMacros: { fontSize: 12, color: GRAY_600, marginTop: 2 },
  templateBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateText: { fontSize: 10, color: '#0284C7', fontWeight: '600' },
});
