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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ChatInput from '@/components/app/ChatInput';
import NexaLogo from '@/components/app/NexaLogo';
import ChatMessageBubble from '@/components/app/ChatMessageBubble';
import { useChat } from '@/state/ChatProvider';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const { chats, sendMessage, startNewChat } = useChat();
  const [aiLoading, setAiLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const currentChat = chats.length > 0 ? chats[0] : null;

  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [currentChat]);

  const handleSend = async (text: string) => {
    try {
      setShowWelcome(false);
      setAiLoading(true);
      await sendMessage({ text });
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      console.error('Send message error:', error);
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
            source={require('../assets/logo.jpg')}
            style={styles.loaderLogo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.thinkingText}>Thinking{dots}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          activeOpacity={0.65}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="menu" size={22} color="#666666" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require('../assets/logo.jpg')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>NEXA AI 4.5</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="bell" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {showWelcome && !currentChat ? (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/logo.jpg')}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeHeadline}>
              How can I help you this evening?
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {currentChat && currentChat.messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Image
                source={require('../assets/logo.jpg')}
                style={styles.emptyLogo}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptyText}>Ask your first question below</Text>
            </View>
          ) : null}

          {currentChat?.messages && currentChat.messages.map(message => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {aiLoading && (
            <View style={styles.aiLoadingRow}>
              <View style={styles.aiLoadingBubble}>
                <BlurryLoader />
              </View>
            </View>
          )}
        </ScrollView>
      )}

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
  header: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1D',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  messages: {
    flex: 1,
  },
  welcomeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeLogo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  welcomeHeadline: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1D1D1D',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 40,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyLogo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#1D1D1D',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 14,
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
});
