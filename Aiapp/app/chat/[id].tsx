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
  Image,
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
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.loaderLogo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.thinkingText}>Thinking{dots}</Text>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </Animated.View>
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
      {/* Header Bar */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          activeOpacity={0.65}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="menu" size={20} color="#666666" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.modelName}>NEXA AI 4.5</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          activeOpacity={0.65}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="bell" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Hero Section */}
        {chat.messages.length === 0 && (
          <View style={styles.hero}>
            <Image
              source={require('../../assets/logo.jpg')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.chatTitle}>How can I help you this evening?</Text>
          </View>
        )}

        {/* Messages */}
        {chat.messages.length > 0 && chat.messages.map(message => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {/* AI Loading State */}
        {aiLoading && (
          <View style={styles.aiLoadingRow}>
            <View style={styles.aiLoadingBubble}>
              <BlurryLoader />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputWrap}>
        <ChatInput onSend={handleSend} disabled={aiLoading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  menuBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1D',
    letterSpacing: -0.3,
  },
  notificationBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  heroLogo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  chatTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1D1D1D',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    maxWidth: '90%',
  },
  inputWrap: {
    paddingBottom: 4,
  },
  loaderLogo: {
    width: 24,
    height: 24,
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
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingLogo: {
    width: 50,
    height: 50,
    marginBottom: 16,
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
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  errorText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
});
