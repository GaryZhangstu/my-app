import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#F8F6F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F0EDE8',
    textSecondary: '#6B7280',
  },
  dark: {
    text: '#F5F0EB',
    background: '#0F1419',
    backgroundElement: '#1C2530',
    backgroundSelected: '#253344',
    textSecondary: '#8B95A5',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'ui-rounded',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BrandColors = {
  cosmetic: '#FF7EB3',
  cosmeticLight: '#FFB3D1',
  supplement: '#5B9BD5',
  supplementLight: '#8DBDE8',
  success: '#2ECC71',
  successLight: '#6EE7A0',
  warning: '#F39C12',
  accent: '#6C63FF',
  accentLight: '#9D97FF',
} as const;

export const Gradients = {
  cosmetic: ['#FF7EB3', '#FF5C8A'],
  supplement: ['#5B9BD5', '#3A7BC8'],
  success: ['#2ECC71', '#27AE60'],
  card: ['#1C2530', '#253344'],
  cardCosmetic: ['#2A1F2D', '#1C2530'],
  cardSupplement: ['#1F2A35', '#1C2530'],
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
