import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import {
  BackChevron,
  CameraIconLarge,
  MinusIcon,
  StepperPlusIcon,
  SmallPlusIcon,
  CheckIcon,
} from '@/components/icons/Icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { INGREDIENT_POOL } from '@/constants/data';

export default function CreateScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  /* ── Nutrition computation ── */
  const totals = state.dishItems.reduce(
    (acc, item) => {
      const ing = INGREDIENT_POOL.find((i) => i.id === item.id);
      if (!ing) return acc;
      acc.kcal += ing.kcal * item.qty;
      acc.p += ing.p * item.qty;
      acc.c += ing.c * item.qty;
      acc.f += ing.f * item.qty;
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  const perServing = {
    kcal: Math.round(totals.kcal / state.servings),
    p: Math.round(totals.p / state.servings),
    c: Math.round(totals.c / state.servings),
    f: Math.round(totals.f / state.servings),
  };

  const totalMacroCal = totals.p * 4 + totals.c * 4 + totals.f * 9;
  const pPct = totalMacroCal > 0 ? (totals.p * 4) / totalMacroCal * 100 : 0;
  const cPct = totalMacroCal > 0 ? (totals.c * 4) / totalMacroCal * 100 : 0;
  const fPct = totalMacroCal > 0 ? (totals.f * 9) / totalMacroCal * 100 : 0;

  const canSave = state.dishName.trim().length > 0 && state.dishItems.length >= 1;

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New dish</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo slot */}
        <View style={styles.photoSlot}>
          <CameraIconLarge size={28} />
          <Text style={styles.photoLabel}>Add a photo</Text>
        </View>

        {/* Dish name card */}
        <View style={[styles.card, styles.nameCard, Shadows.card]}>
          <Text style={styles.sectionLabel}>DISH NAME</Text>
          <TextInput
            style={styles.nameInput}
            value={state.dishName}
            onChangeText={(t) => dispatch({ type: 'SET_DISH_NAME', payload: t })}
            placeholder="e.g. Bolognese pasta"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        {/* Servings card */}
        <View style={[styles.card, styles.servingsCard, Shadows.card]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.servingsTitle}>Servings</Text>
            <Text style={styles.servingsSub}>How many this recipe makes</Text>
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => dispatch({ type: 'SET_SERVINGS', payload: state.servings - 1 })}
            >
              <MinusIcon size={13} color={Colors.accent} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{state.servings}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => dispatch({ type: 'SET_SERVINGS', payload: state.servings + 1 })}
            >
              <StepperPlusIcon size={13} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Per-serving nutrition card */}
        <View style={[styles.nutritionCard, Shadows.card]}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.sectionLabel}>PER SERVING</Text>
            <Text style={styles.totalKcalNote}>{totals.kcal} kcal total</Text>
          </View>

          <View style={styles.bigKcalRow}>
            <Text style={styles.bigKcal}>{perServing.kcal}</Text>
            <Text style={styles.bigKcalUnit}>kcal</Text>
          </View>

          <View style={styles.macrosRow}>
            {[
              { label: 'Protein', value: perServing.p, pct: pPct, color: Colors.accent },
              { label: 'Carbs', value: perServing.c, pct: cPct, color: '#F5A623' },
              { label: 'Fat', value: perServing.f, pct: fPct, color: '#E86B6B' },
            ].map((m) => (
              <View key={m.label} style={styles.macroCol}>
                <View style={styles.macroLabelRow}>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                  <Text style={styles.macroValue}>{m.value}g</Text>
                </View>
                <ProgressBar percent={m.pct} height={6} fillColor={m.color} />
              </View>
            ))}
          </View>
        </View>

        {/* Ingredients header */}
        <View style={styles.ingredientsHeader}>
          <Text style={styles.ingredientsTitle}>Ingredients</Text>
          <Text style={styles.ingredientsCount}>
            {state.dishItems.length} item{state.dishItems.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Ingredients card or empty state */}
        {state.dishItems.length > 0 ? (
          <View style={[styles.ingredientsCard, Shadows.card]}>
            {state.dishItems.map((item, idx) => {
              const ing = INGREDIENT_POOL.find((i) => i.id === item.id);
              if (!ing) return null;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.ingredientRow,
                    idx < state.dishItems.length - 1 && styles.ingredientBorder,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    <Text style={styles.ingredientDetail}>
                      {item.qty} {'\u00D7'} {ing.unit} {'\u00B7'} {ing.kcal * item.qty} kcal
                    </Text>
                  </View>
                  <View style={styles.ingredientStepper}>
                    <TouchableOpacity
                      style={styles.ingredientStepperBtn}
                      onPress={() => dispatch({ type: 'DEC_INGREDIENT', payload: item.id })}
                    >
                      <MinusIcon size={13} color={Colors.accent} />
                    </TouchableOpacity>
                    <Text style={styles.ingredientQty}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.ingredientStepperBtn}
                      onPress={() => dispatch({ type: 'INC_INGREDIENT', payload: item.id })}
                    >
                      <StepperPlusIcon size={13} color={Colors.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No ingredients yet</Text>
            <Text style={styles.emptySub}>Add a few to calculate nutrition.</Text>
          </View>
        )}

        {/* Add ingredient CTA */}
        <TouchableOpacity
          style={styles.addIngredientCta}
          onPress={() => dispatch({ type: 'SET_SHOW_PICKER', payload: true })}
        >
          <SmallPlusIcon size={14} color={Colors.accent} />
          <Text style={styles.addIngredientLabel}>Add ingredient</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomKcal}>{perServing.kcal} kcal</Text>
          <Text style={styles.bottomSub}>Makes {state.servings} servings</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          disabled={!canSave}
          onPress={() => router.back()}
        >
          <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}>
            Save dish
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Ingredient picker modal ── */}
      <Modal visible={state.showPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBg}
            activeOpacity={1}
            onPress={() => dispatch({ type: 'SET_SHOW_PICKER', payload: false })}
          />
          <View style={styles.sheet}>
            {/* Grabber */}
            <View style={styles.grabberWrap}>
              <View style={styles.grabber} />
            </View>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add ingredient</Text>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'SET_SHOW_PICKER', payload: false })}
              >
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredient list */}
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {INGREDIENT_POOL.map((ing) => {
                const added = state.dishItems.find((d) => d.id === ing.id);
                return (
                  <TouchableOpacity
                    key={ing.id}
                    style={styles.pickerRow}
                    onPress={() => dispatch({ type: 'ADD_INGREDIENT', payload: ing.id })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerName}>{ing.name}</Text>
                      <Text style={styles.pickerDetail}>
                        {ing.unit} {'\u00B7'} {ing.kcal} kcal
                      </Text>
                    </View>
                    {added ? (
                      <View style={styles.pickerPill}>
                        <Text style={styles.pickerPillText}>{added.qty}</Text>
                      </View>
                    ) : (
                      <View style={styles.pickerAddCircle}>
                        <SmallPlusIcon size={14} color={Colors.accent} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f6f7',
    position: 'relative',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '650',
    color: Colors.ink,
  },
  headerSpacer: {
    width: 38,
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  /* Photo slot */
  photoSlot: {
    height: 138,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(46,140,158,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(46,140,158,0.04)',
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    marginTop: 8,
  },

  /* Cards (shared) */
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginBottom: 12,
  },

  /* Dish name card */
  nameCard: {
    padding: 13,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.69,
    color: Colors.muted,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 19,
    fontWeight: '650',
    color: Colors.ink,
    padding: 0,
  },

  /* Servings card */
  servingsCard: {
    padding: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  servingsSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    minWidth: 24,
    textAlign: 'center',
  },

  /* Nutrition card */
  nutritionCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalKcalNote: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.muted,
  },
  bigKcalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  bigKcal: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.32,
    color: Colors.ink,
  },
  bigKcalUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.muted,
    marginLeft: 6,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCol: {
    flex: 1,
  },
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '650',
    color: Colors.ink,
  },

  /* Ingredients header */
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '650',
    color: Colors.ink,
  },
  ingredientsCount: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
  },

  /* Ingredients card */
  ingredientsCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  ingredientBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
  },
  ingredientDetail: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },
  ingredientStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chipBg,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 6,
  },
  ingredientStepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientQty: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    minWidth: 18,
    textAlign: 'center',
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
  },

  /* Add ingredient CTA */
  addIngredientCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(46,140,158,0.28)',
    gap: 8,
    marginTop: 4,
  },
  addIngredientLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 28,
  },
  bottomKcal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  bottomSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...Shadows.button,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.chipBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '650',
    color: '#fff',
  },
  saveBtnTextDisabled: {
    color: Colors.muted,
  },

  /* Overlay / Modal */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,30,32,0.32)',
  },
  sheet: {
    backgroundColor: '#f1f6f7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '74%',
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.chipBg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink,
  },
  sheetDone: {
    fontSize: 15,
    fontWeight: '650',
    color: Colors.accent,
  },
  sheetScroll: {
    paddingHorizontal: 20,
  },

  /* Picker rows */
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  pickerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
  },
  pickerDetail: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },
  pickerPill: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pickerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  pickerAddCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
