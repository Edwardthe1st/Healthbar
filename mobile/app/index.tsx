import { Redirect } from 'expo-router';
import { useUserStore } from '../store/userStore';

/**
 * Root index — redirects immediately based on auth state.
 * Expo Router renders this first before the layout effect fires.
 */
export default function Index() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated());
  return <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/login'} />;
}
