import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Shadows } from '@/constants/theme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { INSIGHTS_BARS } from '@/constants/data';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Last 7 days</Text>
      </View>

      {/* Calorie chart card */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Calories</Text>
          <Text style={styles.chartAvg}>avg 2,010 kcal</Text>
        </View>

        <View style={styles.chartArea}>
          {/* Goal line */}
          <View style={styles.goalLineContainer}>
            <Text style={styles.goalLabel}>goal 2,400</Text>
            <View style={styles.goalLine} />
          </View>

          {/* Bars */}
          <View style={styles.barsRow}>
            {INSIGHTS_BARS.map((bar, index) => (
              <View key={index} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: bar.height,
                      backgroundColor: bar.isToday
                        ? Colors.accent
                        : 'rgba(46,140,158,0.35)',
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Day labels */}
        <View style={styles.dayLabelsRow}>
          {INSIGHTS_BARS.map((bar, index) => (
            <Text
              key={index}
              style={[
                styles.dayLabel,
                bar.isToday && styles.dayLabelToday,
              ]}
            >
              {bar.day}
            </Text>
          ))}
        </View>
      </View>

      {/* Stat tiles */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>2,010</Text>
          <Text style={styles.statLabel}>Avg kcal</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>96g</Text>
          <Text style={styles.statLabel}>Avg protein</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>7</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* Average macros section */}
      <View style={styles.macrosSection}>
        <View style={styles.macrosHeader}>
          <Text style={styles.macrosTitle}>Average macros</Text>
          <Text style={styles.macrosSubtitle}>per day</Text>
        </View>

        <View style={styles.macrosCard}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.macroBarWrapper}>
              <ProgressBar percent={80} height={8} fillColor={Colors.accent} />
            </View>
            <Text style={styles.macroValue}>96 / 120g</Text>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.macroBarWrapper}>
              <ProgressBar
                percent={82}
                height={8}
                fillColor="rgba(46,140,158,0.55)"
              />
            </View>
            <Text style={styles.macroValue}>198 / 240g</Text>
          </View>

          {/* Fat */}
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Fat</Text>
            <View style={styles.macroBarWrapper}>
              <ProgressBar
                percent={91}
                height={8}
                fillColor="rgba(46,140,158,0.35)"
              />
            </View>
            <Text style={styles.macroValue}>64 / 70g</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f6f7',
  },
  content: {
    paddingTop: 62,
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },

  // Chart card
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 22,
    marginTop: 12,
    ...Shadows.card,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '650',
    color: Colors.ink,
  },
  chartAvg: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.muted,
  },

  // Chart area
  chartArea: {
    height: 150,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  goalLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 138,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: 3,
  },
  goalLine: {
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(46,140,158,0.35)',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'stretch',
  },
  bar: {
    borderRadius: 7,
  },

  // Day labels
  dayLabelsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  dayLabelToday: {
    color: Colors.accent,
    fontWeight: '700',
  },

  // Stat tiles
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 14,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    ...Shadows.cardSmall,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 2,
  },

  // Macros section
  macrosSection: {
    marginTop: 24,
    marginHorizontal: 22,
  },
  macrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  macrosTitle: {
    fontSize: 16,
    fontWeight: '650',
    color: Colors.ink,
  },
  macrosSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.muted,
  },
  macrosCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
    ...Shadows.card,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroLabel: {
    width: 58,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  macroBarWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  macroValue: {
    width: 62,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '650',
    color: Colors.ink,
  },
});
