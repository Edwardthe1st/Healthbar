import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { Colors, Shadows } from '@/constants/theme';
import { SearchIcon, BarcodeIcon, CloseIcon, CheckIcon, SmallPlusIcon } from '@/components/icons/Icons';
import { FOODS } from '@/constants/data';
import type { SearchFood } from '@/services/openfoodfacts';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export default function SearchScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { query, setQuery, results, isLoading, error, clearSearch, searchByBarcode } = useFoodSearch();

  const meal = state.meal;

  // Local selection state: Map<id, { kcal }>
  const [selected, setSelected] = useState<Map<string, { kcal: number }>>(new Map());

  // Pick up barcode from scanner via shared context
  const pendingBarcode = state.pendingBarcode;
  useFocusEffect(useCallback(() => {
    if (pendingBarcode) {
      dispatch({ type: 'SET_PENDING_BARCODE', payload: null });
      searchByBarcode(pendingBarcode);
    }
  }, [pendingBarcode, searchByBarcode, dispatch]));

  const toggleItem = useCallback((id: string, kcal: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { kcal });
      return next;
    });
  }, []);

  const selectedCount = selected.size;
  const totalKcal = Array.from(selected.values()).reduce((sum, v) => sum + v.kcal, 0);

  // Determine what to show
  const hasQuery = query.length >= 2;
  const showRecent = !hasQuery;

  const handleBarcode = () => {
    router.push('/scanner');
  };

  // Render a food row (shared between recent and API results)
  const renderFoodRow = (
    id: string,
    name: string,
    subtitle: string,
    kcal: number,
    imageUrl: string | null,
    index: number,
  ) => {
    const isSelected = selected.has(id);
    return (
      <React.Fragment key={id}>
        {index > 0 && <View style={styles.divider} />}
        <View style={styles.foodRow}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnail} />
          )}
          <View style={styles.foodInfo}>
            <Text style={styles.foodName} numberOfLines={1}>{name}</Text>
            <Text style={styles.foodSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.kcalContainer}>
            <Text style={styles.kcalValue}>{kcal}</Text>
            <Text style={styles.kcalLabel}>kcal</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleCircle, isSelected ? styles.toggleSelected : styles.toggleUnselected]}
            onPress={() => toggleItem(id, kcal)}
          >
            {isSelected ? (
              <CheckIcon size={14} color="#fff" />
            ) : (
              <SmallPlusIcon size={14} color={Colors.accent} />
            )}
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  };

  // Build the results section
  const renderResults = () => {
    if (showRecent) {
      return (
        <>
          <Text style={styles.sectionLabel}>Recent foods</Text>
          <View style={styles.resultsCard}>
            {FOODS.map((food, index) =>
              renderFoodRow(
                String(food.id),
                food.name,
                `${food.serving} · ${food.protein}g protein`,
                food.kcal,
                null,
                index,
              ),
            )}
          </View>
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <Text style={styles.sectionLabel}>Searching...</Text>
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={[styles.emptySubtitle, { marginTop: 10 }]}>
              Looking up foods...
            </Text>
          </View>
        </>
      );
    }

    if (error) {
      return (
        <>
          <Text style={styles.sectionLabel}>Error</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        </>
      );
    }

    if (results.length === 0) {
      return (
        <>
          <Text style={styles.sectionLabel}>0 matches</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No foods match</Text>
            <Text style={styles.emptySubtitle}>Try another name, or create it yourself.</Text>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={styles.sectionLabel}>{results.length} matches</Text>
        <View style={styles.resultsCard}>
          {results.map((food: SearchFood, index: number) =>
            renderFoodRow(
              food.code,
              food.brand ? `${food.name} — ${food.brand}` : food.name,
              `${food.serving} · ${food.protein}g protein`,
              food.kcal,
              food.imageUrl,
              index,
            ),
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.screen}>
      {/* ── Top area ── */}
      <View style={styles.topArea}>
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Add food</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Search field row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <SearchIcon size={15} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods…"
              placeholderTextColor={Colors.placeholder}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <CloseIcon size={8} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.barcodeButton} onPress={handleBarcode}>
            <BarcodeIcon size={22} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Meal chips row */}
        <View style={styles.mealRow}>
          {MEALS.map((m) => {
            const active = meal === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.mealChip, active ? styles.mealChipActive : styles.mealChipInactive]}
                onPress={() => dispatch({ type: 'SET_MEAL', payload: m })}
              >
                <Text style={[styles.mealChipText, active ? styles.mealChipTextActive : styles.mealChipTextInactive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Results ── */}
      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent} keyboardShouldPersistTaps="handled">
        {renderResults()}

        {/* Create custom food CTA */}
        <TouchableOpacity style={styles.createCta} onPress={() => router.push('/create')}>
          <View style={styles.createCtaCircle}>
            <SmallPlusIcon size={14} color={Colors.accent} />
          </View>
          <View style={styles.createCtaText}>
            <Text style={styles.createCtaTitle}>Create a custom food</Text>
            <Text style={styles.createCtaSubtitle}>Add your own dish & macros</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          {selectedCount > 0 ? (
            <>
              <Text style={styles.bottomKcal}>{totalKcal} kcal</Text>
              <Text style={styles.bottomItems}>{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</Text>
            </>
          ) : (
            <Text style={styles.bottomPlaceholder}>Select foods to log</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, selectedCount > 0 ? styles.addButtonEnabled : styles.addButtonDisabled]}
          onPress={() => { if (selectedCount > 0) router.back(); }}
          activeOpacity={selectedCount > 0 ? 0.7 : 1}
        >
          <Text style={[styles.addButtonText, selectedCount > 0 ? styles.addButtonTextEnabled : styles.addButtonTextDisabled]}>
            Add to {meal}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f6f7',
    flexDirection: 'column',
  },

  /* ── Top area ── */
  topArea: {
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  grabber: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.02 * 26,
    color: Colors.ink,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },

  /* Search */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4ecee',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.ink,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardSmall,
  },

  /* Meal chips */
  mealRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  mealChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 13,
    alignItems: 'center',
  },
  mealChipActive: {
    backgroundColor: Colors.accent,
  },
  mealChipInactive: {
    backgroundColor: '#fff',
    ...Shadows.cardSmall,
  },
  mealChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mealChipTextActive: {
    color: '#fff',
  },
  mealChipTextInactive: {
    color: Colors.muted,
  },

  /* ── Results ── */
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05 * 12.5,
    color: Colors.muted,
    marginHorizontal: 16,
    marginBottom: 10,
  },

  /* Results card */
  resultsCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    ...Shadows.card,
    overflow: 'hidden',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.track,
  },
  foodInfo: {
    flex: 1,
    gap: 2,
  },
  foodName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  foodSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
  },
  kcalContainer: {
    alignItems: 'flex-end',
  },
  kcalValue: {
    fontSize: 15,
    fontWeight: '650',
    color: Colors.ink,
  },
  kcalLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
  },
  toggleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleSelected: {
    backgroundColor: Colors.accent,
  },
  toggleUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(46,140,158,0.4)',
  },

  /* Empty state */
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    ...Shadows.card,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
  },

  /* Create CTA */
  createCta: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(46,140,158,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  createCtaCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46,140,158,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCtaText: {
    flex: 1,
    gap: 2,
  },
  createCtaTitle: {
    fontSize: 14.5,
    fontWeight: '650',
    color: Colors.accent,
  },
  createCtaSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
  },

  /* ── Bottom bar ── */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 13,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomKcal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  bottomItems: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
  },
  bottomPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },
  addButton: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  addButtonEnabled: {
    backgroundColor: Colors.accent,
    ...Shadows.button,
  },
  addButtonDisabled: {
    backgroundColor: Colors.chipBg,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '650',
  },
  addButtonTextEnabled: {
    color: '#fff',
  },
  addButtonTextDisabled: {
    color: Colors.muted,
  },
});
