export const Colors = {
  accent: '#2E8C9E',
  ink: '#172223',
  muted: '#69767a',
  bg: '#f1f6f7',
  card: '#ffffff',
  track: '#dce8ea',
  danger: '#C8483C',
  online: '#4CAF50',
  accentSoft: 'rgba(46,140,158,0.08)',
  accentLight: 'rgba(46,140,158,0.12)',
  accentMedium: 'rgba(46,140,158,0.16)',
  accentBorder: 'rgba(46,140,158,0.18)',
  accentShadow: 'rgba(46,140,158,0.38)',
  divider: 'rgba(0,0,0,0.05)',
  tabBorder: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(20,30,32,0.32)',
  overlayDark: 'rgba(20,30,32,0.4)',
  switchOff: '#d3dbdd',
  inputBg: '#e4ecee',
  chipBg: '#eaeff0',
  placeholder: '#9aa6a8',
  chevron: '#a8b4b7',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 13,
    elevation: 3,
  },
  cardSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Radius = {
  card: 24,
  cardLarge: 28,
  cardSmall: 20,
  pill: 999,
  chip: 13,
  button: 16,
  thumbnail: 13,
  icon: 9,
  input: 14,
  sheet: 28,
};

export const Spacing = {
  screenH: 16,
  sectionH: 22,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
};

export const Typography = {
  screenTitle: {
    fontSize: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    color: Colors.ink,
  },
  greeting: {
    fontSize: 23,
    fontWeight: '650' as const,
    letterSpacing: -0.46,
    color: Colors.ink,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '600' as const,
    letterSpacing: 0.69,
    textTransform: 'uppercase' as const,
    color: Colors.muted,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '600' as const,
    color: Colors.ink,
  },
  bigNumber: {
    fontSize: 46,
    fontWeight: '700' as const,
    letterSpacing: -1.38,
    color: Colors.ink,
  },
  body: {
    fontSize: 14.5,
    fontWeight: '500' as const,
    color: Colors.ink,
  },
  bodySmall: {
    fontSize: 12.5,
    fontWeight: '500' as const,
    color: Colors.muted,
  },
  headerCenter: {
    fontSize: 17,
    fontWeight: '650' as const,
    color: Colors.ink,
  },
};
