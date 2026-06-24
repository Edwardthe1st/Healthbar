import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { formatIban, maskIban } from '@/utils/helpers';

interface BankAccount {
  id: string;
  holder_name: string;
  iban: string;
}

export default function BankAccountScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [iban, setIban] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAccount(data);
          setHolderName(data.holder_name);
          setIban(data.iban);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const clean = iban.replace(/\s/g, '');
    if (clean.length < 15) {
      Alert.alert('Invalid IBAN', 'Please enter a valid IBAN.');
      return;
    }
    if (!holderName.trim()) {
      Alert.alert('Missing name', 'Please enter the account holder name.');
      return;
    }

    setSaving(true);
    if (account) {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ holder_name: holderName.trim(), iban: clean })
        .eq('id', account.id);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setAccount({ ...account, holder_name: holderName.trim(), iban: clean });
        setEditing(false);
      }
    } else {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ user_id: user.id, holder_name: holderName.trim(), iban: clean })
        .select()
        .single();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setAccount(data);
        setEditing(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = () => {
    Alert.alert('Remove bank account?', 'This will delete your saved IBAN.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (!account) return;
          await supabase.from('bank_accounts').delete().eq('id', account.id);
          setAccount(null);
          setHolderName('');
          setIban('');
          setEditing(false);
        },
      },
    ]);
  };

  const showForm = !account || editing;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Bank account (RIB)" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        {loading ? (
          <Text style={styles.loadingText}>Loading…</Text>
        ) : showForm ? (
          <>
            <Text style={styles.sectionLabel}>Account details</Text>
            <View style={[styles.card, Shadows.card]}>
              <View style={[styles.fieldRow, styles.fieldBorder]}>
                <Text style={styles.fieldLabel}>Holder</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={holderName}
                  onChangeText={setHolderName}
                  placeholder="Full name"
                  placeholderTextColor={Colors.placeholder}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>IBAN</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={formatIban(iban)}
                  onChangeText={(v) => setIban(v.replace(/[^A-Z0-9]/gi, ''))}
                  placeholder="FR76 1234 5678 …"
                  placeholderTextColor={Colors.placeholder}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>

            {account && (
              <TouchableOpacity style={styles.cancelLink} onPress={() => setEditing(false)} activeOpacity={0.7}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Saved account</Text>
            <View style={[styles.card, Shadows.card]}>
              <View style={[styles.fieldRow, styles.fieldBorder]}>
                <Text style={styles.fieldLabel}>Holder</Text>
                <Text style={styles.fieldValue}>{account.holder_name}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>IBAN</Text>
                <Text style={styles.fieldValue}>{maskIban(account.iban)}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.editBtn, Shadows.card]}
                onPress={() => setEditing(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.removeBtn, Shadows.card]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
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
  loadingText: { textAlign: 'center', color: Colors.muted, marginTop: 40, fontSize: 15 },
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  fieldLabel: { width: 70, fontSize: 14, fontWeight: '600', color: Colors.muted },
  fieldInput: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: Colors.ink,
    padding: 0,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: Colors.ink,
  },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '650', color: '#fff' },
  cancelLink: { marginTop: 12, alignItems: 'center' },
  cancelLinkText: { fontSize: 15, fontWeight: '600', color: Colors.muted },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 15, fontWeight: '650', color: Colors.accent },
  removeBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  removeBtnText: { fontSize: 15, fontWeight: '650', color: Colors.danger },
});
