import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  right?: string;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {right && <Text style={styles.right}>{right}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
  },
  title: {
    ...Typography.sectionHeader,
  },
  right: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
});
