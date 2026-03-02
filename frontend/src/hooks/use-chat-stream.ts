// frontend/src/hooks/use-chat-stream.ts
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { saveMessageAction } from '@/app/actions/chat-actions';

export function useChatStream(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!sessionId) setMessages([]);
  }, [sessionId]);

  const sendMessage = async (input: string, history: Message[], skipUserSave: boolean = false) => {
    if (!input.trim() || isGenerating || !sessionId) return;

    const userMsg: Message = { role: 'user', content: input };
    const aiMsg: Message = { role: 'assistant', content: '' };

    setMessages(prev => {
      if (skipUserSave) {
        const alreadyHasUserMsg = prev.some(m => m.role === 'user' && m.content === input);
        return alreadyHasUserMsg ? [...prev, aiMsg] : [...prev, userMsg, aiMsg];
      }
      return [...prev, userMsg, aiMsg];
    });

    setIsGenerating(true);

    try {
      if (!skipUserSave) {
        await saveMessageAction(sessionId, 'user', input);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, userMsg], sessionId }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let lineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n\n');
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmed.substring(6);
            if (jsonStr === '[DONE]') break;

            const data = JSON.parse(jsonStr);
            if (data.content) {
              accumulated += data.content;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
                }
                return updated;
              });
            }
          } catch (e) { continue; }
        }
      }

      if (accumulated) {
        await saveMessageAction(sessionId, 'assistant', accumulated);
      }

    } catch (e) {
      console.error('Stream Error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return { messages, setMessages, sendMessage, isGenerating };
}