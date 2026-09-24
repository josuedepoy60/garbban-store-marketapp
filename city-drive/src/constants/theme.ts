import type { TextStyle } from 'react-native';

// Palette extraite des maquettes (tokens Material 3 « light »).
export const colors = {
  primary: '#3310b3',
  primaryContainer: '#4b36c9',
  primaryFixed: '#e4dfff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#c5beff',

  secondary: '#506600',
  secondaryContainer: '#c6f338',
  onSecondaryFixed: '#161f00',
  onSecondaryContainer: '#556d00',

  tertiary: '#780039',
  tertiaryContainer: '#991e50',
  tertiaryFixed: '#ffd9e1',

  surface: '#fcf8ff',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f7f1ff',
  surfaceContainer: '#f1ebff',
  surfaceHigh: '#ebe5ff',
  surfaceHighest: '#e5deff',

  onSurface: '#1b1831',
  onSurfaceVariant: '#474554',
  outline: '#787586',
  outlineVariant: '#c8c4d7',

  // Écran « course active »
  ink: '#1E1B4B',
  inkSoft: '#312E81',
  violetSoft: '#EDE9FE',
  violetMist: '#F6F4FF',
  violetCard: '#F8F7FF',
  border: '#E2E0EB',

  // Accents
  transitYellow: '#FFB020',
  transitYellowSoft: '#FFE5B4',
  transitYellowInk: '#7A4B00',
  busSoft: '#FFF1D0',
  busInk: '#8C5E00',
  star: '#E5A100',
  success: '#22c55e',
};

export const fonts = {
  sora600: 'Sora_600SemiBold',
  sora700: 'Sora_700Bold',
  dm400: 'DMSans_400Regular',
  dm600: 'DMSans_600SemiBold',
  dm700: 'DMSans_700Bold',
};

export const type = {
  displayLg: { fontFamily: fonts.sora700, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  headlineXl: { fontFamily: fonts.sora700, fontSize: 26, lineHeight: 34, letterSpacing: -0.26 },
  headlineLg: { fontFamily: fonts.sora600, fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineMd: { fontFamily: fonts.sora600, fontSize: 20, lineHeight: 28 },
  headlineSm: { fontFamily: fonts.sora600, fontSize: 17, lineHeight: 24 },
  currency: { fontFamily: fonts.sora700, fontSize: 28, lineHeight: 32, letterSpacing: -0.56 },
  bodyLg: { fontFamily: fonts.dm400, fontSize: 17, lineHeight: 26 },
  bodyMd: { fontFamily: fonts.dm400, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fonts.dm400, fontSize: 13, lineHeight: 18 },
  labelLg: { fontFamily: fonts.dm700, fontSize: 15, lineHeight: 20, letterSpacing: 0.15 },
  labelMd: { fontFamily: fonts.dm600, fontSize: 13, lineHeight: 18, letterSpacing: 0.26 },
  labelSm: { fontFamily: fonts.dm700, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, margin: 16 };

export const shadows = {
  soft: '0px 8px 24px -4px rgba(75, 54, 201, 0.08)',
  card: '0px 8px 24px -6px rgba(75, 54, 201, 0.10)',
  float: '0px 14px 32px -6px rgba(22, 19, 43, 0.14)',
  sheet: '0px -12px 36px rgba(22, 19, 43, 0.08)',
  primary: '0px 10px 22px -4px rgba(51, 16, 179, 0.35)',
  lime: '0px 12px 26px -4px rgba(198, 243, 56, 0.45)',
};
