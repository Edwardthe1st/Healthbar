import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
}

export function HomeIcon({ size = 24, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.4 12 5l8 6.4V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" fill={color} />
    </Svg>
  );
}

export function DiaryIcon({ size = 24, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="6" width="14" height="2.2" rx="1.1" fill={color} />
      <Rect x="5" y="11" width="14" height="2.2" rx="1.1" fill={color} />
      <Rect x="5" y="16" width="9" height="2.2" rx="1.1" fill={color} />
    </Svg>
  );
}

export function InsightsIcon({ size = 24, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="12" width="3.6" height="7" rx="1.4" fill={color} />
      <Rect x="10.2" y="8" width="3.6" height="11" rx="1.4" fill={color} />
      <Rect x="15.4" y="5" width="3.6" height="14" rx="1.4" fill={color} />
    </Svg>
  );
}

export function CoachIcon({ size = 24, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Rect x="9.4" y="3" width="3.2" height="16" rx="1.6" fill={color} />
      <Rect x="3" y="9.4" width="16" height="3.2" rx="1.6" fill={color} />
    </Svg>
  );
}

export function SmallPlusIcon({ size = 14, color = Colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Rect x="6" y="2.5" width="2" height="9" rx="1" fill={color} />
      <Rect x="2.5" y="6" width="9" height="2" rx="1" fill={color} />
    </Svg>
  );
}

export function MinusIcon({ size = 13, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 13 13">
      <Rect x="2" y="5.5" width="9" height="2" rx="1" fill={color} />
    </Svg>
  );
}

export function StepperPlusIcon({ size = 13, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 13 13">
      <Rect x="5.5" y="2" width="2" height="9" rx="1" fill={color} />
      <Rect x="2" y="5.5" width="9" height="2" rx="1" fill={color} />
    </Svg>
  );
}

export function BackChevron({ size = 11, color = Colors.ink }: IconProps & { size?: number }) {
  return (
    <Svg width={size} height={Math.round(size * 18 / 11)} viewBox="0 0 11 18" fill="none">
      <Path d="M9 2L2 9l7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ForwardChevron({ size = 8, color = Colors.chevron }: IconProps) {
  return (
    <Svg width={size} height={Math.round(size * 14 / 8)} viewBox="0 0 8 14" fill="none">
      <Path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SmallChevronLeft({ size = 7 }: IconProps) {
  return (
    <Svg width={size} height={12} viewBox="0 0 8 14" fill="none">
      <Path d="M7 1L1 7l6 6" stroke={Colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SmallChevronRight({ size = 7 }: IconProps) {
  return (
    <Svg width={size} height={12} viewBox="0 0 8 14" fill="none">
      <Path d="M1 1l6 6-6 6" stroke={Colors.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 17, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="2" />
      <Path d="M11.5 11.5l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function BarcodeIcon({ size = 22, color = Colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <G fill={color}>
        <Rect x="3" y="5" width="1.6" height="12" rx="0.6" />
        <Rect x="6" y="5" width="2.6" height="12" rx="0.6" />
        <Rect x="10" y="5" width="1.4" height="12" rx="0.6" />
        <Rect x="13" y="5" width="2.6" height="12" rx="0.6" />
        <Rect x="17.4" y="5" width="1.6" height="12" rx="0.6" />
      </G>
    </Svg>
  );
}

export function CloseIcon({ size = 9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Path d="M2 2l6 6M8 2l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M3 7.5l2.5 2.5L11 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CalendarIcon({ size = 20, color = Colors.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect x="3" y="4.5" width="16" height="14" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M3 8.5h16" stroke={color} strokeWidth="1.8" />
      <Rect x="6.5" y="2.5" width="1.8" height="4" rx="0.9" fill={color} />
      <Rect x="13.7" y="2.5" width="1.8" height="4" rx="0.9" fill={color} />
    </Svg>
  );
}

export function SettingsIcon({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect x="3" y="7" width="16" height="1.8" rx="0.9" fill={color} />
      <Rect x="3" y="14" width="16" height="1.8" rx="0.9" fill={color} />
      <Circle cx="8" cy="7.9" r="3" fill={Colors.card} stroke={color} strokeWidth="1.8" />
      <Circle cx="14" cy="14.9" r="3" fill={Colors.card} stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

export function CameraIcon({ size = 15, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Rect x="2" y="7" width="22" height="14" rx="4" stroke={color} strokeWidth="2" />
      <Circle cx="13" cy="14" r="3.5" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function CameraIconLarge({ size = 28, color = Colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Rect x="2" y="6" width="22" height="15" rx="4" stroke={color} strokeWidth="1.8" />
      <Circle cx="13" cy="13.5" r="4" stroke={color} strokeWidth="1.8" />
      <Rect x="9" y="3.5" width="8" height="3.4" rx="1.5" fill={color} />
    </Svg>
  );
}

export function TrashIcon({ size = 22, color = Colors.danger }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M10 7V5h4v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SendIcon({ size = 18, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 15V3M9 3l-5 5M9 3l5 5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 14, color = Colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M3 7h8M7 3l4 4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LargeMinusIcon({ size = 18, color = Colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x="3" y="8" width="12" height="2.4" rx="1.2" fill={color} />
    </Svg>
  );
}

export function LargePlusIcon({ size = 18, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x="7.8" y="3" width="2.4" height="12" rx="1.2" fill={color} />
      <Rect x="3" y="8" width="12" height="2.4" rx="1.2" fill={color} />
    </Svg>
  );
}

export function EmailIcon({ size = 19, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="2.5" y="4.5" width="15" height="11" rx="2.5" stroke={color} strokeWidth="1.7" />
      <Path d="M3.5 6l6.5 4.5L16.5 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AppleIcon({ size = 17 }: IconProps) {
  return (
    <Svg width={size} height={20} viewBox="0 0 17 20" fill="#fff">
      <Path d="M14.1 10.6c0-2 1.6-3 1.7-3.1-0.9-1.4-2.4-1.5-2.9-1.6-1.2-0.1-2.4 0.7-3 0.7-0.6 0-1.6-0.7-2.6-0.7-1.3 0-2.6 0.8-3.3 2-1.4 2.4-0.4 6 1 8 0.7 1 1.5 2.1 2.5 2 1-0.04 1.4-0.6 2.6-0.6 1.2 0 1.5 0.6 2.6 0.6 1.1-0.02 1.8-1 2.4-2 0.8-1.1 1.1-2.2 1.1-2.3-0.02-0.01-2.1-0.8-2.1-3.2zM12.2 4.6c0.5-0.7 0.9-1.6 0.8-2.6-0.8 0.03-1.7 0.5-2.3 1.2-0.5 0.6-0.9 1.5-0.8 2.5 0.9 0.07 1.7-0.4 2.3-1.1z" />
    </Svg>
  );
}

export function GoogleIcon({ size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M17.6 9.2c0-0.6-0.05-1.2-0.15-1.7H9v3.3h4.8c-0.2 1.1-0.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" fill="#4285F4" />
      <Path d="M9 18c2.4 0 4.5-0.8 6-2.2l-2.9-2.2c-0.8 0.5-1.8 0.9-3.1 0.9-2.4 0-4.4-1.6-5.1-3.8H0.9v2.3C2.4 16 5.5 18 9 18z" fill="#34A853" />
      <Path d="M3.9 10.7c-0.2-0.5-0.3-1.1-0.3-1.7s0.1-1.2 0.3-1.7V5H0.9C0.3 6.2 0 7.5 0 9s0.3 2.8 0.9 4l3-2.3z" fill="#FBBC05" />
      <Path d="M9 3.6c1.3 0 2.5 0.5 3.4 1.3l2.6-2.6C13.5 0.9 11.4 0 9 0 5.5 0 2.4 2 0.9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6z" fill="#EA4335" />
    </Svg>
  );
}

export function HealthbarMark({ size = 'small' }: { size?: 'small' | 'large' }) {
  const w = size === 'large' ? 62 : 40;
  const barW = size === 'large' ? 5 : 3;
  const gap = size === 'large' ? 5 : 3;
  const heights = size === 'large' ? [11, 22, 16] : [7, 14, 10];
  const pb = size === 'large' ? 18 : 13;
  const br = size === 'large' ? 3 : 2;

  return { width: w, barWidth: barW, gap, heights, paddingBottom: pb, borderRadius: br };
}
