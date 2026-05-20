import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserStore } from '../store/userStore';

/**
 * Root layout.
 * Protects all routes under (tabs) behind authentication.
 * Unauthenticated users are redirected to /login.
 */
export default function RootLayout() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated());
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';
    const onLogin = segments[0] === 'login';

    if (!isAuthenticated && inTabsGroup) {
      router.replace('/login');
    } else if (isAuthenticated && (onLogin || segments.length === 0)) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
