import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CheckIcon } from '@/components/icons/Icons';
import { ACTIVITY_LEVELS } from '@/constants/data';

export default function ActivityScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Activity level" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <View style={[styles.card, Shadows.card]}>
          {ACTIVITY_LEVELS.map((a, i) => {
            const sel = state.activity === a.label;
            return (
              <TouchableOpacity
                key={a.label}
                style={[styles.row, i < ACTIVITY_LEVELS.length - 1 && styles.rowBorder]}
                onPress={() => dispatch({ type: 'SET_ACTIVITY', payload: a.label })}
                activeOpacity={0.7}
              >
                <View style={styles.textBlock}>
                  <Text style={styles.label}>{a.label}</Text>
                  <Text style={styles.desc}>{a.desc}</Text>
                </View>
                {sel ? (
                  <View style={styles.radioSel}>
                    <CheckIcon size={13} />
                  </View>
                ) : (
                  <View style={styles.radioEmpty} />
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
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  textBlock: { flex: 1 },
  label: { fontSize: 15.5, fontWeight: '600', color: Colors.ink },
  desc: { fontSize: 12.5, fontWeight: '500', color: Colors.muted, marginTop: 2 },
  radioSel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(105,118,122,0.4)',
  },
});
