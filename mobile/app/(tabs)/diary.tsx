import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
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

const EMPTY_MEALS: Record<string, { name: string; serving: string; protein: number; kcal: number }[]> = {
  Breakfast: [],
  Lunch: [],
  Snack: [],
  Dinner: [],
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = addDays(today, -1);
  const monthDay = `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`;

  if (isSameDay(date, today)) return `Today \u00B7 ${monthDay}`;
  if (isSameDay(date, yesterday)) return `Yesterday \u00B7 ${monthDay}`;
  return `${WEEKDAY_NAMES_SHORT[date.getDay()]} \u00B7 ${monthDay}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0, Sunday = 6
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; inMonth: boolean; date: Date }[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, inMonth: true, date: new Date(year, month, i) });
  }

  // Next month leading days to fill the grid (complete last row)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, inMonth: false, date: new Date(year, month + 1, i) });
    }
  }

  return days;
}

export default function DiaryScreen() {
  const router = useRouter();
  const { state } = useApp();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  const today = useMemo(() => new Date(), []);
  const isToday = isSameDay(selectedDate, today);
  const dateLabel = formatDateLabel(selectedDate);

  const goal = state.calorieGoal;
  const totalEaten = 0;
  const macros = { protein: 0, carbs: 0, fat: 0 };
  const percent = Math.round((totalEaten / goal) * 100);

  const goToPrevDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 1));
  }, []);

  const openCalendar = useCallback(() => {
    setCalendarMonth(selectedDate.getMonth());
    setCalendarYear(selectedDate.getFullYear());
    setCalendarVisible(true);
  }, [selectedDate]);

  const goToPrevMonth = useCallback(() => {
    setCalendarMonth(prev => {
      if (prev === 0) {
        setCalendarYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        setCalendarYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const selectCalendarDay = useCallback((date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  }, []);

  const calendarDays = useMemo(
    () => getCalendarDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Diary</Text>
          <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.7} onPress={openCalendar}>
            <CalendarIcon size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Date pager */}
        <View style={styles.datePager}>
          <TouchableOpacity style={styles.chevronCircle} activeOpacity={0.7} onPress={goToPrevDay}>
            <SmallChevronLeft />
          </TouchableOpacity>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <TouchableOpacity style={styles.chevronCircle} activeOpacity={0.7} onPress={goToNextDay}>
            <SmallChevronRight />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{isToday ? 'Eaten today' : 'Eaten'}</Text>
            <Text style={styles.summaryKcal}>
              {totalEaten.toLocaleString()} / {goal.toLocaleString()} kcal
            </Text>
          </View>
          <ProgressBar percent={percent} height={12} />
          <Text style={styles.macroRow}>
            P {macros.protein}g    C {macros.carbs}g    F {macros.fat}g
          </Text>
        </View>

        {/* Meal sections */}
        {(Object.keys(EMPTY_MEALS) as (keyof typeof EMPTY_MEALS)[]).map(
          (meal) => {
            const items = EMPTY_MEALS[meal];
            const mealKcal = 0;

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

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.calendarCard}>
            {/* Month navigation */}
            <View style={styles.calMonthRow}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.calChevron} activeOpacity={0.7}>
                <SmallChevronLeft />
              </TouchableOpacity>
              <Text style={styles.calMonthLabel}>
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.calChevron} activeOpacity={0.7}>
                <SmallChevronRight />
              </TouchableOpacity>
            </View>

            {/* Day-of-week headers */}
            <View style={styles.calWeekRow}>
              {DAY_NAMES_SHORT.map(d => (
                <Text key={d} style={styles.calWeekDay}>{d}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.calGrid}>
              {calendarDays.map((item, idx) => {
                const isSelected = isSameDay(item.date, selectedDate);
                const isTodayCell = isSameDay(item.date, today);

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.calDayCell,
                      isSelected && styles.calDaySelected,
                    ]}
                    activeOpacity={0.6}
                    onPress={() => selectCalendarDay(item.date)}
                  >
                    <Text
                      style={[
                        styles.calDayText,
                        !item.inMonth && styles.calDayOutside,
                        isSelected && styles.calDayTextSelected,
                        isTodayCell && !isSelected && styles.calDayToday,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const CELL_SIZE = 40;

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

  /* Calendar Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    width: 7 * CELL_SIZE + 40,
    ...Shadows.card,
  },
  calMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calChevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonthLabel: {
    fontSize: 16,
    fontWeight: '650',
    color: Colors.ink,
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calWeekDay: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  calDaySelected: {
    backgroundColor: Colors.accent,
  },
  calDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.ink,
  },
  calDayOutside: {
    color: Colors.track,
  },
  calDayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calDayToday: {
    color: Colors.accent,
    fontWeight: '700',
  },
});
