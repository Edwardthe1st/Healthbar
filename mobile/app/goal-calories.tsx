import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LargeMinusIcon, LargePlusIcon } from '@/components/icons/Icons';
import { formatNumber } from '@/utils/helpers';
import { CALORIE_PRESETS } from '@/constants/data';

export default function GoalCaloriesScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Daily goal" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <View style={[styles.mainCard, Shadows.card]}>
          <TouchableOpacity
            style={styles.decBtn}
            onPress={() => dispatch({ type: 'SET_CALORIE_GOAL', payload: state.calorieGoal - 50 })}
            activeOpacity={0.7}
          >
            <LargeMinusIcon />
          </TouchableOpacity>
          <View style={styles.valueBlock}>
            <Text style={styles.bigValue}>{formatNumber(state.calorieGoal)}</Text>
            <Text style={styles.unit}>kcal / day</Text>
          </View>
          <TouchableOpacity
            style={[styles.incBtn, Shadows.button]}
            onPress={() => dispatch({ type: 'SET_CALORIE_GOAL', payload: state.calorieGoal + 50 })}
            activeOpacity={0.7}
          >
            <LargePlusIcon />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Quick set</Text>
        <View style={styles.chips}>
          {CALORIE_PRESETS.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.chip, state.calorieGoal === v ? styles.chipActive : styles.chipInactive]}
              onPress={() => dispatch({ type: 'SET_CALORIE_GOAL', payload: v })}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, state.calorieGoal === v && styles.chipTextActive]}>
                {formatNumber(v)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.helper}>
          Your daily target adjusts the ring on Home and your remaining calories. Tap ± to fine-tune by 50.
        </Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  mainCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  decBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBlock: { alignItems: 'center', minWidth: 120 },
  bigValue: {
    fontSize: 46,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -1.38,
    lineHeight: 46,
  },
  unit: { fontSize: 13, fontWeight: '500', color: Colors.muted, marginTop: 5 },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.69,
    textTransform: 'uppercase',
    color: Colors.muted,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingHorizontal: 16,
  },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 13 },
  chipActive: { backgroundColor: Colors.accent },
  chipInactive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: { fontSize: 14, fontWeight: '650', color: Colors.ink },
  chipTextActive: { color: '#fff' },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 18,
    lineHeight: 17.4,
  },
});
