import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  CalendarIcon,
  SmallChevronLeft,
  SmallChevronRight,
  SmallPlusIcon,
} from '@/components/icons/Icons';
import { DIARY_MEALS } from '@/constants/data';

const MEAL_KCALS: Record<string, number> = {
  Breakfast: 320,
  Lunch: 480,
  Snack: 360,
  Dinner: 0,
};

const TOTAL_EATEN = 1160;
const MACROS = { protein: 84, carbs: 142, fat: 38 };

export default function DiaryScreen() {
  const router = useRouter();
  const { state } = useApp();

  const goal = state.calorieGoal;
  const percent = Math.round((TOTAL_EATEN / goal) * 100);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Diary</Text>
          <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.7}>
            <CalendarIcon size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Date pager */}
        <View style={styles.datePager}>
          <TouchableOpacity style={styles.chevronCircle} activeOpacity={0.7}>
            <SmallChevronLeft />
          </TouchableOpacity>
          <Text style={styles.dateText}>Today · Jun 18</Text>
          <TouchableOpacity style={styles.chevronCircle} activeOpacity={0.7}>
            <SmallChevronRight />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>Eaten today</Text>
            <Text style={styles.summaryKcal}>
              {TOTAL_EATEN.toLocaleString()} / {goal.toLocaleString()} kcal
            </Text>
          </View>
          <ProgressBar percent={percent} height={12} />
          <Text style={styles.macroRow}>
            P {MACROS.protein}g    C {MACROS.carbs}g    F {MACROS.fat}g
          </Text>
        </View>

        {/* Meal sections */}
        {(Object.keys(DIARY_MEALS) as (keyof typeof DIARY_MEALS)[]).map(
          (meal) => {
            const items = DIARY_MEALS[meal];
            const mealKcal = MEAL_KCALS[meal];

            return (
              <View key={meal} style={styles.mealSection}>
                {/* Section header */}
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{meal}</Text>
                  <Text style={styles.mealKcal}>{mealKcal} kcal</Text>
                </View>

                {/* Card */}
                <View style={styles.mealCard}>
                  {items.length === 0 ? (
                    <Text style={styles.emptyText}>Nothing logged yet</Text>
                  ) : (
                    items.map((food, i) => (
                      <View key={i}>
                        <View style={styles.foodRow}>
                          <View style={styles.foodThumb} />
                          <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodMeta}>
                              {food.serving} · {food.protein}g protein
                            </Text>
                          </View>
                          <Text style={styles.foodKcal}>{food.kcal}</Text>
                        </View>
                        {i < items.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))
                  )}

                  {/* Divider before add row */}
                  {items.length > 0 && <View style={styles.divider} />}

                  {/* Add food row */}
                  <TouchableOpacity
                    style={styles.addRow}
                    activeOpacity={0.6}
                    onPress={() => router.push('/search')}
                  >
                    <SmallPlusIcon />
                    <Text style={styles.addText}>Add food</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingTop: 62,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: Colors.ink,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardSmall,
  },
  datePager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  chevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardSmall,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '650',
    color: Colors.ink,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 16,
    paddingVertical: 18,
    marginBottom: 24,
    ...Shadows.card,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    color: Colors.muted,
  },
  summaryKcal: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  macroRow: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    marginTop: 12,
    textAlign: 'center',
  },
  mealSection: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '650',
    color: Colors.ink,
  },
  mealKcal: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 4,
    ...Shadows.card,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  foodThumb: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.track,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  foodName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 2,
  },
  foodMeta: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
  },
  foodKcal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
});
