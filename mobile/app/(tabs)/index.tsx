import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { getInitials } from '@/utils/helpers';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ArrowRightIcon } from '@/components/icons/Icons';
import { TODAY_MEALS } from '@/constants/data';

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useApp();
  const name = state.profile.name;
  const firstName = name.split(' ')[0];
  const initials = getInitials(name);
  const calorieGoal = state.calorieGoal;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {firstName}</Text>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/account')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={[styles.heroCard, Shadows.card]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>Calories left</Text>
            <Text style={styles.heroGoal}>Goal {calorieGoal.toLocaleString()}</Text>
          </View>
          <Text style={styles.heroBigNumber}>1,240 kcal</Text>
          <ProgressBar percent={52} height={16} />
          <View style={styles.heroFooterRow}>
            <Text style={styles.heroFooterText}>1,160 eaten</Text>
            <Text style={styles.heroFooterText}>+220 exercise</Text>
          </View>
        </View>

        {/* Macro row */}
        <View style={styles.macroRow}>
          <View style={[styles.macroCard, Shadows.card]}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>84/120g</Text>
            <ProgressBar percent={70} height={6} />
          </View>
          <View style={[styles.macroCard, Shadows.card]}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>142/240g</Text>
            <ProgressBar percent={59} height={6} />
          </View>
          <View style={[styles.macroCard, Shadows.card]}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>38/70g</Text>
            <ProgressBar percent={54} height={6} />
          </View>
        </View>

        {/* Today section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          <TouchableOpacity onPress={() => router.push('/search')} activeOpacity={0.7}>
            <Text style={styles.addMealLink}>Add meal</Text>
          </TouchableOpacity>
        </View>

        {/* Today list card */}
        <View style={[styles.todayCard, Shadows.card]}>
          {TODAY_MEALS.map((item, index) => (
            <View
              key={item.name}
              style={[
                styles.foodRow,
                index < TODAY_MEALS.length - 1 && styles.foodRowBorder,
              ]}
            >
              {/* Striped thumbnail placeholder */}
              <View style={styles.thumbnail}>
                <View style={[styles.stripe, { top: 8 }]} />
                <View style={[styles.stripe, { top: 16 }]} />
                <View style={[styles.stripe, { top: 24 }]} />
                <View style={[styles.stripe, { top: 32 }]} />
              </View>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMeta}>
                  {item.meal} &middot; {item.protein}g protein
                </Text>
              </View>
              <Text style={styles.foodKcal}>{item.kcal}</Text>
            </View>
          ))}
        </View>

        {/* Coach teaser */}
        <TouchableOpacity
          style={[styles.coachCard, Shadows.card]}
          onPress={() => router.push('/coach')}
          activeOpacity={0.7}
        >
          <View style={styles.coachLeft}>
            <View style={styles.coachIcon}>
              <View style={styles.coachBar1} />
              <View style={styles.coachBar2} />
              <View style={styles.coachBar3} />
            </View>
            <View style={styles.coachTextWrap}>
              <Text style={styles.coachTitle}>Ask Healthbar</Text>
              <Text style={styles.coachSubtitle}>
                Meal ideas, macro tips &amp; more
              </Text>
            </View>
          </View>
          <ArrowRightIcon size={14} color={Colors.accent} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 62,
    paddingBottom: 24,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 22,
  },
  greeting: {
    fontSize: 23,
    fontWeight: '650',
    letterSpacing: -0.46,
    color: Colors.ink,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(46,140,158,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accent,
  },

  /* Hero card */
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    color: Colors.muted,
  },
  heroGoal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  heroBigNumber: {
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -1.38,
    color: Colors.ink,
    marginBottom: 14,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  heroFooterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
  },

  /* Macro row */
  macroRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 14,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '650',
    color: Colors.ink,
    marginBottom: 10,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.69,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  addMealLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },

  /* Today card */
  todayCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  foodRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.track,
    marginRight: 14,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 3,
  },
  foodMeta: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
  },
  foodKcal: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.ink,
    marginLeft: 8,
  },

  /* Coach teaser */
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(46,140,158,0.08)',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
  },
  coachLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
    marginRight: 14,
  },
  coachBar1: {
    width: 3,
    height: 7,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  coachBar2: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  coachBar3: {
    width: 3,
    height: 10,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  coachTextWrap: {
    flex: 1,
  },
  coachTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 2,
  },
  coachSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
  },
});
