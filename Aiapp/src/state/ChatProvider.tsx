import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

type SendMessageInput = {
  chatId?: string;
  text: string;
};

type ChatContextValue = {
  chats: ChatThread[];
  currentChatId: string | null;
  activeChat: ChatThread | null;
  isReady: boolean;
  sendMessage: (input: SendMessageInput) => Promise<string>;
  openThread: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  startNewChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = 'nexa.chats.v1';

// --- Provider config -------------------------------------------------
// Gemini is the primary/default provider for this app. Groq and OpenAI are
// kept as optional fallbacks if you'd rather use them instead — just leave
// EXPO_PUBLIC_GEMINI_API_KEY blank and set one of the others in your .env.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama3-8b-8192';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = [
  'You are NEXA AI, a professional and intelligent assistant designed to provide detailed, well-formatted responses.',
  'Format your responses using markdown with clear structure:',
  '- Use **bold** for important concepts, key terms, and critical information.',
  '- Use bullet points for lists and key takeaways.',
  '- Use numbered lists for step-by-step instructions or ranked items.',
  '- Break content into logical paragraphs for readability.',
  '- Use proper spacing and formatting for professional appearance.',
  'Provide comprehensive, detailed answers that are informative and actionable.',
  'Maintain a professional yet approachable tone.',
  'Always prioritize clarity and structure in your responses.',
].join(' ');

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// --- Gemini ------------------------------------------------------------
async function callGemini(messages: ChatMessage[]) {
  const contents = messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || `Gemini request failed (${response.status})`);
  }

  const data = await response.json();

  const candidate = data?.candidates?.[0];
  const outputText = candidate?.content?.parts?.map((part: any) => part.text ?? '').join('').trim();

  if (!outputText) {
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) throw new Error(`Gemini blocked the response (${blockReason}).`);
    throw new Error('Gemini returned an empty response.');
  }

  return outputText as string;
}

// --- Groq (optional fallback) -------------------------------------------
async function callGroq(messages: ChatMessage[]) {
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(message => ({ role: message.role, content: message.content })),
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: groqMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Groq request failed');
  }

  const data = await response.json();
  const outputText = data.choices?.[0]?.message?.content;
  if (!outputText) throw new Error('Groq returned no text');
  return outputText as string;
}

// --- OpenAI (optional fallback) ------------------------------------------
async function callOpenAI(messages: ChatMessage[]) {
  const input = [
    { role: 'developer', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
    ...messages.map(message => ({ role: message.role, content: [{ type: 'input_text', text: message.content }] })),
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: OPENAI_MODEL, input }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'OpenAI request failed');
  }

  const data = await response.json();
  const outputText = data.output_text ?? data.output?.flatMap((item: any) => item.content ?? [])
    ?.find((part: any) => part.type === 'output_text')?.text;

  if (!outputText) throw new Error('OpenAI returned no text');
  return outputText as string;
}

async function callLLM(messages: ChatMessage[]) {
  if (GEMINI_API_KEY) return callGemini(messages);
  if (GROQ_API_KEY) return callGroq(messages);
  if (OPENAI_API_KEY) return callOpenAI(messages);

  throw new Error(
    'No API key found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file at the project root, then restart Expo with "npx expo start -c".'
  );
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasLoaded = useRef(false);

  // Load persisted chats on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatThread[];
          if (Array.isArray(parsed)) setChats(parsed);
        }
      } catch {
        // Corrupt or missing storage — start fresh rather than crash.
      } finally {
        hasLoaded.current = true;
        setIsReady(true);
      }
    })();
  }, []);

  // Persist chats whenever they change (after the initial load completes).
  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chats)).catch(() => {
      // Ignore storage write failures; the in-memory state still works.
    });
  }, [chats]);

  const activeChat = currentChatId ? chats.find(chat => chat.id === currentChatId) ?? null : null;

  const openThread = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const startNewChat = () => {
    setCurrentChatId(null);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setCurrentChatId(prev => (prev === chatId ? null : prev));
  };

  const sendMessage = async ({ chatId, text }: SendMessageInput) => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Message cannot be empty');

    const now = Date.now();
    let threadId = chatId ?? currentChatId;
    const existingThread = threadId ? chats.find(chat => chat.id === threadId) : undefined;

    if (!threadId) {
      threadId = uid();
      setChats(prev => [
        { id: threadId as string, title: trimmed.slice(0, 36), messages: [], createdAt: now, updatedAt: now },
        ...prev,
      ]);
    }

    setCurrentChatId(threadId);

    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: now,
    };

    const history = existingThread?.messages ?? [];

    setChats(prev =>
      prev.map(chat => {
        if (chat.id !== threadId) return chat;
        return {
          ...chat,
          title: chat.messages.length === 0 ? trimmed.slice(0, 36) : chat.title,
          messages: [...chat.messages, userMessage],
          updatedAt: now,
        };
      })
    );

    try {
      const reply = await callLLM([...history, userMessage]);

      const assistantMessage: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: reply,
        createdAt: Date.now(),
      };

      setChats(prev =>
        prev.map(chat => {
          if (chat.id !== threadId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: assistantMessage.createdAt,
          };
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'LLM request failed';
      const assistantMessage: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: `I couldn't answer that right now.\n\n${message}`,
        createdAt: Date.now(),
      };

      setChats(prev =>
        prev.map(chat => {
          if (chat.id !== threadId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: assistantMessage.createdAt,
          };
        })
      );
      throw error;
    }

    return threadId;
  };

  const value = useMemo<ChatContextValue>(() => ({
    chats,
    currentChatId,
    activeChat,
    isReady,
    sendMessage,
    openThread,
    deleteChat,
    startNewChat,
  }), [activeChat, chats, currentChatId, isReady]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
