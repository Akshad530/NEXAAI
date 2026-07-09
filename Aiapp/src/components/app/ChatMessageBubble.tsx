import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/state/ChatProvider';

type Props = {
  message: ChatMessage;
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    const bold = part.startsWith('**') && part.endsWith('**');
    const content = bold ? part.slice(2, -2) : part;
    return (
      <Text key={`${index}-${content}`} style={bold ? styles.boldText : styles.text}>
        {content}
      </Text>
    );
  });
}

export default function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const lines = message.content.split('\n');

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {lines.map((line, lineIndex) => {
          const bullet = line.trim().startsWith('- ');
          const body = bullet ? line.replace(/^\s*-\s/, '') : line;
          return (
            <Text key={`${lineIndex}-${body}`} style={styles.line}>
              {bullet ? <Text style={styles.bullet}>• </Text> : null}
              {renderInline(body)}
              {lineIndex < lines.length - 1 ? '\n' : ''}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 6,
    width: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  userBubble: {
    backgroundColor: '#E8DDD3',
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderBottomLeftRadius: 8,
  },
  line: {
    color: '#1D1D1D',
    fontSize: 15,
    lineHeight: 22,
  },
  text: {
    color: '#1D1D1D',
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    color: '#1D1D1D',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  bullet: {
    color: '#1D1D1D',
  },
});
