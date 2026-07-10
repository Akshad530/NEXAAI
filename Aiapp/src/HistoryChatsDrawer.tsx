import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import NexaLogo from './components/app/NexaLogo';
import { useChat } from '@/state/ChatProvider';

type SectionedChats = {
  today: { id: string; title: string }[];
  yesterday: { id: string; title: string }[];
  older: { id: string; title: string }[];
};

const C = {
  bg: '#F9F6F2',
  bgElevated: '#FFFFFF',
  border: '#E5E1DA',
  borderStrong: '#D9D4CC',
  icon: '#666666',
  label: '#1D1D1D',
  labelMuted: '#999999',
  rowActive: '#F0EBE3',
  avatarBg: '#D97757',
  upgradeBtn: '#F0EBE3',
  upgradeTxt: '#1D1D1D',
  upgradeBdr: '#E5E1DA',
  newChatBg: '#FFFFFF',
  hoverBg: '#F5F2ED',
};

const DAY = 24 * 60 * 60 * 1000;

export default function HistoryChatsDrawer(props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const { chats, openThread, deleteChat, startNewChat } = useChat();

  const handleNewChat = () => {
    startNewChat();
    props.navigation.closeDrawer();
    router.replace('/');
  };

  const handleSelectChat = (id: string) => {
    openThread(id);
    props.navigation.closeDrawer();
    router.push({ pathname: '/chat/[id]', params: { id } });
  };

  const handleOpenMenu = (item: { id: string; title: string }) => {
    Alert.alert(item.title || 'Chat options', 'What do you want to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const wasActive = pathname === `/chat/${item.id}`;
          deleteChat(item.id);
          if (wasActive) {
            props.navigation.closeDrawer();
            router.replace('/');
          }
        },
      },
    ]);
  };

  const now = Date.now();
  const sectioned = chats.reduce<SectionedChats>((acc, chat) => {
    const item = { id: chat.id, title: chat.title };
    const age = now - chat.updatedAt;
    if (age < DAY) acc.today.unshift(item);
    else if (age < DAY * 2) acc.yesterday.unshift(item);
    else acc.older.unshift(item);
    return acc;
  }, { today: [], yesterday: [], older: [] });

  const ChatRow = ({ item }: { item: { id: string; title: string } }) => {
    const active = pathname === `/chat/${item.id}`;
    return (
      <View style={[styles.chatRow, active && styles.chatRowActive]}>
        <TouchableOpacity
          style={styles.chatRowBtn}
          onPress={() => handleSelectChat(item.id)}
          activeOpacity={0.6}
        >
          <Feather 
            name="message-square" 
            size={16} 
            color={active ? '#D97757' : C.labelMuted} 
            style={styles.chatIcon}
          />
          <Text
            style={[styles.chatTitle, active ? styles.chatTitleActive : styles.chatTitleIdle]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ellipsisBtn}
          onPress={() => handleOpenMenu(item)}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="more-horizontal" size={16} color={active ? C.label : C.labelMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const SectionLabel = ({ title }: { title: string }) => <Text style={styles.sectionLabel}>{title}</Text>;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <NexaLogo size="sm" layout="horizontal" theme="light" />
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={styles.closeBtn}
          activeOpacity={0.65}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="chevron-left" size={22} color={C.label} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.newChatRow} onPress={handleNewChat} activeOpacity={0.75}>
          <Feather name="edit-3" size={18} color={C.label} style={styles.rowIcon} />
          <Text style={styles.newChatText}>New chat</Text>
        </TouchableOpacity>

        <View style={styles.navSection}>
          {[
            { icon: 'search', label: 'Search chats' },
            { icon: 'book-open', label: 'Library' },
            { icon: 'folder', label: 'Projects', badge: '+' },
            { icon: 'grid', label: 'Apps' },
            { icon: 'settings', label: 'Settings' },
          ].map(({ icon, label, badge }) => (
            <TouchableOpacity key={label} style={styles.navRow} activeOpacity={0.65}>
              <Feather name={icon as any} size={18} color={C.icon} style={styles.rowIcon} />
              <Text style={styles.navText}>{label}</Text>
              {badge && (
                <View style={styles.badgeWrap}>
                  <Feather name="plus" size={14} color={C.labelMuted} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {sectioned.today.length > 0 && (
          <>
            <SectionLabel title="Today" />
            {sectioned.today.map(item => <ChatRow key={item.id} item={item} />)}
          </>
        )}

        {sectioned.yesterday.length > 0 && (
          <>
            <SectionLabel title="Yesterday" />
            {sectioned.yesterday.map(item => <ChatRow key={item.id} item={item} />)}
          </>
        )}

        {sectioned.older.length > 0 && (
          <>
            <SectionLabel title="Previous 7 Days" />
            {sectioned.older.map(item => <ChatRow key={item.id} item={item} />)}
          </>
        )}

        {chats.length === 0 && (
          <View style={styles.emptyWrap}>
            <Feather name="message-square" size={24} color={C.labelMuted} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a new chat to see it here.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>NA</Text>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.name}>NEXA AI</Text>
            <Text style={styles.tier}>Pro Plan</Text>
          </View>

          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.75}>
            <Feather name="arrow-up-right" size={14} color={C.upgradeTxt} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 52,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  logoContainer: {
    flex: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.borderStrong,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 10, paddingVertical: 12, paddingBottom: 20 },
  newChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.newChatBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.label,
    letterSpacing: 0.2,
  },
  navSection: {
    marginBottom: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 3,
  },
  navText: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
    flex: 1,
  },
  rowIcon: { marginRight: 12 },
  badgeWrap: { padding: 2 },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.labelMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 6,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 3,
    height: 42,
    paddingRight: 4,
  },
  chatRowActive: { backgroundColor: C.rowActive },
  chatRowBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 8,
    height: '100%',
  },
  chatIcon: {
    marginRight: 10,
  },
  chatTitle: { fontSize: 14, fontWeight: '500' },
  chatTitleActive: { color: C.label, fontWeight: '600' },
  chatTitleIdle: { color: '#999999' },
  ellipsisBtn: { padding: 6 },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.labelMuted,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: C.labelMuted,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  footerDivider: {
    height: 1,
    backgroundColor: C.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  nameBlock: { flex: 1, marginLeft: 12, marginRight: 10 },
  name: { fontSize: 14, fontWeight: '700', color: C.label },
  tier: { fontSize: 12, color: C.labelMuted, marginTop: 2, fontWeight: '500' },
  upgradeBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: C.upgradeBdr,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.upgradeBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
