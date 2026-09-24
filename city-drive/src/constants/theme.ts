import type { TextStyle } from 'react-native';

// Palette premium : noir profond pour l'action (comme les apps de VTC haut de gamme),
// jaune soleil, vert, bleu et rose en accents, sur des fonds blancs et gris neutres.
export const colors = {
  primary: '#111827',
  primaryContainer: '#1F2937',
  primaryFixed: '#E5E7EB',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#D1D5DB',

  secondary: '#00875F',
  secondaryContainer: '#FFC400',
  onSecondaryFixed: '#1F1600',
  onSecondaryContainer: '#5C4200',

  tertiary: '#D6246E',
  tertiaryContainer: '#FF4F8B',
  tertiaryFixed: '#FFE0EC',

  surface: '#FAFAFB',
  surfaceLowest: '#ffffff',
  surfaceLow: '#F4F5F7',
  surfaceContainer: '#EEF0F3',
  surfaceHigh: '#E8EBEF',
  surfaceHighest: '#DFE3E8',

  onSurface: '#14161A',
  onSurfaceVariant: '#5B6170',
  outline: '#8A909C',
  outlineVariant: '#D5D9E0',

  // Écran « course active »
  ink: '#14161A',
  inkSoft: '#3D4350',
  violetSoft: '#F3F4F6',
  violetMist: '#F7F7F8',
  violetCard: '#F7F8FA',
  border: '#E3E6EB',

  // Accents multicolores
  blue: '#2F6BFF',
  blueSoft: '#E6EEFF',
  green: '#00A676',
  greenSoft: '#DDF7EE',
  pink: '#FF4F8B',
  pinkSoft: '#FFE0EC',
  transitYellow: '#FFB020',
  transitYellowSoft: '#FFE5B4',
  transitYellowInk: '#7A4B00',
  busSoft: '#FFF1D0',
  busInk: '#8C5E00',
  star: '#F5A300',
  success: '#22c55e',
};

export const fonts = {
  // Une seule famille (DM Sans) pour un rendu sobre ; les clés « sora » sont gardées pour compatibilité.
  sora600: 'DMSans_700Bold',
  sora700: 'DMSans_700Bold',
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
  labelLg: { fontFamily: fonts.dm700, fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  labelMd: { fontFamily: fonts.dm600, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  labelSm: { fontFamily: fonts.dm700, fontSize: 11, lineHeight: 14, letterSpacing: 0.1 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, margin: 16 };

export const shadows = {
  soft: '0px 1px 3px rgba(16, 24, 40, 0.08)',
  card: '0px 1px 3px rgba(16, 24, 40, 0.08)',
  float: '0px 2px 8px rgba(16, 24, 40, 0.12)',
  sheet: '0px -2px 10px rgba(16, 24, 40, 0.08)',
  primary: '0px 1px 2px rgba(16, 24, 40, 0.1)',
  lime: '0px 1px 2px rgba(16, 24, 40, 0.1)',
};
