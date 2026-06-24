import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ForwardChevron, TrashIcon } from '@/components/icons/Icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { signOut } = useAuth();

  const visibilityLabels: Record<string, string> = {
    everyone: 'Everyone',
    friends: 'Friends',
    only_me: 'Only me',
  };

  const privacyRows = [
    { label: 'Confidentiality', value: visibilityLabels[state.privacy.profileVisibility] || 'Only me', color: '#2E8C9E', route: '/confidentiality' },
    { label: 'Access & permissions', value: 'Camera, Health', color: '#6E2E9E', route: '/permissions' },
  ];

  const paymentRows = [
    { label: 'Payment methods', value: 'Manage', color: '#2E9E6E', route: '/payment' },
  ];

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>Privacy & security</Text>
        <View style={[styles.card, Shadows.card]}>
          {privacyRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.row, i < privacyRows.length - 1 && styles.rowBorder]}
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

        <Text style={styles.sectionLabel}>Payment</Text>
        <View style={[styles.card, Shadows.card]}>
          {paymentRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.row, i < paymentRows.length - 1 && styles.rowBorder]}
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

        <Text style={styles.sectionLabel}>Danger zone</Text>
        <View style={[styles.card, Shadows.card]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => dispatch({ type: 'SET_SHOW_DELETE', payload: true })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconTile, { backgroundColor: Colors.danger }]}>
              <View style={styles.iconDot} />
            </View>
            <Text style={[styles.rowLabel, { color: Colors.danger, fontWeight: '650' }]}>Delete profile</Text>
            <ForwardChevron color={Colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 34 }} />
      </ScrollView>

      <Modal visible={state.showDelete} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => dispatch({ type: 'SET_SHOW_DELETE', payload: false })}
            activeOpacity={1}
          />
          <View style={styles.dialog}>
            <View style={styles.dialogIcon}>
              <TrashIcon />
            </View>
            <Text style={styles.dialogTitle}>Delete profile?</Text>
            <Text style={styles.dialogBody}>
              This permanently erases your account, logs and history. This can't be undone.
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                dispatch({ type: 'SET_SHOW_DELETE', payload: false });
                signOut();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>Delete profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => dispatch({ type: 'SET_SHOW_DELETE', payload: false })}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
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
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: Colors.bg,
    borderRadius: 24,
    padding: 22,
    paddingTop: 22,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 20,
  },
  dialogIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(200,72,60,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  dialogTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.ink },
  dialogBody: {
    textAlign: 'center',
    fontSize: 13.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 6,
    lineHeight: 19.6,
  },
  deleteBtn: {
    marginTop: 18,
    backgroundColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '650', color: '#fff' },
  cancelBtn: { marginTop: 9, paddingVertical: 11, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.muted },
});
