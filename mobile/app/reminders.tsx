import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Switch } from '@/components/ui/Switch';

export default function RemindersScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const subItems = ['Breakfast', 'Lunch', 'Dinner', 'Water'] as const;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reminders" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <View style={[styles.masterCard, Shadows.card]}>
          <View style={styles.masterRow}>
            <View style={styles.masterText}>
              <Text style={styles.masterLabel}>Meal reminders</Text>
              <Text style={styles.masterDesc}>Nudge me to log my meals</Text>
            </View>
            <Switch
              value={state.reminders.enabled}
              onToggle={() => dispatch({ type: 'TOGGLE_REMINDER', payload: 'enabled' })}
            />
          </View>
        </View>

        {state.reminders.enabled && (
          <>
            <Text style={styles.sectionLabel}>Remind me for</Text>
            <View style={[styles.card, Shadows.card]}>
              {subItems.map((item, i) => (
                <View key={item} style={[styles.row, i < subItems.length - 1 && styles.rowBorder]}>
                  <Text style={styles.label}>{item}</Text>
                  <Switch
                    value={state.reminders[item]}
                    onToggle={() => dispatch({ type: 'TOGGLE_REMINDER', payload: item })}
                  />
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  masterCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 13,
    paddingHorizontal: 16,
  },
  masterRow: { flexDirection: 'row', alignItems: 'center' },
  masterText: { flex: 1 },
  masterLabel: { fontSize: 15.5, fontWeight: '600', color: Colors.ink },
  masterDesc: { fontSize: 12.5, fontWeight: '500', color: Colors.muted, marginTop: 2 },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.69,
    textTransform: 'uppercase',
    color: Colors.muted,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { flex: 1, fontSize: 15.5, fontWeight: '600', color: Colors.ink },
});
