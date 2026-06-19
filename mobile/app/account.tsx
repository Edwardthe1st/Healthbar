import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { BackChevron, SettingsIcon, ForwardChevron } from '@/components/icons/Icons';
import { getInitials, formatNumber, dietSummary, connectedSummary } from '@/utils/helpers';

export default function AccountScreen() {
  const router = useRouter();
  const { state } = useApp();

  const goalRows = [
    { label: 'Daily calorie goal', value: formatNumber(state.calorieGoal), color: '#2E8C9E', route: '/goal-calories' },
    { label: 'Macro targets', value: `${state.macros.protein}/${state.macros.carbs}/${state.macros.fat}`, color: '#2E9E6E', route: '/goal-macros' },
    { label: 'Activity level', value: state.activity, color: '#9E6E2E', route: '/activity' },
  ];

  const prefRows = [
    { label: 'Dietary preferences', value: dietSummary(state.diet), color: '#2E9E6E', route: '/dietary' },
    { label: 'Connected apps', value: connectedSummary(state.connected), color: '#C8483C', route: '/connected' },
    { label: 'Reminders', value: state.reminders.enabled ? 'On' : 'Off', color: '#6E2E9E', route: '/reminders' },
    { label: 'Units', value: state.units.measure, color: '#8C9E2E', route: '/units' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/settings')} activeOpacity={0.7}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(state.profile.name)}</Text>
          </View>
          <Text style={styles.profileName}>{state.profile.name}</Text>
          <Text style={styles.profileEmail}>{state.profile.email}</Text>
          <TouchableOpacity style={styles.editPill} onPress={() => router.push('/editprofile')} activeOpacity={0.7}>
            <Text style={styles.editPillText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Goals</Text>
        <View style={[styles.card, Shadows.card]}>
          {goalRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.row, i < goalRows.length - 1 && styles.rowBorder]}
              onPress={() => router.push(row.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconTile, { backgroundColor: row.color }]}>
                <View style={styles.iconDot} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
              <ForwardChevron />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={[styles.card, Shadows.card]}>
          {prefRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.row, i < prefRows.length - 1 && styles.rowBorder]}
              onPress={() => router.push(row.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconTile, { backgroundColor: row.color }]}>
                <View style={styles.iconDot} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
              <ForwardChevron />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, Shadows.card, { marginTop: 22 }]}>
          <TouchableOpacity
            style={styles.signOutRow}
            onPress={() => router.replace('/(auth)')}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 34 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '650',
    color: Colors.ink,
  },
  scroll: { flex: 1 },
  profileBlock: {
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(46,140,158,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 27, fontWeight: '700', color: Colors.accent },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 12,
    letterSpacing: -0.2,
  },
  profileEmail: { fontSize: 13.5, fontWeight: '500', color: Colors.muted, marginTop: 2 },
  editPill: {
    marginTop: 12,
    backgroundColor: 'rgba(46,140,158,0.10)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  editPillText: { fontSize: 13.5, fontWeight: '650', color: Colors.accent },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.69,
    textTransform: 'uppercase',
    color: Colors.muted,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#fff' },
  rowLabel: { flex: 1, fontSize: 15.5, fontWeight: '600', color: Colors.ink },
  rowValue: { fontSize: 14, color: Colors.muted, marginRight: 4 },
  signOutRow: { paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center' },
  signOutText: { fontSize: 15.5, fontWeight: '650', color: Colors.danger },
});
