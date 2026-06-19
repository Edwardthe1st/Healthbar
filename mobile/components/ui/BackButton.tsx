import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BackChevron } from '@/components/icons/Icons';
import { Colors } from '@/constants/theme';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress || (() => router.back())}
      activeOpacity={0.7}
    >
      <BackChevron />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
