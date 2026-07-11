import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useChat } from '@/state/ChatProvider';

type Props = {
  navigation: DrawerNavigationProp<any>;
};

export default function HistoryChatsDrawer({ navigation }: Props) {
  const { chats, startNewChat } = useChat();

  const handleNewChat = () => {
    startNewChat();
    navigation.closeDrawer();
  };

  const handleSelectChat = (chatId: string) => {
    navigation.navigate('chat', { id: chatId });
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEXA AI</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.closeDrawer()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={24} color="#1D1D1D" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* New Chat Button */}
      <TouchableOpacity
        style={styles.newChatBtn}
        onPress={handleNewChat}
        activeOpacity={0.75}
      >
        <Feather name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      {/* Chat History */}
      <ScrollView
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionLabel}>Recent</Text>
        {chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color="#CCCCCC" />
            <Text style={styles.emptyText}>No chats yet</Text>
          </View>
        ) : (
          chats.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleSelectChat(chat.id)}
              activeOpacity={0.65}
            >
              <Feather name="message-circle" size={16} color="#1D1D1D" />
              <Text style={styles.chatTitle} numberOfLines={1}>
                {chat.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} activeOpacity={0.7}>
          <Feather name="settings" size={18} color="#666666" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1D',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 12,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chatTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1D',
    marginLeft: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
});
