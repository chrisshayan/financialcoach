'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { AITransparency } from '@/components/AITransparency';
import { GoalManagement, Goal } from '@/components/GoalManagement';
import { GoalWizard } from '@/components/GoalWizard';
import { GoalRecommendation } from '@/components/GoalRecommendation';
import { PlaidIntegration } from '@/components/PlaidIntegration';
import { ConsentModal } from '@/components/ConsentModal';
import { CoachRecommendation } from '@/components/CoachRecommendation';
import { ActiveCoaches } from '@/components/ActiveCoaches';
import { useConversation } from '@/hooks/useConversation';
import { streamChatMessage } from '@/lib/chat-client';
import { getCoaches, createConsent, revokeConsent, getUserConsents, sendCoachMessage } from '@/lib/coach-client';
import { Coach, Consent } from '@/types/coach';

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
  const [celebratedMilestoneIds, setCelebratedMilestoneIds] = useState<string[]>([]);
  const [dailyStreak, setDailyStreak] = useState(5);
  const [weeklyStreak, setWeeklyStreak] = useState(2);
  const [monthlyStreak, setMonthlyStreak] = useState(1);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [showAITransparency, setShowAITransparency] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<any>(null);
  const [activeCoaches, setActiveCoaches] = useState<Array<{ coach: Coach; consent: Consent }>>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | undefined>(undefined);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingCoach, setPendingCoach] = useState<Coach | null>(null);
  const [coachRecommendation, setCoachRecommendation] = useState<{ coach: Coach; reason: string } | null>(null);
  const [coachConversations, setCoachConversations] = useState<Record<string, Array<{ role: string; content: string }>>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Memoize existingGoals to prevent unnecessary re-renders of Onboarding
  const existingGoalsForOnboarding = useMemo(() => 
    goals.map(g => ({
      type: g.type,
      name: g.name,
      status: g.status
    })),
    [goals]
  );
  
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
    
    const persona = personaData[selectedPersona] || personaData['user_001'];
    setUserContext(persona);
    
    // Initialize default homeownership goal if no goals exist
    setGoals(prev => {
      if (prev.length === 0) {
        const defaultGoal: Goal = {
          id: 'goal_homeownership',
          type: 'homeownership',
          name: 'Homeownership',
          targetAmount: 30000,
          currentAmount: persona?.savings?.total || 0,
          targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          status: 'active',
          monthlyContribution: persona?.savings?.monthly_savings_rate || 0,
          progress: ((persona?.savings?.total || 0) / 30000) * 100,
          icon: '🏠',
          color: 'blue'
        };
        return [defaultGoal];
      }
      return prev;
    });
  }, [selectedPersona]);

  // Check for milestone achievements
  useEffect(() => {
    const readinessScore = conversationState.calculations?.readiness_score;
    const dti = conversationState.calculations?.dti;
    const savings = userContext?.savings?.total;

    // Only check for new milestones if we're not currently showing one
    if (celebratedMilestone) return;

    // Check for milestone achievements
    if (readinessScore && readinessScore >= 75 && !celebratedMilestoneIds.includes('readiness_75')) {
      setCelebratedMilestone({
        id: 'readiness_75',
        title: 'Mortgage Ready!',
        description: 'You\'ve reached a readiness score of 75+ - you\'re ready for pre-approval!',
        tier: 'gold',
        icon: '🏆'
      });
      setCelebratedMilestoneIds(prev => [...prev, 'readiness_75']);
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
      return;
    }

    if (dti && dti <= 36 && !celebratedMilestoneIds.includes('dti_champion')) {
      setCelebratedMilestone({
        id: 'dti_champion',
        title: 'DTI Champion!',
        description: 'Your DTI is below 36% - excellent financial health!',
        tier: 'gold',
        icon: '💪'
      });
      setCelebratedMilestoneIds(prev => [...prev, 'dti_champion']);
      return;
    }

    if (savings && savings >= 30000 && !celebratedMilestoneIds.includes('savings_30k')) {
      setCelebratedMilestone({
        id: 'savings_30k',
        title: 'Down Payment Ready!',
        description: 'You\'ve saved $30,000 - enough for a down payment!',
        tier: 'platinum',
        icon: '💰'
      });
      setCelebratedMilestoneIds(prev => [...prev, 'savings_30k']);
      return;
    }
  }, [conversationState.calculations, userContext, celebratedMilestone]);
  
  const handleCoachConnect = async (coach: Coach) => {
    setPendingCoach(coach);
    setShowConsentModal(true);
    setCoachRecommendation(null);
  };

  const handleConsentGranted = async (consentRequest: any) => {
    try {
      const consent = await createConsent(consentRequest);
      const coaches = await getCoaches();
      const coach = coaches.find(c => c.id === consent.coach_id);
      
      if (coach) {
        setActiveCoaches(prev => [...prev, { coach, consent }]);
        setSelectedCoachId(coach.id);
        setCoachConversations(prev => ({ ...prev, [coach.id]: [] }));
        
        // Send welcome message
        const welcomeMessage = `Hi! I'm ${coach.name}, powered by ${coach.powered_by}. How can I help you today?`;
        addMessage({
          role: 'assistant',
          content: welcomeMessage,
          coachId: coach.id,
          coachName: coach.name,
          coachIcon: coach.icon,
        });
        setCoachConversations(prev => ({
          ...prev,
          [coach.id]: [
            { role: 'assistant', content: welcomeMessage }
          ]
        }));
        
        // Scroll to bottom to show the welcome message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      
      setShowConsentModal(false);
      setPendingCoach(null);
    } catch (error) {
      console.error('Error granting consent:', error);
      alert('Failed to connect with coach. Please try again.');
    }
  };

  const handleRemoveCoach = async (coachId: string) => {
    try {
      await revokeConsent(coachId, selectedPersona);
      setActiveCoaches(prev => prev.filter(ac => ac.coach.id !== coachId));
      if (selectedCoachId === coachId) {
        setSelectedCoachId(undefined);
      }
      delete coachConversations[coachId];
    } catch (error) {
      console.error('Error removing coach:', error);
    }
  };

  const handleSend = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message) return;

    const lowerMessage = message.toLowerCase();
    
    // Check if user wants to switch coaches (check this FIRST, even if a coach is selected)
    const wantsFinancialCoach = lowerMessage.includes('finance coach') || 
        lowerMessage.includes('financial coach') || 
        lowerMessage.includes('finance coach are you there') ||
        lowerMessage.includes('switch to finance') ||
        lowerMessage.includes('switch back to finance') ||
        lowerMessage.includes('back to finance') ||
        lowerMessage.includes('go back to finance');
    
    const wantsZillowCoach = lowerMessage.includes('home coach') || 
        lowerMessage.includes('zillow coach') || 
        lowerMessage.includes('connect to home coach') ||
        lowerMessage.includes('connect to zillow') ||
        lowerMessage.includes('switch to zillow') ||
        lowerMessage.includes('switch back to home coach') ||
        lowerMessage.includes('switch back to a home coach') ||
        lowerMessage.includes('switch to home') ||
        lowerMessage.includes('i want to buy a home') ||
        lowerMessage.includes('i want to buy a house') ||
        lowerMessage.includes('buy a home') ||
        lowerMessage.includes('buy a house') ||
        lowerMessage.includes('homes available') ||
        lowerMessage.includes('homes in seattle') ||
        lowerMessage.includes('properties in seattle') ||
        lowerMessage.includes('real estate') ||
        lowerMessage.includes('property search');
    
    const wantsCarMaxCoach = lowerMessage.includes('car coach') || 
        lowerMessage.includes('carmax coach') || 
        lowerMessage.includes('connect to car coach') ||
        lowerMessage.includes('switch to carmax') ||
        lowerMessage.includes('switch to car') ||
        lowerMessage.includes('i want to buy a car') ||
        lowerMessage.includes('buy a car') ||
        lowerMessage.includes('auto loan') ||
        lowerMessage.includes('car financing');
    
    const wantsToStopCoach = lowerMessage.includes('stop the') || 
        lowerMessage.includes('disconnect') ||
        lowerMessage.includes('remove coach') ||
        (lowerMessage.includes('stop') && selectedCoachId);

    // Handle coach switching - CHECK THIS FIRST, even if a coach is selected
    // This allows users to switch coaches mid-conversation
    
    if (wantsToStopCoach && selectedCoachId) {
      setSelectedCoachId(undefined);
      addMessage({
        role: 'user',
        content: message,
      });
      addMessage({
        role: 'assistant',
        content: 'Switched back to Financial Coach. How can I help you?',
        coachId: 'financial_coach',
        coachName: 'Financial Coach',
        coachIcon: '🧠',
      });
      setInput('');
      return;
    }

    if (wantsFinancialCoach && selectedCoachId) {
      setSelectedCoachId(undefined);
      addMessage({
        role: 'user',
        content: message,
      });
      addMessage({
        role: 'assistant',
        content: 'Hi! I\'m your Financial Coach. How can I help you with your financial goals today?',
        coachId: 'financial_coach',
        coachName: 'Financial Coach',
        coachIcon: '🧠',
      });
      setInput('');
      return;
    }

    if (wantsZillowCoach) {
      const coaches = await getCoaches();
      const zillowCoach = coaches.find(c => c.id === 'zillow_coach');
      const isActive = activeCoaches.find(ac => ac.coach.id === 'zillow_coach');
      
      if (zillowCoach && isActive) {
        // Switch to Zillow Coach
        setSelectedCoachId('zillow_coach');
        addMessage({
          role: 'user',
          content: message,
        });
        addMessage({
          role: 'assistant',
          content: 'Switched to Zillow Coach! I can help you find properties in Seattle and explore neighborhoods. What are you looking for in a home?',
          coachId: 'zillow_coach',
          coachName: 'Zillow Coach',
          coachIcon: '🏠',
        });
        setInput('');
        return;
      } else if (zillowCoach && !isActive) {
        // Recommend connecting to Zillow Coach
        setCoachRecommendation({
          coach: zillowCoach,
          reason: 'I can connect you with Zillow Coach to help you search for properties and explore neighborhoods.'
        });
        addMessage({ role: 'user', content: message });
        setInput('');
        return;
      }
    }

    if (wantsCarMaxCoach) {
      const coaches = await getCoaches();
      const carmaxCoach = coaches.find(c => c.id === 'carmax_coach');
      const isActive = activeCoaches.find(ac => ac.coach.id === 'carmax_coach');
      
      if (carmaxCoach && isActive) {
        // Switch to CarMax Coach
        setSelectedCoachId('carmax_coach');
        addMessage({
          role: 'user',
          content: message,
        });
        addMessage({
          role: 'assistant',
          content: 'Switched to CarMax Coach! I can help you find the perfect car and explore financing options. What type of vehicle are you looking for?',
          coachId: 'carmax_coach',
          coachName: 'CarMax Coach',
          coachIcon: '🚗',
        });
        setInput('');
        return;
      } else if (carmaxCoach && !isActive) {
        // Recommend connecting to CarMax Coach
        setCoachRecommendation({
          coach: carmaxCoach,
          reason: 'I can connect you with CarMax Coach to help you find a car and explore financing options.'
        });
        addMessage({ role: 'user', content: message });
        setInput('');
        return;
      }
    }

    // If a coach is selected, send message to that coach
    if (selectedCoachId) {
      const coach = activeCoaches.find(ac => ac.coach.id === selectedCoachId)?.coach;
      if (!coach) return;

      addMessage({
        role: 'user',
        content: message,
      });

      setInput('');
      setIsStreaming(true);

      try {
        const history = coachConversations[selectedCoachId] || [];
        const responseData = await sendCoachMessage(selectedCoachId, message, selectedPersona, history);
        
        // Response can be a string or an object with richContent/suggestions
        let responseText = '';
        let richContent: any[] = [];
        let suggestions: string[] = [];
        
        if (typeof responseData === 'string') {
          responseText = responseData;
          // Try to parse if it's JSON
          try {
            if (responseData.startsWith('{')) {
              const parsed = JSON.parse(responseData);
              responseText = parsed.content || responseData;
              richContent = parsed.richContent || [];
              suggestions = parsed.suggestions || [];
            }
          } catch (e) {
            // Not JSON, use as-is
          }
        } else if (typeof responseData === 'object') {
          responseText = responseData.response || '';
          richContent = responseData.richContent || [];
          suggestions = responseData.suggestions || [];
        }

        addMessage({
          role: 'assistant',
          content: responseText,
          coachId: selectedCoachId,
          coachName: coach.name,
          coachIcon: coach.icon,
          richContent: richContent,
        });
        
        // Add follow-up suggestions if provided
        if (suggestions && suggestions.length > 0) {
          addFollowUpSuggestions(suggestions);
        }

        setCoachConversations(prev => ({
          ...prev,
          [selectedCoachId]: [
            ...history,
            { role: 'user', content: message },
            { role: 'assistant', content: responseText }
          ]
        }));
      } catch (error: any) {
        console.error('Error sending coach message:', error);
        addMessage({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
          coachId: selectedCoachId,
          coachName: coach.name,
          coachIcon: coach.icon,
        });
      } finally {
        setIsStreaming(false);
      }
      return;
    }

    // Otherwise, send to financial coach as usual
    const userMessage = (messageText || input.trim());
    if (!userMessage || isStreaming) return;
    
    // Check if user is trying to connect to a coach or responding to connection prompt
    const lowerUserMessage = userMessage.toLowerCase();
    const isConnectionRequest = lowerUserMessage.includes('connect me to zillow') || 
        lowerUserMessage.includes('connect to zillow') ||
        lowerUserMessage.includes('zillow coach') ||
        lowerUserMessage.includes('connect me to carmax') || 
        lowerUserMessage.includes('connect to carmax') ||
        lowerUserMessage.includes('carmax coach');
    
    // Check if user is responding to duration prompt (e.g., "3 days", "24 hours", "7 days")
    const isDurationResponse = /\d+\s*(day|hour|d|h)/i.test(userMessage) || 
        lowerUserMessage.includes('24 hours') || 
        lowerUserMessage.includes('3 days') || 
        lowerUserMessage.includes('7 days') ||
        lowerUserMessage === '3 days is ok' ||
        lowerUserMessage === '24 hours is ok' ||
        lowerUserMessage === '7 days is ok';
    
    if (isConnectionRequest || isDurationResponse) {
      // Check if we have a pending coach recommendation
      if (coachRecommendation) {
        // User is responding to the recommendation - trigger consent modal
        setPendingCoach(coachRecommendation.coach);
        setShowConsentModal(true);
        addMessage({ role: 'user', content: userMessage });
        return;
      } else if (isConnectionRequest) {
        // User is requesting connection directly
        const coaches = await getCoaches();
        if (lowerUserMessage.includes('zillow')) {
          const zillowCoach = coaches.find(c => c.id === 'zillow_coach');
          if (zillowCoach && !activeCoaches.find(ac => ac.coach.id === 'zillow_coach')) {
            setCoachRecommendation({
              coach: zillowCoach,
              reason: 'I can connect you with Zillow Coach to help you search for properties and explore neighborhoods.'
            });
            addMessage({ role: 'user', content: userMessage });
            return;
          }
        } else if (lowerUserMessage.includes('carmax')) {
          const carmaxCoach = coaches.find(c => c.id === 'carmax_coach');
          if (carmaxCoach && !activeCoaches.find(ac => ac.coach.id === 'carmax_coach')) {
            setCoachRecommendation({
              coach: carmaxCoach,
              reason: 'I can connect you with CarMax Coach to help you find a car and explore financing options.'
            });
            addMessage({ role: 'user', content: userMessage });
            return;
          }
        }
      }
    }
    
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsStreaming(true);
    
    // Add typing indicator
    const typingId = addMessage({ 
      role: 'assistant', 
      content: '', 
      isStreaming: true,
      coachId: 'financial_coach',
      coachName: 'Financial Coach',
      coachIcon: '🧠'
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
          // Check for coach recommendations in the response
          const lowerChunk = chunk.toLowerCase();
          if ((lowerChunk.includes('zillow') || lowerChunk.includes('property') || lowerChunk.includes('home search') || lowerChunk.includes('real estate')) && !coachRecommendation) {
            getCoaches().then(coaches => {
              const zillowCoach = coaches.find(c => c.id === 'zillow_coach');
              if (zillowCoach && !activeCoaches.find(ac => ac.coach.id === 'zillow_coach')) {
                setCoachRecommendation({
                  coach: zillowCoach,
                  reason: 'I can connect you with Zillow Coach to help you search for properties and explore neighborhoods.'
                });
              }
            });
          }
          if ((lowerChunk.includes('carmax') || lowerChunk.includes('car') || lowerChunk.includes('auto loan') || lowerChunk.includes('vehicle')) && !coachRecommendation) {
            getCoaches().then(coaches => {
              const carmaxCoach = coaches.find(c => c.id === 'carmax_coach');
              if (carmaxCoach && !activeCoaches.find(ac => ac.coach.id === 'carmax_coach')) {
                setCoachRecommendation({
                  coach: carmaxCoach,
                  reason: 'I can connect you with CarMax Coach to help you find a car and explore financing options.'
                });
              }
            });
          }
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
      
      // Remove typing indicator and set coach info
      updateLastMessage(typingId, fullResponse, false, 'financial_coach', 'Financial Coach', '🧠');
      
      // Check full response for coach recommendations
      const lowerFullResponse = fullResponse.toLowerCase();
      if (!coachRecommendation) {
        if ((lowerFullResponse.includes('zillow') || lowerFullResponse.includes('property') || lowerFullResponse.includes('home search') || lowerFullResponse.includes('real estate')) && !activeCoaches.find(ac => ac.coach.id === 'zillow_coach')) {
          const coaches = await getCoaches();
          const zillowCoach = coaches.find(c => c.id === 'zillow_coach');
          if (zillowCoach) {
            setCoachRecommendation({
              coach: zillowCoach,
              reason: 'I can connect you with Zillow Coach to help you search for properties and explore neighborhoods.'
            });
          }
        } else if ((lowerFullResponse.includes('carmax') || (lowerFullResponse.includes('car') && (lowerFullResponse.includes('loan') || lowerFullResponse.includes('buy') || lowerFullResponse.includes('financing')))) && !activeCoaches.find(ac => ac.coach.id === 'carmax_coach')) {
          const coaches = await getCoaches();
          const carmaxCoach = coaches.find(c => c.id === 'carmax_coach');
          if (carmaxCoach) {
            setCoachRecommendation({
              coach: carmaxCoach,
              reason: 'I can connect you with CarMax Coach to help you find a car and explore financing options.'
            });
          }
        }
      }
      
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
          
          {/* Plaid Integration */}
          <PlaidIntegration
            onAccountsUpdate={(accounts) => {
              // Update user context with connected accounts
              setUserContext((prev: any) => ({
                ...prev,
                accountsConnected: accounts.length,
                connectedAccounts: accounts
              }));
            }}
          />
          
          {/* Goal Management */}
          <GoalManagement
            goals={goals}
            onAddGoal={() => {
              setEditingGoal(undefined);
              setShowGoalWizard(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setShowGoalWizard(true);
            }}
            onDeleteGoal={(id) => {
              setGoals(prev => prev.filter(g => g.id !== id));
            }}
            onToggleStatus={(id) => {
              setGoals(prev => prev.map(g =>
                g.id === id
                  ? { ...g, status: g.status === 'active' ? 'paused' : 'active' }
                  : g
              ));
            }}
          />
          
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
                userId={selectedPersona}
                existingGoals={existingGoalsForOnboarding}
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
            {/* Active Coaches - Sticky at top of chat area */}
            {activeCoaches.length > 0 && (
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-2 -mt-2">
                <ActiveCoaches
                  activeCoaches={activeCoaches}
                  onRemoveCoach={handleRemoveCoach}
                  onSelectCoach={setSelectedCoachId}
                  selectedCoachId={selectedCoachId}
                  onBackToFinancial={() => setSelectedCoachId(undefined)}
                />
              </div>
            )}

            {/* Show selected coach indicator */}
            {selectedCoachId && (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
                <span className="text-lg">
                  {activeCoaches.find(ac => ac.coach.id === selectedCoachId)?.coach.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    Chatting with {activeCoaches.find(ac => ac.coach.id === selectedCoachId)?.coach.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Switch back to Financial Coach or select another coach above
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCoachId(undefined)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Back to Financial Coach
                </button>
              </div>
            )}


            {/* Consent Modal - Inline in chat area */}
            {showConsentModal && pendingCoach && (
              <div className="p-4 bg-background border-2 border-primary/30 rounded-xl shadow-2xl">
                <ConsentModal
                  coach={pendingCoach}
                  userId={selectedPersona}
                  onConsent={handleConsentGranted}
                  onCancel={() => {
                    setShowConsentModal(false);
                    setPendingCoach(null);
                  }}
                />
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble message={msg} />
                {msg.calculationResult && (
                  <>
                    <CalculationCard result={msg.calculationResult} />
                    {/* Show Goal Recommendation if present */}
                    {msg.calculationResult.goal_recommendation && (
                      <GoalRecommendation
                        recommendation={msg.calculationResult.goal_recommendation}
                        onCreate={(goalData) => {
                          const newGoal: Goal = {
                            ...goalData,
                            id: `goal_${Date.now()}`,
                            progress: (goalData.currentAmount / goalData.targetAmount) * 100,
                            status: 'active',
                            icon: goalData.type === 'homeownership' ? '🏠' :
                                  goalData.type === 'retirement' ? '👴' :
                                  goalData.type === 'education' ? '🎓' :
                                  goalData.type === 'debt_payoff' ? '💳' :
                                  goalData.type === 'emergency_fund' ? '🆘' : '🛒',
                            color: goalData.type === 'homeownership' ? 'blue' :
                                   goalData.type === 'retirement' ? 'purple' :
                                   goalData.type === 'education' ? 'green' :
                                   goalData.type === 'debt_payoff' ? 'red' :
                                   goalData.type === 'emergency_fund' ? 'yellow' : 'orange'
                          };
                          setGoals(prev => {
                            // Check if goal already exists (avoid duplicates)
                            const exists = prev.some(g => g.type === newGoal.type && g.status === 'active');
                            if (exists) {
                              // Update existing goal instead
                              return prev.map(g => 
                                g.type === newGoal.type && g.status === 'active'
                                  ? { ...g, ...newGoal, id: g.id } // Keep existing ID
                                  : g
                              );
                            }
                            return [...prev, newGoal];
                          });
                          // Open goal wizard to review/edit the goal
                          setEditingGoal(newGoal);
                          setShowGoalWizard(true);
                        }}
                        onDismiss={() => {
                          // Remove goal recommendation from message
                          // This would require updating the message, but for now we'll just hide it
                        }}
                      />
                    )}
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

            {/* Coach Recommendation - Inline with messages */}
            {coachRecommendation && (
              <CoachRecommendation
                coach={coachRecommendation.coach}
                reason={coachRecommendation.reason}
                onConnect={handleCoachConnect}
                onDismiss={() => setCoachRecommendation(null)}
              />
            )}
            
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

        {/* Consent Modal */}
        {/* Consent Modal - Inline in chat area */}
        {showConsentModal && pendingCoach && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <ConsentModal
              coach={pendingCoach}
              userId={selectedPersona}
              onConsent={handleConsentGranted}
              onCancel={() => {
                setShowConsentModal(false);
                setPendingCoach(null);
              }}
            />
          </div>
        )}
        
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
        
        {/* Goal Wizard */}
        {showGoalWizard && (
          <GoalWizard
            onSave={(goalData) => {
              if (editingGoal) {
                // Update existing goal
                setGoals(prev => prev.map(g =>
                  g.id === editingGoal.id
                    ? {
                        ...g,
                        ...goalData,
                        progress: (goalData.currentAmount / goalData.targetAmount) * 100
                      }
                    : g
                ));
              } else {
                // Add new goal
                const newGoal: Goal = {
                  ...goalData,
                  id: `goal_${Date.now()}`,
                  progress: (goalData.currentAmount / goalData.targetAmount) * 100
                };
                setGoals(prev => [...prev, newGoal]);
              }
              setShowGoalWizard(false);
              setEditingGoal(undefined);
            }}
            onCancel={() => {
              setShowGoalWizard(false);
              setEditingGoal(undefined);
            }}
            existingGoal={editingGoal}
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
