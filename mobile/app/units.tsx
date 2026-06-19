import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function UnitsScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Units" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>Measurement</Text>
        <View style={styles.segmented}>
          {(['Metric', 'Imperial'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.segment, state.units.measure === v ? styles.segActive : styles.segInactive]}
              onPress={() => dispatch({ type: 'SET_UNIT', payload: { field: 'measure', value: v } })}
              activeOpacity={0.7}
            >
              <Text style={[styles.segText, state.units.measure === v ? styles.segTextActive : styles.segTextInactive]}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Energy</Text>
        <View style={styles.segmented}>
          {(['kcal', 'kJ'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.segment, state.units.energy === v ? styles.segActive : styles.segInactive]}
              onPress={() => dispatch({ type: 'SET_UNIT', payload: { field: 'energy', value: v } })}
              activeOpacity={0.7}
            >
              <Text style={[styles.segText, state.units.energy === v ? styles.segTextActive : styles.segTextInactive]}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.69,
    textTransform: 'uppercase',
    color: Colors.muted,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(46,140,158,0.06)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  segActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segInactive: {
    backgroundColor: 'transparent',
  },
  segText: { fontSize: 14, fontWeight: '650' },
  segTextActive: { color: Colors.ink },
  segTextInactive: { color: Colors.muted },
});
