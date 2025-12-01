'use client';

import { useState, useCallback } from 'react';
import { Message, ConversationState, CalculationResult } from '@/types/chat';

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [],
    suggestedFollowUps: []
  });
  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);
  
  const updateLastMessage = useCallback((
    id: string, 
    content: string, 
    isStreaming: boolean = true
  ) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, content, isStreaming }
        : msg
    ));
  }, []);
  
  const addCalculationResult = useCallback((result: CalculationResult) => {
    setMessages(prev => {
      const updated = [...prev];
      // Find the last assistant message and add/merge calculation result
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'assistant') {
          // Merge with existing calculation result if present
          if (updated[i].calculationResult) {
            updated[i].calculationResult = { ...updated[i].calculationResult, ...result };
          } else {
            updated[i].calculationResult = result;
          }
          break;
        }
      }
      return updated;
    });
    
    setConversationState(prev => ({
      ...prev,
      lastCalculation: result
    }));
  }, []);
  
  const addFollowUpSuggestions = useCallback((suggestions: string[]) => {
    setConversationState(prev => ({
      ...prev,
      suggestedFollowUps: suggestions
    }));
  }, []);
  
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationState({
      messages: [],
      suggestedFollowUps: []
    });
  }, []);
  
  return {
    messages,
    conversationState,
    addMessage,
    updateLastMessage,
    addCalculationResult,
    addFollowUpSuggestions,
    clearConversation
  };
}

