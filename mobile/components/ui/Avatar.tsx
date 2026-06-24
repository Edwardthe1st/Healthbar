import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { getInitials } from '@/utils/helpers';

interface AvatarProps {
  size: number;
  name: string;
  avatarUri?: string;
}

export function Avatar({ size, name, avatarUri }: AvatarProps) {
  const fontSize = size * 0.33;

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri, cache: 'reload' }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: 'rgba(46,140,158,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: Colors.accent,
  },
});
