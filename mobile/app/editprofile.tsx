import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { CameraIcon } from '@/components/icons/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/services/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  useEffect(() => {
    dispatch({ type: 'INIT_DRAFT' });
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const src = result.assets[0].uri;
    const dest = FileSystem.documentDirectory + `avatar_${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: src, to: dest });
    dispatch({ type: 'SET_AVATAR_URI', payload: dest });
    await AsyncStorage.setItem('avatarUri', dest);
  };

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
        <TouchableOpacity onPress={async () => {
          dispatch({ type: 'SAVE_PROFILE' });
          const nameParts = state.draft.name.split(' ');
          const updates: Parameters<typeof supabase.auth.updateUser>[0] = {
            data: {
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              username: state.draft.username,
              phone: state.draft.phone,
            },
          };
          if (state.draft.email !== state.profile.email) {
            updates.email = state.draft.email;
          }
          const { error } = await supabase.auth.updateUser(updates);
          if (error) {
            Alert.alert('Error', error.message);
            return;
          }
          if (state.draft.email !== state.profile.email) {
            Alert.alert(
              'Confirm your email',
              'A confirmation link has been sent to your new email address. Please check your inbox.',
            );
          }
          router.back();
        }}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <TouchableOpacity style={styles.avatarBlock} onPress={pickImage} activeOpacity={0.7}>
          <View style={styles.avatarContainer}>
            <Avatar size={84} name={state.draft.name} avatarUri={state.draft.avatarUri} />
            <View style={styles.cameraBadge}>
              <CameraIcon size={15} />
            </View>
          </View>
          <Text style={styles.changePhoto}>Change photo</Text>
        </TouchableOpacity>

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
