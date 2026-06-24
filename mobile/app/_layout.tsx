import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (session && !isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (session && isOnboarded && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, isOnboarded, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <StripeProvider publishableKey={STRIPE_KEY}>
        <StatusBar style="dark" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)/index" options={{ animation: 'fade' }} />
            <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
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
            <Stack.Screen name="confidentiality" />
            <Stack.Screen name="permissions" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="bank-account" />
          </Stack>
        </AuthGate>
        </StripeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
