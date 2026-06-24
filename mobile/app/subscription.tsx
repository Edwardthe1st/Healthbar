import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CheckIcon } from '@/components/icons/Icons';
import { supabase } from '@/services/supabase';
import type { SubscriptionTier } from '@/context/types';

const PLANS: {
  tier: SubscriptionTier;
  name: string;
  price: string;
  features: string[];
}[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '0 €',
    features: ['Basic tracking', 'Community access'],
  },
  {
    tier: 'no_ads',
    name: 'Without Ads',
    price: '2,99 €/month',
    features: ['Ad-free experience', 'Basic tracking', 'Community access'],
  },
  {
    tier: 'plus',
    name: 'Plus',
    price: '4,99 €/month',
    features: [
      'Ad-free experience',
      'AI Coach unlimited',
      'Priority support',
      'Advanced insights',
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const handleSelect = async (tier: SubscriptionTier) => {
    dispatch({ type: 'SET_SUBSCRIPTION', payload: tier });
    await supabase.auth.updateUser({ data: { subscription: tier } });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Subscription" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        {PLANS.map((plan) => {
          const active = state.subscription === plan.tier;
          return (
            <TouchableOpacity
              key={plan.tier}
              style={[
                styles.card,
                Shadows.card,
                active && styles.cardActive,
              ]}
              onPress={() => handleSelect(plan.tier)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {active && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Current</Text>
                    </View>
                  )}
                </View>
                {active ? (
                  <View style={styles.radioSel}>
                    <CheckIcon size={13} />
                  </View>
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </View>
              <Text style={styles.price}>{plan.price}</Text>
              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: Colors.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  badge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '650',
    color: Colors.accent,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: 6,
  },
  featureList: {
    marginTop: 12,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },
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
