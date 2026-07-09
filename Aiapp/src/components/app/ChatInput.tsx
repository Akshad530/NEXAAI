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
          placeholder={disabled ? 'Waiting for a reply…' : placeholder}
          placeholderTextColor="#999999"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
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
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#F9F6F2',
    borderTopWidth: 1,
    borderColor: '#E5E1DA',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E1DA',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 15,
    minHeight: 102,
    justifyContent: 'space-between',
  },
  textInput: {
    color: '#1D1D1D',
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
    borderColor: '#E5E1DA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F6F2',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E1DA',
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F6F2',
    borderWidth: 1,
    borderColor: '#E5E1DA',
  },
  sendButtonActive: {
    backgroundColor: '#D97757',
    borderColor: '#D97757',
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
});
