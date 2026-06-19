import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="create" />
        <Stack.Screen name="account" />
        <Stack.Screen name="editprofile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="goal-calories" />
        <Stack.Screen name="goal-macros" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="dietary" />
        <Stack.Screen name="connected" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="units" />
      </Stack>
    </AppProvider>
  );
}
