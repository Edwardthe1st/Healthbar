import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Shadows, Radius } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
}

export function Card({ children, style, radius = Radius.card }: CardProps) {
  return (
    <View style={[styles.card, Shadows.card, { borderRadius: radius }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
});
