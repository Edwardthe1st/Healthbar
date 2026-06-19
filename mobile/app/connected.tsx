import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Switch } from '@/components/ui/Switch';
import { CONNECTED_APPS } from '@/constants/data';

export default function ConnectedScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Connected apps" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.helper}>
          Sync steps, workouts and weight automatically from your favourite services.
        </Text>
        <View style={[styles.card, Shadows.card]}>
          {CONNECTED_APPS.map((app, i) => (
            <View key={app} style={[styles.row, i < CONNECTED_APPS.length - 1 && styles.rowBorder]}>
              <Text style={styles.label}>{app}</Text>
              <Switch
                value={!!state.connected[app]}
                onToggle={() => dispatch({ type: 'TOGGLE_CONNECTED', payload: app })}
              />
            </View>
          ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    lineHeight: 17.4,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 22,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { flex: 1, fontSize: 15.5, fontWeight: '600', color: Colors.ink },
});
