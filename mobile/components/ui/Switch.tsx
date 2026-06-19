import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/theme';

interface SwitchProps {
  value: boolean;
  onToggle: () => void;
}

export function Switch({ value, onToggle }: SwitchProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.track, { backgroundColor: value ? Colors.accent : Colors.switchOff }]}
    >
      <View
        style={[
          styles.knob,
          { transform: [{ translateX: value ? 18 : 0 }] },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 999,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
