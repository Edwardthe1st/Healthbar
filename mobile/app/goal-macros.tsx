import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MinusIcon, StepperPlusIcon } from '@/components/icons/Icons';
import { formatNumber, macrosToKcal } from '@/utils/helpers';

export default function GoalMacrosScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const rows = [
    { label: 'Protein', key: 'protein' as const, grams: state.macros.protein },
    { label: 'Carbs', key: 'carbs' as const, grams: state.macros.carbs },
    { label: 'Fat', key: 'fat' as const, grams: state.macros.fat },
  ];

  const totalKcal = macrosToKcal(state.macros.protein, state.macros.carbs, state.macros.fat);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Macro targets" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <View style={[styles.card, Shadows.card]}>
          {rows.map((row, i) => (
            <View key={row.key} style={[styles.row, styles.rowBorder]}>
              <Text style={styles.label}>{row.label}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => dispatch({ type: 'SET_MACROS', payload: { [row.key]: row.grams - 5 } })}
                  activeOpacity={0.7}
                >
                  <MinusIcon size={13} color={Colors.accent} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{row.grams}g</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => dispatch({ type: 'SET_MACROS', payload: { [row.key]: row.grams + 5 } })}
                  activeOpacity={0.7}
                >
                  <StepperPlusIcon size={13} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>From macros</Text>
            <Text style={styles.footerValue}>{formatNumber(totalKcal)} kcal</Text>
          </View>
        </View>

        <Text style={styles.helper}>
          Targets are per day. Protein and carbs are 4 kcal/g, fat is 9 kcal/g — the total updates live.
        </Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  card: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { flex: 1, fontSize: 15.5, fontWeight: '600', color: Colors.ink },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(46,140,158,0.06)',
    borderRadius: 999,
    padding: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  stepValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    minWidth: 42,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  footerLabel: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  footerValue: { fontSize: 16, fontWeight: '700', color: Colors.accent },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 14,
    lineHeight: 17.4,
  },
});
