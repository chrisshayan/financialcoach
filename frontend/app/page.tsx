'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '@/components/MessageBubble';
import { CalculationCard } from '@/components/CalculationCard';
import { FollowUpSuggestions } from '@/components/FollowUpSuggestions';
import { Onboarding } from '@/components/Onboarding';
import { UserProfile } from '@/components/UserProfile';
import { ActionPlan } from '@/components/ActionPlan';
import { PersonaSelector } from '@/components/PersonaSelector';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { CLVCalculator } from '@/components/CLVCalculator';
import { ScenarioPlanner } from '@/components/ScenarioPlanner';
import { Marketplace } from '@/components/Marketplace';
import { useConversation } from '@/hooks/useConversation';
import { streamChatMessage } from '@/lib/chat-client';

export default function Home() {
  const {
    messages,
    conversationState,
    addMessage,
    updateLastMessage,
    addCalculationResult,
    addFollowUpSuggestions,
    clearConversation
  } = useConversation();
  
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState('user_001');
  const [userContext, setUserContext] = useState<any>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Load user context based on selected persona
  useEffect(() => {
    // Map persona IDs to mock data (matching backend mock_user_context.json)
    const personaData: Record<string, any> = {
      'user_001': {
        income: { monthly_gross: 7500, annual_gross: 90000 },
        savings: { total: 20500, monthly_savings_rate: 800 },
        credit: { score: 720 },
        name: 'Alex',
        debts: [
          { type: 'student_loan', balance: 25000, monthly_payment: 350 },
          { type: 'auto_loan', balance: 12000, monthly_payment: 450 },
          { type: 'credit_card', balance: 3000, monthly_payment: 150 }
        ]
      },
      'user_002': {
        income: { monthly_gross: 10000, annual_gross: 120000 },
        savings: { total: 50000, monthly_savings_rate: 2000 },
        credit: { score: 780 },
        name: 'Jordan',
        debts: [
          { type: 'student_loan', balance: 15000, monthly_payment: 250 }
        ]
      },
      'user_003': {
        income: { monthly_gross: 5000, annual_gross: 60000 },
        savings: { total: 8000, monthly_savings_rate: 400 },
        credit: { score: 650 },
        name: 'Sam',
        debts: [
          { type: 'student_loan', balance: 35000, monthly_payment: 500 },
          { type: 'credit_card', balance: 8000, monthly_payment: 300 }
        ]
      }
    };
    
    setUserContext(personaData[selectedPersona] || personaData['user_001']);
  }, [selectedPersona]);
  
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
        selectedPersona,
        (chunk: string) => {
          fullResponse += chunk;
          updateLastMessage(typingId, fullResponse);
        },
        (calculation: any) => {
          // Handle calculation results - can be multiple
          addCalculationResult(calculation);
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Financial Coach
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            AI-powered homeownership guide
          </p>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <PersonaSelector 
            selectedPersona={selectedPersona}
            onPersonaChange={(personaId) => {
              if (personaId !== selectedPersona) {
                setSelectedPersona(personaId);
                // Clear conversation when switching personas for demo
                clearConversation();
              }
            }}
          />
          {userContext && <UserProfile userContext={userContext} />}
          
          {/* Progress Dashboard */}
          <ProgressDashboard
            userContext={{
              ...userContext,
              readinessScore: conversationState.calculations?.readiness_score,
              dti: conversationState.calculations?.dti
            }}
          />
        </div>
      </div>
      
      {/* Right Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Chat</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ask about affordability, DTI, or readiness
              </p>
            </div>
            <button
              onClick={() => setShowMarketplace(!showMarketplace)}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg border border-primary/30 transition-colors"
            >
              {showMarketplace ? 'Hide' : 'Show'} Marketplace
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {showMarketplace && (
            <div className="mb-6">
              <Marketplace />
            </div>
          )}

          {showOnboarding && messages.length === 0 && !showMarketplace && (
            <div className="mb-6">
              <Onboarding
                onSelectExample={(example) => handleSend(example)}
                onDismiss={() => setShowOnboarding(false)}
                userContext={userContext}
              />
            </div>
          )}
          
          {messages.length === 0 && !showOnboarding && !showMarketplace && (
            <div className="max-w-3xl mx-auto text-center text-muted-foreground mt-12">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-lg mb-2">Ready to start your homeownership journey?</p>
              <p className="text-sm">Ask me about affordability, DTI, or your readiness score.</p>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble message={msg} />
                {msg.calculationResult && (
                  <>
                    <CalculationCard result={msg.calculationResult} />
                    {/* Show ActionPlan if it's an action plan result */}
                    {(msg.calculationResult.goal || 
                      msg.calculationResult.priority_actions || 
                      msg.calculationResult.action_plan) && (
                      <ActionPlan plan={
                        msg.calculationResult.action_plan || msg.calculationResult
                      } />
                    )}
                    {/* Show Product Recommendations after calculations */}
                    {(msg.calculationResult.readiness_score !== undefined ||
                      msg.calculationResult.dti !== undefined ||
                      msg.calculationResult.is_affordable !== undefined ||
                      msg.calculationResult.spending_by_category) && (
                      <ProductRecommendations
                        userContext={{
                          ...userContext,
                          readinessScore: msg.calculationResult.readiness_score,
                          dti: msg.calculationResult.dti,
                          savings: userContext?.savings,
                          credit: userContext?.credit,
                          income: userContext?.income
                        }}
                        trigger={
                          msg.calculationResult.readiness_score !== undefined ? 'readiness' :
                          msg.calculationResult.dti !== undefined ? 'dti' :
                          msg.calculationResult.spending_by_category ? 'spending' :
                          'affordability'
                        }
                      />
                    )}
                    {/* Show CLV Calculator after readiness score */}
                    {msg.calculationResult.readiness_score !== undefined && (
                      <CLVCalculator
                        userContext={userContext}
                        readinessScore={msg.calculationResult.readiness_score}
                        dti={msg.calculationResult.dti}
                      />
                    )}
                    {/* Show Scenario Planner after DTI or readiness */}
                    {(msg.calculationResult.dti !== undefined || msg.calculationResult.readiness_score !== undefined) && (
                      <ScenarioPlanner
                        userContext={userContext}
                        currentReadiness={msg.calculationResult.readiness_score || 0}
                        currentDTI={msg.calculationResult.dti || 0                        }
                      />
                    )}
                    {/* Show CLV Calculator after readiness score */}
                    {msg.calculationResult.readiness_score !== undefined && (
                      <CLVCalculator
                        userContext={userContext}
                        readinessScore={msg.calculationResult.readiness_score}
                        dti={msg.calculationResult.dti}
                      />
                    )}
                    {/* Show Scenario Planner after DTI or readiness */}
                    {(msg.calculationResult.dti !== undefined || msg.calculationResult.readiness_score !== undefined) && (
                      <ScenarioPlanner
                        userContext={userContext}
                        currentReadiness={msg.calculationResult.readiness_score || 0}
                        currentDTI={msg.calculationResult.dti || 0}
                      />
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
          <div className="max-w-3xl mx-auto">
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
    </div>
  );
}
