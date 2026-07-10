import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ChatInput from '@/components/app/ChatInput';
import NexaLogo from '@/components/app/NexaLogo';
import ChatMessageBubble from '@/components/app/ChatMessageBubble';
import { useChat } from '@/state/ChatProvider';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { chats, sendMessage } = useChat();
  const [chat, setChat] = useState<import('@/state/ChatProvider').ChatThread | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      setError(true);
      setInitialLoading(false);
      return;
    }

    // Try to find chat immediately
    const foundChat = chats.find(c => c.id === id);
    if (foundChat) {
      setChat(foundChat);
      setInitialLoading(false);
      return;
    }

    // If not found immediately, set a timeout to check again
    // This handles potential timing issues with state updates
    const timer = setTimeout(() => {
      const foundChat = chats.find(c => c.id === id);
      if (foundChat) {
        setChat(foundChat);
        setInitialLoading(false);
      } else {
        setError(true);
        setInitialLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chats, id]);

  const handleSend = async (text: string) => {
    if (!id || !chat) return;
    setAiLoading(true);
    try {
      await sendMessage({ chatId: id, text });
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setAiLoading(false);
    }
  };

  const BlurryLoader = () => {
    const pulseAnim = useRef(new Animated.Value(0.5)).current;
    const dotsAnim = useRef(new Animated.Value(0)).current;
    const [dots, setDots] = useState('');

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      loop.start();

      const dotsLoop = Animated.loop(
        Animated.timing(dotsAnim, { toValue: 3, duration: 1200, easing: Easing.linear, useNativeDriver: false })
      );
      dotsLoop.start();

      const listenerId = dotsAnim.addListener(({ value }) => {
        setDots('.'.repeat(Math.floor(value % 4)));
      });

      return () => {
        loop.stop();
        dotsLoop.stop();
        dotsAnim.removeListener(listenerId);
      };
    }, [pulseAnim, dotsAnim]);

    return (
      <View style={styles.orbLoaderRow}>
        <Animated.View style={{ opacity: pulseAnim, transform: [{ scale: pulseAnim }] }}>
          <NexaLogo size="sm" layout="horizontal" theme="light" />
        </Animated.View>
        <Text style={styles.thinkingText}>Thinking{dots}</Text>
      </View>
    );
  };

  const SpinningLoader = () => {
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
      );
      loop.start();
      return () => loop.stop();
    }, [spin]);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Feather name="loader" size={32} color="#D97757" />
      </Animated.View>
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SpinningLoader />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  if (!chat || error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color="#D97757" />
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableOpacity
        style={[styles.menuBtn, { top: Math.max(insets.top + 4, 20) }]}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        activeOpacity={0.65}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="menu" size={22} color="#666666" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <NexaLogo size="md" layout="vertical" theme="light" />
          <Text style={styles.chatTitle} numberOfLines={2}>{chat.title}</Text>
          <Text style={styles.chatSub}>Your conversation is ready.</Text>
        </View>

        {chat.messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ask your first question</Text>
            <Text style={styles.emptyText}>NEXA AI will answer here with clear, formatted text.</Text>
          </View>
        ) : (
          chat.messages.map(message => <ChatMessageBubble key={message.id} message={message} />)
        )}

        {aiLoading && (
          <View style={styles.aiLoadingRow}>
            <View style={styles.aiLoadingBubble}>
              <BlurryLoader />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputWrap}>
        <ChatInput onSend={handleSend} disabled={aiLoading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  menuBtn: {
    position: 'absolute',
    left: 18,
    zIndex: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 84,
    paddingBottom: 18,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chatTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1D',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.4,
    maxWidth: '88%',
  },
  chatSub: {
    marginTop: 10,
    fontSize: 13,
    color: 'rgba(0,0,0,0.42)',
    fontWeight: '400',
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#1D1D1D',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  inputWrap: {
    paddingBottom: 4,
  },
  orbLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thinkingText: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 13,
    fontWeight: '500',
  },
  aiLoadingRow: {
    alignItems: 'flex-start',
    marginVertical: 8,
    width: '100%',
  },
  aiLoadingBubble: {
    maxWidth: '86%',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderBottomLeftRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
    gap: 12,
  },
  errorText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
});
