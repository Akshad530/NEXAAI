import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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
          activeOpacity={0.7}
        >
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
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="more-horizontal" size={14} color={active ? C.label : C.labelMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const SectionLabel = ({ title }: { title: string }) => <Text style={styles.sectionLabel}>{title}</Text>;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <NexaLogo size="lg" layout="vertical" theme="light" animated={false} />
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={styles.closeBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="chevron-left" size={20} color={C.label} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.newChatRow} onPress={handleNewChat} activeOpacity={0.8}>
          <Feather name="edit-3" size={16} color={C.label} style={styles.rowIcon} />
          <Text style={styles.newChatText}>New chat</Text>
        </TouchableOpacity>

        {[
          { icon: 'search', label: 'Search chats' },
          { icon: 'book-open', label: 'Library' },
          { icon: 'folder', label: 'Projects', badge: '+' },
          { icon: 'grid', label: 'Apps' },
          { icon: 'more-horizontal', label: 'More' },
        ].map(({ icon, label, badge }) => (
          <TouchableOpacity key={label} style={styles.navRow} activeOpacity={0.72}>
            <Feather name={icon as any} size={17} color={C.icon} style={styles.rowIcon} />
            <Text style={styles.navText}>{label}</Text>
            {badge && (
              <View style={styles.badgeWrap}>
                <Feather name="plus" size={13} color={C.labelMuted} />
              </View>
            )}
          </TouchableOpacity>
        ))}

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
            <Feather name="message-square" size={20} color={C.labelMuted} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a new chat to see it here.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>NA</Text>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.name}>NEXA AI</Text>
            <Text style={styles.tier}>Pro</Text>
          </View>

          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.8}>
            <Text style={styles.upgradeTxt}>Upgrade</Text>
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
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  closeBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.borderStrong,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 10, paddingVertical: 10, paddingBottom: 20 },
  newChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.newChatBg,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
    letterSpacing: 0.1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
    flex: 1,
  },
  rowIcon: { marginRight: 12 },
  badgeWrap: { padding: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginVertical: 12,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.labelMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingBottom: 6,
    paddingTop: 2,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 2,
    height: 38,
    paddingRight: 4,
  },
  chatRowActive: { backgroundColor: C.rowActive },
  chatRowBtn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
    height: '100%',
  },
  chatTitle: { fontSize: 13.5, fontWeight: '500' },
  chatTitleActive: { color: C.label },
  chatTitleIdle: { color: '#999999' },
  ellipsisBtn: { padding: 6 },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: C.labelMuted,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: C.labelMuted,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.bg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  nameBlock: { flex: 1, marginLeft: 10, marginRight: 8 },
  name: { fontSize: 13.5, fontWeight: '600', color: C.label },
  tier: { fontSize: 11, color: C.labelMuted, marginTop: 1 },
  upgradeBtn: {
    borderWidth: 1,
    borderColor: C.upgradeBdr,
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 13,
    backgroundColor: C.upgradeBtn,
  },
  upgradeTxt: { fontSize: 12, fontWeight: '600', color: C.upgradeTxt },
});
