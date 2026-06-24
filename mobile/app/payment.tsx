import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function PaymentScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Payment methods" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>Saved cards</Text>
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No cards saved</Text>
            <Text style={styles.emptyDesc}>
              Add a payment method to enable premium features and subscriptions.
            </Text>
          </View>
        </View>

        <View style={[styles.addBtn, Shadows.card]}>
          <Text style={styles.addBtnText}>Add card</Text>
        </View>

        <Text style={styles.footnote}>
          Card management is powered by Stripe. Your card details are never stored on our servers.
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    overflow: 'hidden',
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: '650', color: Colors.ink },
  emptyDesc: {
    fontSize: 13.5,
    fontWeight: '500',
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19.6,
  },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 15, fontWeight: '650', color: '#fff' },
  footnote: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 14,
    lineHeight: 17.4,
    textAlign: 'center',
  },
});
