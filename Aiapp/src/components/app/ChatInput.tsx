import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSend?: (text: string, options: { thinking: boolean; search: boolean }) => Promise<void> | void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ onSend, placeholder = 'Chat with NEXA AI', disabled = false }: ChatInputProps) {
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
      Alert.alert('NEXA AI', message);
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
          placeholder={disabled ? 'Waiting for response…' : placeholder}
          placeholderTextColor="#CCCCCC"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          keyboardAppearance="light"
          editable={!disabled}
        />

        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.plusButton} activeOpacity={0.7}>
              <Feather name="plus" size={16} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pillButton, thinking && styles.pillButtonActive]}
              onPress={() => setThinking(!thinking)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="brain"
                size={13}
                color={thinking ? '#D97757' : '#999999'}
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
                color={search ? '#D97757' : '#999999'}
                style={styles.pillIcon}
              />
              <Text style={[styles.pillText, search && styles.pillTextActive]}>
                Search
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="mic" size={16} color="#999999" />
            </TouchableOpacity>

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
                <Feather name="arrow-up" size={16} color="#FFFFFF" />
              ) : (
                <Feather name="star" size={15} color="#CCCCCC" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    minHeight: 108,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    color: '#1D1D1D',
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    maxHeight: 140,
    fontWeight: '400',
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  pillButtonActive: {
    borderColor: '#D97757',
    backgroundColor: '#FFF4F0',
  },
  pillIcon: {
    marginRight: 4,
  },
  pillText: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#D97757',
    fontWeight: '600',
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sendButtonActive: {
    backgroundColor: '#1D1D1D',
    borderColor: '#1D1D1D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
});
