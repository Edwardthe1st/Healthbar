import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/useAuth';

const GREEN = '#22C55E';
const GRAY_100 = '#F3F4F6';
const GRAY_600 = '#4B5563';
const GRAY_900 = '#111827';
const RED = '#EF4444';

type Mode = 'login' | 'register';

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sédentaire' },
  { value: 'LIGHT', label: 'Légèrement actif' },
  { value: 'MODERATE', label: 'Modérément actif' },
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'VERY_ACTIVE', label: 'Très actif' },
] as const;

const GOAL_OPTIONS = [
  { value: 'LOSE_WEIGHT', label: '🏃 Perte de poids' },
  { value: 'MAINTAIN', label: '⚖️ Maintien' },
  { value: 'GAIN_MUSCLE', label: '💪 Prise de muscle' },
] as const;

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [activityLevel, setActivityLevel] = useState<typeof ACTIVITY_OPTIONS[number]['value']>('MODERATE');
  const [goal, setGoal] = useState<typeof GOAL_OPTIONS[number]['value']>('MAINTAIN');

  const { login, register, isLoading, error } = useAuth();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }
    await login(email, password);
  }

  async function handleRegister() {
    if (!email || !password || !name || !age || !weightKg || !heightCm) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    await register({
      email,
      password,
      name,
      age: parseInt(age, 10),
      weight_kg: parseFloat(weightKg),
      height_cm: parseFloat(heightCm),
      gender,
      activity_level: activityLevel,
      goal,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo / Title */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <Text style={styles.appName}>NutriApp</Text>
            <Text style={styles.appTagline}>Votre suivi nutritionnel intelligent</Text>
          </View>

          {/* Mode switcher */}
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
                Inscription
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Common fields */}
          <View style={styles.form}>
            {mode === 'register' && (
              <TextInput
                style={styles.input}
                placeholder="Prénom et nom"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe (8 caractères min.)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Register extra fields */}
            {mode === 'register' && (
              <>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Âge"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Poids (kg)"
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Taille (cm)"
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="decimal-pad"
                  />
                </View>

                <Text style={styles.sectionLabel}>Genre</Text>
                <View style={styles.chipRow}>
                  {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, gender === g && styles.chipActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                        {g === 'MALE' ? 'Homme' : g === 'FEMALE' ? 'Femme' : 'Autre'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Niveau d'activité</Text>
                <View style={styles.chipRow}>
                  {ACTIVITY_OPTIONS.map((a) => (
                    <TouchableOpacity
                      key={a.value}
                      style={[styles.chip, activityLevel === a.value && styles.chipActive]}
                      onPress={() => setActivityLevel(a.value)}
                    >
                      <Text style={[styles.chipText, activityLevel === a.value && styles.chipTextActive]}>
                        {a.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Objectif</Text>
                <View style={styles.chipRow}>
                  {GOAL_OPTIONS.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      style={[styles.chip, goal === g.value && styles.chipActive]}
                      onPress={() => setGoal(g.value)}
                    >
                      <Text style={[styles.chipText, goal === g.value && styles.chipTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Se connecter' : "Créer mon compte"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, gap: 16 },

  header: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 28, fontWeight: '800', color: GRAY_900 },
  appTagline: { fontSize: 14, color: GRAY_600 },

  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: GRAY_100,
    borderRadius: 12,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: GRAY_600 },
  modeBtnTextActive: { color: GRAY_900 },

  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12 },
  errorText: { color: RED, fontSize: 13, textAlign: 'center' },

  form: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: GRAY_100,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: GRAY_900,
    backgroundColor: GRAY_100,
  },
  row: { flexDirection: 'row', gap: 8 },

  sectionLabel: { fontSize: 13, fontWeight: '600', color: GRAY_600, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_100,
    backgroundColor: GRAY_100,
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 13, color: GRAY_600, fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  submitBtn: {
    backgroundColor: GREEN,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
