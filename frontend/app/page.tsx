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
import { DataMesh } from '@/components/DataMesh';
import { ExportShare } from '@/components/ExportShare';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BadgeSystem } from '@/components/BadgeSystem';
import { MilestoneCelebration } from '@/components/MilestoneCelebration';
import { PeerBenchmarks } from '@/components/PeerBenchmarks';
import { NotificationCenter, Notification } from '@/components/NotificationCenter';
import { ProgressStreaks } from '@/components/ProgressStreaks';
import { SuccessStories } from '@/components/SuccessStories';
import { RateDropAlerts } from '@/components/RateDropAlerts';
import { ContentLibrary } from '@/components/ContentLibrary';
import { Leaderboards } from '@/components/Leaderboards';
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
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [celebratedMilestone, setCelebratedMilestone] = useState<any>(null);
  const [dailyStreak, setDailyStreak] = useState(5);
  const [weeklyStreak, setWeeklyStreak] = useState(2);
  const [monthlyStreak, setMonthlyStreak] = useState(1);
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

  // Check for milestone achievements
  useEffect(() => {
    const readinessScore = conversationState.calculations?.readiness_score;
    const dti = conversationState.calculations?.dti;
    const savings = userContext?.savings?.total;

    // Check for milestone achievements
    if (readinessScore && readinessScore >= 75 && !celebratedMilestone) {
      setCelebratedMilestone({
        id: 'readiness_75',
        title: 'Mortgage Ready!',
        description: 'You\'ve reached a readiness score of 75+ - you\'re ready for pre-approval!',
        tier: 'gold',
        icon: '🏆'
      });
      setNotifications(prev => [...prev, {
        id: `milestone_${Date.now()}`,
        type: 'milestone',
        title: 'Milestone Achieved!',
        message: 'You\'ve reached a readiness score of 75+',
        timestamp: new Date(),
        read: false,
        icon: '🎉',
        priority: 'high'
      }]);
    }

    if (dti && dti <= 36 && !celebratedMilestone) {
      setCelebratedMilestone({
        id: 'dti_champion',
        title: 'DTI Champion!',
        description: 'Your DTI is below 36% - excellent financial health!',
        tier: 'gold',
        icon: '💪'
      });
    }

    if (savings && savings >= 30000 && !celebratedMilestone) {
      setCelebratedMilestone({
        id: 'savings_30k',
        title: 'Down Payment Ready!',
        description: 'You\'ve saved $30,000 - enough for a down payment!',
        tier: 'platinum',
        icon: '💰'
      });
    }
  }, [conversationState.calculations, userContext, celebratedMilestone]);
  
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
      <div className="w-[480px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Financial Coach
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered homeownership guide
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              title="Settings"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>
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
          
          {/* Data Mesh */}
          <DataMesh userContext={userContext} />
          
          {/* Progress Streaks */}
          <ProgressStreaks
            dailyStreak={dailyStreak}
            weeklyStreak={weeklyStreak}
            monthlyStreak={monthlyStreak}
            onFreezeStreak={() => {
              // Handle streak freeze
              alert('Streak frozen! You have one more freeze day remaining.');
            }}
            freezeDaysRemaining={1}
          />
          
          {/* Badge System */}
          <BadgeSystem
            userContext={userContext}
            readinessScore={conversationState.calculations?.readiness_score}
            dti={conversationState.calculations?.dti}
            savings={userContext?.savings?.total}
            engagementDays={dailyStreak}
          />
          
          {/* Peer Benchmarks */}
          <PeerBenchmarks
            userContext={userContext}
            dti={conversationState.calculations?.dti}
            savings={userContext?.savings?.total}
            creditScore={userContext?.credit?.score}
            monthlySpending={userContext?.savings?.monthly_savings_rate}
          />
          
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
              <h2 className="text-lg font-semibold text-foreground">Financial Coach</h2>
              <p className="text-xs text-muted-foreground">Your AI-powered homeownership advisor</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-muted/50 rounded-lg transition-colors"
                title="Notifications"
              >
                <span className="text-xl">🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setShowMarketplace(!showMarketplace)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {showMarketplace ? 'Back to Chat' : 'Marketplace'}
              </button>
            </div>
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
            <div className="max-w-3xl mx-auto space-y-6 mt-8">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg mb-2">Ready to start your homeownership journey?</p>
                <p className="text-sm">Ask me about affordability, DTI, or your readiness score.</p>
              </div>
              
              {/* Rate Drop Alerts */}
              <RateDropAlerts userContext={userContext} />
              
              {/* Success Stories */}
              <SuccessStories />
              
              {/* Content Library */}
              <ContentLibrary userContext={userContext} currentStage="discovery" />
              
              {/* Leaderboards */}
              <Leaderboards
                userContext={userContext}
                dti={conversationState.calculations?.dti}
                savings={userContext?.savings?.total}
                creditScore={userContext?.credit?.score}
                monthlySavings={userContext?.savings?.monthly_savings_rate}
              />
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
                      <div className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <ExportShare
                            data={{
                              type: 'clv',
                              title: 'CLV Analysis Report',
                              content: msg.calculationResult
                            }}
                          />
                        </div>
                        <CLVCalculator
                          userContext={userContext}
                          readinessScore={msg.calculationResult.readiness_score}
                          dti={msg.calculationResult.dti}
                        />
                      </div>
                    )}
                    {/* Show Scenario Planner after DTI or readiness */}
                    {(msg.calculationResult.dti !== undefined || msg.calculationResult.readiness_score !== undefined) && (
                      <div className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <ExportShare
                            data={{
                              type: 'scenario',
                              title: 'Scenario Planning Report',
                              content: msg.calculationResult
                            }}
                          />
                        </div>
                        <ScenarioPlanner
                          userContext={userContext}
                          currentReadiness={msg.calculationResult.readiness_score || 0}
                          currentDTI={msg.calculationResult.dti || 0}
                        />
                      </div>
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
        
        {/* Settings Panel */}
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        
        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={(id) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
          }}
          onClearAll={() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
        
        {/* Milestone Celebration */}
        {celebratedMilestone && (
          <MilestoneCelebration
            milestone={celebratedMilestone}
            onClose={() => setCelebratedMilestone(null)}
          />
        )}
        
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
