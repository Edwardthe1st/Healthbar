import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CheckIcon } from '@/components/icons/Icons';
import { supabase } from '@/services/supabase';
import type { SubscriptionTier } from '@/context/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Replace these with your actual Stripe Price IDs from the dashboard
const PRICE_IDS: Record<Exclude<SubscriptionTier, 'free'>, string> = {
  no_ads: 'price_1TlnErDEnwt5vv6biugcm0FD',
  plus: 'price_1TlnFvDEnwt5vv6bmJZ9hcYm',
};

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (tier: SubscriptionTier) => {
    if (tier === state.subscription) return;
    if (loading) return;

    setLoading(true);

    try {
      if (tier === 'free') {
        // Cancel subscription
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert('Error', 'You must be logged in.');
          return;
        }

        const res = await fetch(`${SUPABASE_URL}/functions/v1/cancel-subscription`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? 'Failed to cancel subscription');
        }

        dispatch({ type: 'SET_SUBSCRIPTION', payload: 'free' });
        Alert.alert('Subscription cancelled', 'Your subscription will end at the current billing period.');
      } else {
        // Subscribe to a paid plan
        const priceId = PRICE_IDS[tier];
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert('Error', 'You must be logged in.');
          return;
        }

        // 1. Create subscription on backend
        const res = await fetch(`${SUPABASE_URL}/functions/v1/create-subscription`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? 'Failed to create subscription');
        }

        const { clientSecret, ephemeralKey, customerId } = await res.json();

        // 2. Initialize Payment Sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          customerEphemeralKeySecret: ephemeralKey,
          customerId,
          merchantDisplayName: 'Healthbar',
          allowsDelayedPaymentMethods: false,
        });

        if (initError) {
          throw new Error(initError.message);
        }

        // 3. Present Payment Sheet
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            // User dismissed the sheet, not an error
            return;
          }
          throw new Error(presentError.message);
        }

        // 4. Payment succeeded — now create the actual subscription
        const confirmRes = await fetch(`${SUPABASE_URL}/functions/v1/confirm-subscription`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        });

        if (!confirmRes.ok) {
          const confirmBody = await confirmRes.json();
          throw new Error(confirmBody.error ?? 'Failed to activate subscription');
        }

        dispatch({ type: 'SET_SUBSCRIPTION', payload: tier });
        Alert.alert('Success', `You are now subscribed to ${PLANS.find((p) => p.tier === tier)?.name}!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
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
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
