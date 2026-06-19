import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackButton } from './BackButton';
import { Colors, Typography } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />
      <Text style={styles.title}>{title}</Text>
      {right || <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...Typography.headerCenter,
  },
  spacer: {
    width: 38,
  },
});
