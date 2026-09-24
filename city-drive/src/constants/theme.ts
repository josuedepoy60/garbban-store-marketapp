import type { TextStyle } from 'react-native';

// Palette « jeune et réaliste » : orange taxi d'Abidjan pour l'action, jaune soleil,
// vert, bleu et rose en accents, sur des fonds blancs et gris neutres.
export const colors = {
  primary: '#E8590C',
  primaryContainer: '#FF7A1A',
  primaryFixed: '#FFE8D6',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#FFE0C7',

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
  violetSoft: '#FFF1E6',
  violetMist: '#FFF8F2',
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
  soft: '0px 8px 24px -4px rgba(17, 24, 39, 0.08)',
  card: '0px 8px 24px -6px rgba(17, 24, 39, 0.10)',
  float: '0px 14px 32px -6px rgba(22, 19, 43, 0.14)',
  sheet: '0px -12px 36px rgba(22, 19, 43, 0.08)',
  primary: '0px 10px 22px -4px rgba(232, 89, 12, 0.35)',
  lime: '0px 12px 26px -4px rgba(255, 196, 0, 0.45)',
};
