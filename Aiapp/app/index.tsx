import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ChatInput from '@/components/app/ChatInput';
import NexaLogo from '@/components/app/NexaLogo';
import { useChat } from '@/state/ChatProvider';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { sendMessage } = useChat();
  const { width } = useWindowDimensions();

  const headlineSize = width < 360 ? 24 : width < 420 ? 28 : 32;
  const headlineLineHeight = width < 360 ? 31 : width < 420 ? 36 : 40;
  const logoScale = width < 360 ? 0.92 : 1;

  const handleSend = async (text: string) => {
    try {
      const chatId = await sendMessage({ text });
      router.push({ pathname: '/chat/[id]', params: { id: chatId } });
    } catch {
      // ChatInput already shows the error alert.
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableOpacity
        style={[styles.menuBtn, { top: Math.max(insets.top + 4, 20) }]}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        activeOpacity={0.72}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="menu" size={22} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

      <View style={styles.canvas}>
        <View style={{ transform: [{ scale: logoScale }] }}>
          <NexaLogo size="lg" layout="vertical" theme="dark" animated={false} />
        </View>

        <Text style={[styles.headline, { fontSize: headlineSize, lineHeight: headlineLineHeight }]}>What are you thinking about today?</Text>

        <Text style={styles.subhead}>Ask anything and a new chat will be created automatically.</Text>
      </View>

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  menuBtn: {
    position: 'absolute',
    left: 18,
    zIndex: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  canvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  headline: {
    marginTop: 30,
    fontWeight: '700',
    color: '#F2F3F7',
    textAlign: 'center',
    letterSpacing: -0.9,
    fontFamily: 'System',
    maxWidth: 340,
  },
  subhead: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
  },
});

