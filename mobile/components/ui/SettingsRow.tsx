import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ForwardChevron } from '@/components/icons/Icons';
import { Colors } from '@/constants/theme';

interface SettingsRowProps {
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingsRow({ iconColor, label, value, onPress, isLast }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.border]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.icon, { backgroundColor: iconColor }]}>
        <View style={styles.dot} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {value !== undefined && (
        <Text style={styles.value}>{value}</Text>
      )}
      <ForwardChevron />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#fff',
  },
  label: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  value: {
    fontSize: 14,
    color: Colors.muted,
    marginRight: 4,
  },
});
