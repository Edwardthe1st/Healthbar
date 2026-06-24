import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ForwardChevron } from '@/components/icons/Icons';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export default function PermissionsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('undetermined');
  const [mediaStatus, setMediaStatus] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    ImagePicker.getCameraPermissionsAsync().then((r) =>
      setCameraStatus(r.status as PermissionStatus)
    );
    ImagePicker.getMediaLibraryPermissionsAsync().then((r) =>
      setMediaStatus(r.status as PermissionStatus)
    );
  }, []);

  const statusLabel = (s: PermissionStatus) => {
    if (s === 'granted') return 'Allowed';
    if (s === 'denied') return 'Denied';
    return 'Not asked';
  };

  const statusColor = (s: PermissionStatus) => {
    if (s === 'granted') return Colors.online;
    if (s === 'denied') return Colors.danger;
    return Colors.muted;
  };

  const connectedApps = Object.entries(state.connected);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Access & permissions" onBack={() => router.back()} />
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>Device permissions</Text>
        <View style={[styles.card, Shadows.card]}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={[styles.iconTile, { backgroundColor: '#6E2E9E' }]}>
              <View style={styles.iconDot} />
            </View>
            <Text style={styles.rowLabel}>Camera</Text>
            <Text style={[styles.rowValue, { color: statusColor(cameraStatus) }]}>
              {statusLabel(cameraStatus)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.iconTile, { backgroundColor: '#2E8C9E' }]}>
              <View style={styles.iconDot} />
            </View>
            <Text style={styles.rowLabel}>Photo library</Text>
            <Text style={[styles.rowValue, { color: statusColor(mediaStatus) }]}>
              {statusLabel(mediaStatus)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.openSettingsBtn, Shadows.card]}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.7}
        >
          <Text style={styles.openSettingsText}>Open device settings</Text>
          <ForwardChevron color={Colors.accent} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Connected apps</Text>
        <View style={[styles.card, Shadows.card]}>
          {connectedApps.map(([app, connected], i) => (
            <View
              key={app}
              style={[styles.row, i < connectedApps.length - 1 && styles.rowBorder]}
            >
              <View style={[styles.iconTile, { backgroundColor: connected ? Colors.online : Colors.switchOff }]}>
                <View style={styles.iconDot} />
              </View>
              <Text style={styles.rowLabel}>{app}</Text>
              <Text style={[styles.rowValue, { color: connected ? Colors.online : Colors.muted }]}>
                {connected ? 'Connected' : 'Not connected'}
              </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#fff' },
  rowLabel: { flex: 1, fontSize: 15.5, fontWeight: '600', color: Colors.ink },
  rowValue: { fontSize: 14, fontWeight: '500', marginRight: 4 },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  openSettingsText: { fontSize: 15, fontWeight: '650', color: Colors.accent },
});
