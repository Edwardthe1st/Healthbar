import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface FoodRowProps {
  name: string;
  subtitle: string;
  kcal: number;
  isLast?: boolean;
  right?: React.ReactNode;
  thumbnailSize?: number;
}

export function FoodRow({ name, subtitle, kcal, isLast, right, thumbnailSize = 46 }: FoodRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.border]}>
      <View style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.kcalContainer}>
        <Text style={styles.kcal}>{kcal}</Text>
        {thumbnailSize >= 46 ? null : <Text style={styles.kcalUnit}>kcal</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  thumbnail: {
    borderRadius: 13,
    backgroundColor: Colors.track,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 3,
  },
  kcal: {
    fontSize: 15,
    fontWeight: '650',
    color: Colors.ink,
  },
  kcalContainer: {
    alignItems: 'flex-end',
    marginRight: 2,
  },
  kcalUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 1,
  },
});
