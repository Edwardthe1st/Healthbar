import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Switch } from '@/components/ui/Switch';
import { CheckIcon } from '@/components/icons/Icons';
import { supabase } from '@/services/supabase';
import type { PrivacySettings } from '@/context/types';

const VISIBILITY_OPTIONS: { label: string; value: PrivacySettings['profileVisibility']; desc: string }[] = [
  { label: 'Everyone', value: 'everyone', desc: 'Anyone can see your profile' },
  { label: 'Friends only', value: 'friends', desc: 'Only your friends can see your profile' },
  { label: 'Only me', value: 'only_me', desc: 'Your profile is private' },
];

export default function ConfidentialityScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const persist = (updated: Partial<PrivacySettings>) => {
    const next = { ...state.privacy, ...updated };
    dispatch({ type: 'SET_PRIVACY', payload: updated });
    supabase.auth.updateUser({ data: { privacy: next } });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Confidentiality" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>Profile visibility</Text>
        <View style={[styles.card, Shadows.card]}>
          {VISIBILITY_OPTIONS.map((opt, i) => {
            const sel = state.privacy.profileVisibility === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.row, i < VISIBILITY_OPTIONS.length - 1 && styles.rowBorder]}
                onPress={() => persist({ profileVisibility: opt.value })}
                activeOpacity={0.7}
              >
                <View style={styles.textBlock}>
                  <Text style={styles.label}>{opt.label}</Text>
                  <Text style={styles.desc}>{opt.desc}</Text>
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

        <Text style={styles.sectionLabel}>Data sharing</Text>
        <View style={[styles.card, Shadows.card]}>
          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Share nutritional data</Text>
              <Text style={styles.desc}>Allow sharing meal logs with connected apps</Text>
            </View>
            <Switch
              value={state.privacy.shareNutritionalData}
              onToggle={() => persist({ shareNutritionalData: !state.privacy.shareNutritionalData })}
            />
          </View>
          <View style={[styles.switchRow, styles.rowBorder]}>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Share body data</Text>
              <Text style={styles.desc}>Allow sharing weight and measurements</Text>
            </View>
            <Switch
              value={state.privacy.shareBodyData}
              onToggle={() => persist({ shareBodyData: !state.privacy.shareBodyData })}
            />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Opt out of data resale</Text>
              <Text style={styles.desc}>Prevent your data from being sold to third parties</Text>
            </View>
            <Switch
              value={state.privacy.dataResaleOptOut}
              onToggle={() => persist({ dataResaleOptOut: !state.privacy.dataResaleOptOut })}
            />
          </View>
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
  switchRow: {
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
