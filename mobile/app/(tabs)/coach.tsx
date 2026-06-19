import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, Shadows } from '@/constants/theme';
import { SendIcon, BackChevron } from '@/components/icons/Icons';
import { COACH_SUGGESTIONS } from '@/constants/data';
import { coachFallback } from '@/utils/helpers';

/* ── tiny avatar bars (reusable) ─────────────────────────────── */

function AvatarBars({
  size,
  barWidth,
  heights,
  gap,
  paddingBottom,
  borderRadius,
}: {
  size: number;
  barWidth: number;
  heights: [number, number, number];
  gap: number;
  paddingBottom: number;
  borderRadius: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        gap,
        paddingBottom,
      }}
    >
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            width: barWidth,
            height: h,
            backgroundColor: '#fff',
            borderRadius,
          }}
        />
      ))}
    </View>
  );
}

/* ── typing dots ─────────────────────────────────────────────── */

function TypingDots() {
  const anims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingRow}>
      <AvatarBars
        size={28}
        barWidth={2.5}
        heights={[5, 10, 7]}
        gap={3}
        paddingBottom={9}
        borderRadius={2}
      />
      <View style={[styles.botBubble, styles.typingBubble]}>
        {anims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1],
                }),
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/* ── main screen ─────────────────────────────────────────────── */

export default function CoachScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  const { messages, coachInput, typing } = state;

  /* auto-scroll on new messages */
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  /* send handler */
  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    dispatch({ type: 'SEND_MESSAGE', payload: trimmed });
    setTimeout(() => {
      dispatch({ type: 'ADD_BOT_MESSAGE', payload: coachFallback(trimmed) });
    }, 1500);
  };

  const canSend = coachInput.trim().length > 0 && !typing;

  return (
    <View style={styles.root}>
      {/* ── header ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <BackChevron size={11} />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          <AvatarBars
            size={40}
            barWidth={3}
            heights={[7, 14, 10]}
            gap={3}
            paddingBottom={13}
            borderRadius={2}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Healthbar Coach</Text>
          <Text style={styles.headerSub}>
            Nutrition assistant · Online
          </Text>
        </View>
      </View>

      {/* ── messages ────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* context strip */}
        <View style={styles.contextRow}>
          <View style={styles.contextPill}>
            <View style={styles.contextDot} />
            <Text style={styles.contextText}>
              Today · 1,240 kcal left · 84g protein
            </Text>
          </View>
        </View>

        {/* message list */}
        {messages.map((msg, i) =>
          msg.role === 'bot' ? (
            <View key={i} style={styles.botRow}>
              <AvatarBars
                size={28}
                barWidth={2.5}
                heights={[5, 10, 7]}
                gap={3}
                paddingBottom={9}
                borderRadius={2}
              />
              <View style={[styles.botBubble, Shadows.cardSmall]}>
                <Text style={styles.botText}>{msg.text}</Text>
              </View>
            </View>
          ) : (
            <View key={i} style={styles.userRow}>
              <View style={[styles.userBubble, { shadowColor: Colors.accentShadow }]}>
                <Text style={styles.userText}>{msg.text}</Text>
              </View>
            </View>
          ),
        )}

        {/* typing indicator */}
        {typing && <TypingDots />}

        {/* suggestion chips */}
        {messages.length <= 1 && !typing && (
          <View style={styles.suggestionsWrap}>
            {COACH_SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                activeOpacity={0.7}
                onPress={() => handleSend(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── input bar ───────────────────────────────────────── */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={coachInput}
            onChangeText={(t) =>
              dispatch({ type: 'SET_COACH_INPUT', payload: t })
            }
            placeholder="Ask your coach..."
            placeholderTextColor={Colors.placeholder}
            returnKeyType="send"
            onSubmitEditing={() => handleSend(coachInput)}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: canSend ? Colors.accent : Colors.chipBg },
            ]}
            activeOpacity={0.7}
            onPress={() => handleSend(coachInput)}
            disabled={!canSend}
          >
            <SendIcon size={18} color={canSend ? '#fff' : Colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ── styles ───────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    ...Shadows.cardSmall,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: Colors.ink,
  },
  headerSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 1,
  },

  /* messages */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },

  /* context strip */
  contextRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 7,
  },
  contextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },

  /* bot message */
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '85%',
    gap: 8,
  },
  botBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: Colors.ink,
    lineHeight: 20,
  },

  /* user message */
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  userText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 20,
  },

  /* typing */
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.muted,
  },

  /* suggestions */
  suggestionsWrap: {
    marginTop: 8,
    gap: 10,
  },
  suggestionChip: {
    borderWidth: 1.2,
    borderColor: Colors.accentBorder,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },

  /* input bar */
  inputBar: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 28,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chipBg,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.ink,
    paddingVertical: 11,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
