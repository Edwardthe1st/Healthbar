import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { CameraIcon } from '@/components/icons/Icons';
import { getInitials } from '@/utils/helpers';

export default function EditProfileScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  useEffect(() => {
    dispatch({ type: 'INIT_DRAFT' });
  }, []);

  const fields = [
    { label: 'Name', value: state.draft.name, field: 'name', placeholder: 'Full name', prefix: '' },
    { label: 'Username', value: state.draft.username, field: 'username', placeholder: 'username', prefix: '@' },
    { label: 'Email', value: state.draft.email, field: 'email', placeholder: 'you@email.com', prefix: '' },
    { label: 'Phone', value: state.draft.phone, field: 'phone', placeholder: '+33 6 …', prefix: '' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity onPress={() => { dispatch({ type: 'SAVE_PROFILE' }); router.back(); }}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(state.draft.name)}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <CameraIcon size={15} />
            </View>
          </View>
          <Text style={styles.changePhoto}>Change photo</Text>
        </View>

        <Text style={styles.sectionLabel}>Profile info</Text>
        <View style={[styles.card, Shadows.card]}>
          {fields.map((f, i) => (
            <View key={f.field} style={[styles.fieldRow, i < fields.length - 1 && styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              {f.prefix ? <Text style={styles.prefix}>{f.prefix}</Text> : null}
              <TextInput
                style={[styles.fieldInput, f.field === 'name' && { fontWeight: '600' }]}
                value={f.value}
                onChangeText={(v) => dispatch({ type: 'SET_DRAFT', payload: { [f.field]: v } })}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.placeholder}
                autoCapitalize={f.field === 'email' ? 'none' : 'words'}
                keyboardType={f.field === 'email' ? 'email-address' : f.field === 'phone' ? 'phone-pad' : 'default'}
              />
            </View>
          ))}
        </View>
        <Text style={styles.helperText}>
          Your email and phone are used for sign-in and account recovery. They're never shown to other users.
        </Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 8,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.muted },
  headerTitle: { fontSize: 17, fontWeight: '650', color: Colors.ink },
  saveText: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  scroll: { flex: 1 },
  avatarBlock: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(46,140,158,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 29, fontWeight: '700', color: Colors.accent },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    borderWidth: 3,
    borderColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: { fontSize: 13.5, fontWeight: '650', color: Colors.accent, marginTop: 11 },
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
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  fieldLabel: { width: 88, fontSize: 14, fontWeight: '600', color: Colors.muted },
  prefix: { fontSize: 15.5, fontWeight: '600', color: Colors.muted },
  fieldInput: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: Colors.ink,
    padding: 0,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 12,
    lineHeight: 17.4,
  },
});
