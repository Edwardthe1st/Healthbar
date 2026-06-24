import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Shadows } from '@/constants/theme';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    weight.trim().length > 0 &&
    height.trim().length > 0;

  const handleContinue = async () => {
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        weight: weight.trim(),
        height: height.trim(),
        phone: phone.trim() || undefined,
      });
    } catch (e: any) {
      setError(e.message ?? 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>Just a few details to get started.</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>FIRST NAME</Text>
            <TextInput
              style={styles.inputField}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="John"
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>LAST NAME</Text>
            <TextInput
              style={styles.inputField}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.sideRow}>
            <View style={[styles.inputCard, styles.flex]}>
              <Text style={[styles.inputLabel, styles.centerText]}>WEIGHT</Text>
              <View style={styles.unitRow}>
                <TextInput
                  style={[styles.inputField, styles.unitInput]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="numeric"
                />
                <Text style={styles.unitLabel}>kg</Text>
              </View>
            </View>
            <View style={[styles.inputCard, styles.flex]}>
              <Text style={[styles.inputLabel, styles.centerText]}>HEIGHT</Text>
              <View style={styles.unitRow}>
                <TextInput
                  style={[styles.inputField, styles.unitInput]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="numeric"
                />
                <Text style={styles.unitLabel}>cm</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>PHONE NUMBER (OPTIONAL)</Text>
            <TextInput
              style={styles.inputField}
              value={phone}
              onChangeText={setPhone}
              placeholder="+33 6 ..."
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              canSubmit
                ? [styles.primaryActive, Shadows.button]
                : styles.primaryDisabled,
            ]}
            activeOpacity={canSubmit && !isSubmitting ? 0.7 : 1}
            onPress={canSubmit && !isSubmitting ? handleContinue : undefined}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  !canSubmit && styles.primaryButtonTextDisabled,
                ]}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.54,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 6,
  },
  errorBanner: {
    backgroundColor: 'rgba(200,72,60,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#C8483C',
    textAlign: 'center',
  },
  formGroup: {
    gap: 11,
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 15,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.58,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  inputField: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    padding: 0,
  },
  sideRow: {
    flexDirection: 'row',
    gap: 11,
  },
  centerText: {
    textAlign: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginTop: 5,
  },
  unitInput: {
    width: 54,
    textAlign: 'right',
    marginTop: 0,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  primaryActive: {
    backgroundColor: Colors.accent,
  },
  primaryDisabled: {
    backgroundColor: 'rgba(46,140,158,0.12)',
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#fff',
  },
  primaryButtonTextDisabled: {
    color: Colors.muted,
  },
});
