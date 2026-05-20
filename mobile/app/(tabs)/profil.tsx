import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '../../services/useAuth';
import { useNutrition, NutritionProfile } from '../../services/useNutrition';
import { get, put } from '../../services/api';
import type { UserProfile } from '../../store/userStore';

const GREEN = '#22C55E';
const GRAY_100 = '#F3F4F6';
const GRAY_600 = '#4B5563';
const GRAY_900 = '#111827';
const RED = '#EF4444';

// ─── Label maps ───────────────────────────────────────────────────────────────

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Homme',
  FEMALE: 'Femme',
  OTHER: 'Autre',
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: 'Sédentaire',
  LIGHT: 'Légèrement actif',
  MODERATE: 'Modérément actif',
  ACTIVE: 'Actif',
  VERY_ACTIVE: 'Très actif',
};

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: '🏃 Perte de poids',
  MAINTAIN: '⚖️ Maintien',
  GAIN_MUSCLE: '💪 Prise de muscle',
};

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ─── Nutrition profile card ───────────────────────────────────────────────────

function NutritionCard({ profile }: { profile: NutritionProfile }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Profil nutritionnel</Text>
      <StatRow label="BMR" value={`${Math.round(profile.bmr)} kcal/j`} />
      <StatRow label="TDEE" value={`${Math.round(profile.tdee)} kcal/j`} />
      <View style={styles.divider} />
      <StatRow label="Objectif calorique" value={`${Math.round(profile.target_calories)} kcal`} />
      <StatRow label="Protéines" value={`${Math.round(profile.target_proteins_g)}g`} />
      <StatRow label="Glucides" value={`${Math.round(profile.target_carbs_g)}g`} />
      <StatRow label="Lipides" value={`${Math.round(profile.target_fats_g)}g`} />
      <Text style={styles.formulaNote}>Calculé avec Mifflin-St Jeor (1990)</Text>
    </View>
  );
}

// ─── Edit profile modal (inline section) ─────────────────────────────────────

function EditSection({
  user,
  onSaved,
}: {
  user: UserProfile;
  onSaved: () => void;
}) {
  const [weightKg, setWeightKg] = useState(String(user.weight_kg));
  const [heightCm, setHeightCm] = useState(String(user.height_cm));
  const [age, setAge] = useState(String(user.age));
  const [goal, setGoal] = useState(user.goal);
  const [activityLevel, setActivityLevel] = useState(user.activity_level);
  const [isSaving, setIsSaving] = useState(false);

  const { setUser } = useUserStore();

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await put<UserProfile>('/users/me', {
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        age: parseInt(age, 10),
        goal,
        activity_level: activityLevel,
      });
      setUser(updated);
      onSaved();
      Alert.alert('Succès', 'Profil mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  }

  const goals: UserProfile['goal'][] = ['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE'];
  const activities: UserProfile['activity_level'][] = [
    'SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE',
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Modifier le profil</Text>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Poids (kg)</Text>
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Taille (cm)</Text>
          <TextInput
            style={styles.input}
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Âge</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Objectif</Text>
      <View style={styles.chipGroup}>
        {goals.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, goal === g && styles.chipActive]}
            onPress={() => setGoal(g)}
          >
            <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>
              {GOAL_LABELS[g]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Niveau d'activité</Text>
      <View style={styles.chipGroup}>
        {activities.map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.chip, activityLevel === a && styles.chipActive]}
            onPress={() => setActivityLevel(a)}
          >
            <Text style={[styles.chipText, activityLevel === a && styles.chipTextActive]}>
              {ACTIVITY_LABELS[a]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const user = useUserStore((s) => s.user);
  const [editing, setEditing] = useState(false);

  const { profile, fetchProfile, isLoading } = useNutrition();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={RED} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Identity card */}
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{GENDER_LABELS[user.gender]}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{user.age} ans</Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.infoBadgeText, { color: '#16A34A' }]}>
                {GOAL_LABELS[user.goal]}
              </Text>
            </View>
          </View>
        </View>

        {/* Body stats */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mesures corporelles</Text>
          <StatRow label="Poids" value={`${user.weight_kg} kg`} />
          <StatRow label="Taille" value={`${user.height_cm} cm`} />
          <StatRow label="Niveau d'activité" value={ACTIVITY_LABELS[user.activity_level]} />
        </View>

        {/* Nutrition profile from ML */}
        {isLoading && !profile ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 16 }} />
        ) : profile ? (
          <NutritionCard profile={profile} />
        ) : null}

        {/* Edit section */}
        {editing ? (
          <EditSection user={user} onSaved={() => { setEditing(false); fetchProfile(); }} />
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={16} color={GREEN} />
            <Text style={styles.editBtnText}>Modifier mon profil</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GRAY_100 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  screenTitle: { fontSize: 20, fontWeight: '700', color: GRAY_900 },
  scroll: { padding: 16, gap: 12 },

  identityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: GRAY_900 },
  userEmail: { fontSize: 13, color: GRAY_600 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  infoBadge: {
    backgroundColor: GRAY_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  infoBadgeText: { fontSize: 12, color: GRAY_600, fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: GRAY_900 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 14, color: GRAY_600 },
  statValue: { fontSize: 14, fontWeight: '600', color: GRAY_900 },
  divider: { height: 1, backgroundColor: GRAY_100 },
  formulaNote: { fontSize: 11, color: GRAY_600, fontStyle: 'italic', textAlign: 'right' },

  fieldRow: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12, color: GRAY_600, fontWeight: '500', marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: GRAY_100,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: GRAY_900,
    backgroundColor: GRAY_100,
  },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GRAY_100,
    backgroundColor: GRAY_100,
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12, color: GRAY_600, fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  saveBtn: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    backgroundColor: '#fff',
  },
  editBtnText: { color: GREEN, fontWeight: '600', fontSize: 14 },
});
