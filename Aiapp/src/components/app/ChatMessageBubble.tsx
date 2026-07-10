import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/state/ChatProvider';

type Props = {
  message: ChatMessage;
};

function renderInline(text: string) {
  // Handle **bold** text
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
          const isBullet = line.trim().startsWith('- ');
          const isNumbered = /^\d+\.\s/.test(line.trim());
          let body = line;
          
          if (isBullet) {
            body = line.replace(/^\s*-\s/, '');
          } else if (isNumbered) {
            body = line.replace(/^\s*\d+\.\s/, '');
          }

          return (
            <View key={`${lineIndex}-${body}`} style={[styles.lineContainer, (isBullet || isNumbered) && styles.listItem]}>
              {isBullet && <Text style={styles.bullet}>•</Text>}
              {isNumbered && <Text style={styles.bullet}>{line.match(/^\d+/)?.[0]}.</Text>}
              <Text style={isUser ? styles.userText : styles.assistantText}>
                {renderInline(body)}
                {lineIndex < lines.length - 1 ? '\n' : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 12,
    width: '100%',
    paddingHorizontal: 0,
  },
  userRow: {
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  assistantRow: {
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userBubble: {
    backgroundColor: '#D97757',
    borderBottomRightRadius: 4,
    shadowColor: '#D97757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderBottomLeftRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItem: {
    marginVertical: 4,
  },
  userText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  assistantText: {
    flex: 1,
    color: '#1D1D1D',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  boldText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
  },
  bullet: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    marginTop: 2,
  },
});
