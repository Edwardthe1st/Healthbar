import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { HomeIcon, DiaryIcon, InsightsIcon, CoachIcon, PlusIcon } from '@/components/icons/Icons';
import { Colors, Shadows } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} onPlusPress={() => router.push('/search')} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="diary" options={{ title: 'Diary' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="coach" options={{ title: 'Coach' }} />
    </Tabs>
  );
}

function CustomTabBar({ state, navigation, onPlusPress }: any) {
  const tabs = [
    { key: 'index', label: 'Home', Icon: HomeIcon },
    { key: 'diary', label: 'Diary', Icon: DiaryIcon },
    { key: 'plus', label: '+', Icon: PlusIcon },
    { key: 'insights', label: 'Insights', Icon: InsightsIcon },
    { key: 'coach', label: 'Coach', Icon: CoachIcon },
  ];

  const routeIndex = state.index;
  const routeNames = state.routes.map((r: any) => r.name);

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        if (tab.key === 'plus') {
          return (
            <TouchableOpacity
              key="plus"
              style={styles.plusBtn}
              onPress={onPlusPress}
              activeOpacity={0.8}
            >
              <PlusIcon />
            </TouchableOpacity>
          );
        }

        const idx = routeNames.indexOf(tab.key);
        const isActive = idx === routeIndex;
        const color = isActive ? Colors.accent : Colors.muted;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.key)}
            activeOpacity={0.7}
          >
            <tab.Icon color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 11,
    paddingBottom: 28,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBorder,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  plusBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 8,
  },
});
