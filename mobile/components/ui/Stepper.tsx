import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MinusIcon, StepperPlusIcon } from '@/components/icons/Icons';
import { Colors } from '@/constants/theme';

interface StepperProps {
  value: number;
  onInc: () => void;
  onDec: () => void;
  suffix?: string;
  size?: 'small' | 'large';
}

export function Stepper({ value, onInc, onDec, suffix = '', size = 'small' }: StepperProps) {
  const isLarge = size === 'large';
  const btnSize = isLarge ? 48 : 26;
  const btnRadius = btnSize / 2;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDec}
        style={[
          styles.btn,
          {
            width: btnSize,
            height: btnSize,
            borderRadius: btnRadius,
            backgroundColor: isLarge ? Colors.chipBg : Colors.card,
          },
          !isLarge && styles.btnShadow,
        ]}
        activeOpacity={0.7}
      >
        <MinusIcon size={isLarge ? 18 : 12} color={Colors.accent} />
      </TouchableOpacity>
      <Text style={[styles.value, isLarge && styles.valueLarge]}>
        {value}{suffix}
      </Text>
      <TouchableOpacity
        onPress={onInc}
        style={[
          styles.btn,
          {
            width: btnSize,
            height: btnSize,
            borderRadius: btnRadius,
            backgroundColor: isLarge ? Colors.accent : Colors.card,
          },
          !isLarge && styles.btnShadow,
          isLarge && {
            shadowColor: Colors.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.36,
            shadowRadius: 14,
            elevation: 6,
          },
        ]}
        activeOpacity={0.7}
      >
        <StepperPlusIcon size={isLarge ? 18 : 12} color={isLarge ? '#fff' : Colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(46,140,158,0.06)',
    borderRadius: 999,
    padding: 4,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    minWidth: 14,
    textAlign: 'center',
  },
  valueLarge: {
    fontSize: 18,
    minWidth: 18,
  },
});
