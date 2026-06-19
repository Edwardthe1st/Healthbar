import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  percent: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
}

export function ProgressBar({
  percent,
  height = 16,
  trackColor = Colors.track,
  fillColor = Colors.accent,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: {
    borderRadius: 999,
  },
});
