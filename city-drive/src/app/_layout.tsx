import { DMSans_400Regular, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

export default function RootLayout() {
  const [loaded] = useFonts({ Sora_600SemiBold, Sora_700Bold, DMSans_400Regular, DMSans_600SemiBold, DMSans_700Bold });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="arrets" />
        <Stack.Screen name="vehicules" />
        <Stack.Screen name="programmer" options={{ presentation: 'modal' }} />
        <Stack.Screen name="course" />
      </Stack>
    </SafeAreaProvider>
  );
}
