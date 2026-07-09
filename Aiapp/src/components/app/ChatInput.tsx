import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSend?: (text: string, options: { thinking: boolean; search: boolean }) => Promise<void> | void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ onSend, placeholder = 'How can I help you today?', disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [search, setSearch] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !onSend || disabled) return;

    try {
      await onSend(trimmed, { thinking, search });
      setText('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      Alert.alert('Nexa AI', message);
    }
  };

  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}>
        <TextInput
          style={styles.textInput}
          placeholder={disabled ? 'Waiting for a reply…' : placeholder}
          placeholderTextColor="#6b7280"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          keyboardAppearance="dark"
          editable={!disabled}
        />

        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.plusButton} activeOpacity={0.7}>
              <Feather name="plus" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pillButton, thinking && styles.pillButtonActive]}
              onPress={() => setThinking(!thinking)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="brain"
                size={13}
                color={thinking ? '#3b82f6' : '#9ca3af'}
                style={styles.pillIcon}
              />
              <Text style={[styles.pillText, thinking && styles.pillTextActive]}>
                Thinking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pillButton, search && styles.pillButtonActive]}
              onPress={() => setSearch(!search)}
              activeOpacity={0.7}
            >
              <Feather
                name="globe"
                size={12}
                color={search ? '#3b82f6' : '#9ca3af'}
                style={styles.pillIcon}
              />
              <Text style={[styles.pillText, search && styles.pillTextActive]}>
                Search
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              text.trim().length > 0 && !disabled && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={text.trim().length === 0 || disabled}
            activeOpacity={0.7}
          >
            {text.trim().length > 0 && !disabled ? (
              <Feather name="arrow-up" size={16} color="#000" />
            ) : (
              <Feather name="star" size={15} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#171717',
    borderTopWidth: 1,
    borderColor: '#262626',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    backgroundColor: '#212121',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333333',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 15,
    minHeight: 102,
    justifyContent: 'space-between',
  },
  textInput: {
    color: '#ececec',
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    maxHeight: 120,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2f2f2f',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f2f2f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pillButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a30',
  },
  pillIcon: {
    marginRight: 4,
  },
  pillText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2f2f2f',
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
});
