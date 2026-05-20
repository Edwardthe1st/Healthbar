import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessage, Message } from '../../services/assistantService';

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN      = '#22C55E';
const GREEN_SOFT = '#D1FAE5';
const GRAY_BG    = '#F3F4F6';
const DARK       = '#111827';
const MID        = '#6B7280';
const BORDER     = '#F3F4F6';

const WELCOME: Message = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis **NutriBot**.\n" +
    "Je peux t'aider à choisir tes repas, vérifier tes apports " +
    "ou répondre à tes questions nutritionnelles. Comment puis-je t'aider ?",
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

/**
 * Renders an inline string that may contain **bold** or *italic* markers.
 */
function InlineText({ text, baseStyle }: { text: string; baseStyle: object }) {
  // Split on **bold** or *italic* tokens
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: '700' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <Text key={i} style={{ fontStyle: 'italic' }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

/**
 * Renders a bot message with support for:
 *  - ## headings
 *  - * / - bullet lists
 *  - **bold** and *italic* inline
 *  - blank-line paragraph spacing
 */
function BotContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === '') {
      // Blank line → small spacer between paragraphs
      elements.push(<View key={key++} style={{ height: 6 }} />);
      continue;
    }

    // ## Heading
    if (/^#{1,3}\s/.test(trimmed)) {
      const text = trimmed.replace(/^#{1,3}\s/, '');
      elements.push(
        <Text key={key++} style={md.heading}>
          {text}
        </Text>,
      );
      continue;
    }

    // Bullet point  (* or -)
    if (/^[\*\-]\s/.test(trimmed)) {
      const text = trimmed.replace(/^[\*\-]\s/, '');
      elements.push(
        <View key={key++} style={md.bulletRow}>
          <Text style={md.bullet}>•</Text>
          <InlineText text={text} baseStyle={md.bulletText} />
        </View>,
      );
      continue;
    }

    // Numbered list  (1. 2. …)
    if (/^\d+\.\s/.test(trimmed)) {
      const num   = trimmed.match(/^(\d+)\./)?.[1] ?? '•';
      const text  = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <View key={key++} style={md.bulletRow}>
          <Text style={md.bullet}>{num}.</Text>
          <InlineText text={text} baseStyle={md.bulletText} />
        </View>,
      );
      continue;
    }

    // Plain paragraph
    elements.push(<InlineText key={key++} text={trimmed} baseStyle={md.para} />);
  }

  return <View>{elements}</View>;
}

const md = StyleSheet.create({
  heading:    { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 4 },
  para:       { fontSize: 15, lineHeight: 22, color: DARK },
  bulletRow:  { flexDirection: 'row', gap: 6, marginVertical: 2 },
  bullet:     { fontSize: 15, lineHeight: 22, color: GREEN, fontWeight: '700', minWidth: 14 },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 22, color: DARK },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AssistantScreen() {
  const [messages, setMessages]     = useState<Message[]>([WELCOME]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendMessage(next);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, je n'arrive pas à répondre pour l'instant. Réessaie dans un moment. 🤖",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.wrapRight : styles.wrapLeft]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="leaf" size={13} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {isUser ? (
            <Text style={styles.textUser}>{item.content}</Text>
          ) : (
            <BotContent content={item.content} />
          )}
        </View>
      </View>
    );
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Ionicons name="leaf" size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>NutriBot</Text>
          <Text style={styles.headerSub}>Assistant nutritionnel</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing indicator */}
        {isLoading && (
          <View style={styles.typingRow}>
            <View style={styles.avatar}>
              <Ionicons name="leaf" size={13} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={GREEN} />
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question…"
            placeholderTextColor={MID}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.75}
          >
            <Ionicons name="send" size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#fff',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: DARK },
  headerSub:   { fontSize: 12, color: MID },

  list: { padding: 14, paddingBottom: 6, gap: 8 },

  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginVertical: 2,
  },
  wrapLeft:  { justifyContent: 'flex-start' },
  wrapRight: { justifyContent: 'flex-end' },

  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleUser: { backgroundColor: GREEN,   borderBottomRightRadius: 4 },
  bubbleBot:  { backgroundColor: GRAY_BG, borderBottomLeftRadius:  4 },

  textUser: { fontSize: 15, lineHeight: 22, color: '#fff' },

  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  typingBubble: {
    backgroundColor: GRAY_BG,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: GRAY_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: DARK,
    maxHeight: 120,
  },
  sendBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { backgroundColor: GREEN_SOFT },
});
