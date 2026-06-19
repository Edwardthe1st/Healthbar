import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CheckIcon } from '@/components/icons/Icons';
import { DIET_OPTIONS } from '@/constants/data';

export default function DietaryScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Dietary preferences" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.helper}>
          We'll tailor food suggestions and the coach's advice to what you pick.
        </Text>
        <View style={[styles.card, Shadows.card]}>
          {DIET_OPTIONS.map((d, i) => {
            const sel = !!state.diet[d];
            return (
              <TouchableOpacity
                key={d}
                style={[styles.row, i < DIET_OPTIONS.length - 1 && styles.rowBorder]}
                onPress={() => dispatch({ type: 'TOGGLE_DIET', payload: d })}
                activeOpacity={0.7}
              >
                <Text style={styles.label}>{d}</Text>
                {sel ? (
                  <View style={styles.checkSel}>
                    <CheckIcon size={13} />
                  </View>
                ) : (
                  <View style={styles.checkEmpty} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    lineHeight: 17.4,
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
  checkSel: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmpty: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(105,118,122,0.4)',
  },
});
