'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '@/components/MessageBubble';
import { CalculationCard } from '@/components/CalculationCard';
import { FollowUpSuggestions } from '@/components/FollowUpSuggestions';
import { Onboarding } from '@/components/Onboarding';
import { UserProfile } from '@/components/UserProfile';
import { ActionPlan } from '@/components/ActionPlan';
import { useConversation } from '@/hooks/useConversation';
import { streamChatMessage } from '@/lib/chat-client';

export default function Home() {
  const {
    messages,
    conversationState,
    addMessage,
    updateLastMessage,
    addCalculationResult,
    addFollowUpSuggestions
  } = useConversation();
  
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load user context on mount
  useEffect(() => {
    // In a real app, this would come from an API
    // For now, we'll use mock data structure
    setUserContext({
      income: { monthly_gross: 7500, annual_gross: 90000 },
      savings: { total: 20500 },
      credit: { score: 720 }
    });
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Hide onboarding after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowOnboarding(false);
    }
  }, [messages.length]);
  
  const handleSend = async (messageText?: string) => {
    const userMessage = (messageText || input.trim());
    if (!userMessage || isStreaming) return;
    
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsStreaming(true);
    
    // Add typing indicator
    const typingId = addMessage({ 
      role: 'assistant', 
      content: '', 
      isStreaming: true 
    });
    
    let fullResponse = '';
    
    try {
      // Stream response from backend
      await streamChatMessage(
        userMessage,
        messages.map(m => ({ role: m.role, content: m.content })),
        (chunk: string) => {
          fullResponse += chunk;
          updateLastMessage(typingId, fullResponse);
        },
        (calculation: any) => {
          addCalculationResult(calculation);
          // If it's an action plan, store it separately
          if (calculation.action_plan || calculation.goal) {
            // Action plan will be displayed via CalculationCard
          }
        },
        (suggestions: string[]) => {
          addFollowUpSuggestions(suggestions);
        },
        (error: string) => {
          updateLastMessage(typingId, `Error: ${error}`, false);
        }
      );
      
      // Remove typing indicator
      updateLastMessage(typingId, fullResponse, false);
      
    } catch (error) {
      updateLastMessage(
        typingId, 
        'Sorry, I encountered an error. Please try again.', 
        false
      );
    } finally {
      setIsStreaming(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Financial Coach
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your AI-powered guide to homeownership readiness
              </p>
            </div>
            {conversationState.lastCalculation?.dti && (
              <div className="text-right text-sm bg-muted/50 px-3 py-2 rounded-lg border border-border">
                <div className="text-muted-foreground">Last DTI</div>
                <div className="font-semibold text-primary">
                  {conversationState.lastCalculation.dti}%
                </div>
              </div>
            )}
          </div>
          {userContext && <UserProfile userContext={userContext} />}
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {showOnboarding && messages.length === 0 && (
            <div className="mb-6">
              <Onboarding
                onSelectExample={(example) => handleSend(example)}
                onDismiss={() => setShowOnboarding(false)}
              />
            </div>
          )}
          
          {messages.length === 0 && !showOnboarding && (
            <div className="text-center text-muted-foreground mt-12">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-lg mb-2">Ready to start your homeownership journey?</p>
              <p className="text-sm">Ask me about affordability, DTI, or your readiness score.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} />
              {msg.calculationResult && (
                <>
                  <CalculationCard result={msg.calculationResult} />
                  {msg.calculationResult.action_plan && (
                    <ActionPlan plan={msg.calculationResult.action_plan} />
                  )}
                  {(msg.calculationResult.goal || msg.calculationResult.priority_actions) && (
                    <ActionPlan plan={msg.calculationResult} />
                  )}
                </>
              )}
            </div>
          ))}
          
          {/* Follow-up suggestions */}
          {conversationState.suggestedFollowUps.length > 0 && (
            <FollowUpSuggestions 
              suggestions={conversationState.suggestedFollowUps}
              onSelect={(suggestion) => {
                handleSend(suggestion);
              }}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about affordability, DTI, or readiness..."
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              disabled={isStreaming}
            />
            <button
              onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
