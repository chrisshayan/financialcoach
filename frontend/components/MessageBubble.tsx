'use client';

import { Message, RichContent } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { CreditDashboard } from './CreditDashboard';
import { CreditImprovementPlan } from './CreditImprovementPlan';
import { CreditMonitoringDashboard } from './CreditMonitoringDashboard';
import { CreditCardComparison } from './CreditCardComparison';

interface MessageBubbleProps {
  message: Message;
  onOpenCreditSimulator?: (data: any) => void;
}

function getCoachAvatar(coachId?: string, coachIcon?: string): { icon: string; bgColor: string } {
  if (coachId === 'zillow_coach') {
    return { icon: '🏠', bgColor: 'bg-blue-500/20' };
  }
  if (coachId === 'carmax_coach') {
    return { icon: '🚗', bgColor: 'bg-orange-500/20' };
  }
  if (coachId === 'credit_karma_coach') {
    return { icon: '💳', bgColor: 'bg-purple-500/20' };
  }
  // Financial Coach (default)
  return { icon: '🧠', bgColor: 'bg-primary/20' };
}

function CreditSimulatorTrigger({ data, onOpen }: { data: any; onOpen: (data: any) => void }) {
  return (
    <div className="p-4 bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Credit Score Simulator
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            See how different actions affect your credit score
          </p>
        </div>
        <button
          onClick={() => onOpen(data)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Open Simulator
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Current Score:</span>
          <span className="ml-2 font-semibold text-foreground">{data.currentScore}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Credit Utilization:</span>
          <span className="ml-2 font-semibold text-foreground">{data.creditUtilization.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function RichContentRenderer({ content, onOpenCreditSimulator }: { content: RichContent; onOpenCreditSimulator?: (data: any) => void }) {
  const [showOverlay, setShowOverlay] = useState(false);

  switch (content.type) {
    case 'link':
      return (
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block p-4 bg-gradient-to-r from-blue-950/30 to-blue-900/20 border border-blue-800/50 rounded-lg hover:border-blue-700/70 transition-all group"
        >
          <div className="flex items-start gap-3">
            {content.thumbnail && (
              <img src={content.thumbnail} alt={content.title} className="w-16 h-16 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">
                {content.title || 'Learn More'}
              </div>
              {content.description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{content.description}</div>
              )}
              <div className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                <span>🔗</span>
                <span className="truncate">{content.url}</span>
              </div>
            </div>
          </div>
        </a>
      );

    case 'youtube':
      const videoId = content.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return (
        <div className="mt-3">
          {videoId ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={content.title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gradient-to-r from-red-950/30 to-red-900/20 border border-red-800/50 rounded-lg hover:border-red-700/70 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">▶️</span>
                <div>
                  <div className="text-sm font-semibold text-red-300">{content.title || 'Watch Video'}</div>
                  {content.description && (
                    <div className="text-xs text-muted-foreground mt-1">{content.description}</div>
                  )}
                </div>
              </div>
            </a>
          )}
        </div>
      );

    case 'overlay':
      return (
        <>
          <button
            onClick={() => setShowOverlay(true)}
            className="mt-3 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-sm font-medium text-primary transition-colors"
          >
            {content.title || 'View Details'}
          </button>
          {showOverlay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowOverlay(false)}>
              <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{content.title || 'Details'}</h3>
                  <button
                    onClick={() => setShowOverlay(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {content.description && (
                  <div className="text-sm text-muted-foreground mb-4">{content.description}</div>
                )}
                {content.data && (
                  <div className="space-y-2">
                    {Object.entries(content.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );

    case 'card':
      return (
        <div className="mt-3 p-4 bg-gradient-to-br from-card/50 to-card/30 border border-border rounded-lg">
          {content.image && (
            <img
              src={content.image}
              alt={content.title || 'Card image'}
              className="w-full h-48 object-cover rounded-lg mb-3 border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="text-sm font-semibold mb-2">{content.title}</div>
          {content.description && (
            <div className="text-xs text-muted-foreground mb-3">{content.description}</div>
          )}
          {content.data && (
            <div className="space-y-2">
              {Object.entries(content.data).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          {content.url && (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-primary hover:text-primary/80 underline"
            >
              View Details →
            </a>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="mt-3">
          <img
            src={content.image || content.thumbnail}
            alt={content.title || 'Image'}
            className="w-full rounded-lg border border-border shadow-md"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {content.title && (
            <div className="text-xs text-muted-foreground mt-2">{content.title}</div>
          )}
        </div>
      );

    case 'property_listing':
      return (
        <div className="mt-3 p-4 bg-gradient-to-br from-blue-950/30 to-blue-900/20 border border-blue-800/50 rounded-lg hover:border-blue-700/70 transition-all">
          <div className="flex gap-4">
            {content.image && (
              <img
                src={content.image}
                alt={content.title || 'Property'}
                className="w-32 h-32 object-cover rounded-lg border border-blue-800/50"
                onError={(e) => {
                  // Fallback to placeholder
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Property';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-blue-300 mb-1">{content.title}</div>
              {content.price && (
                <div className="text-lg font-bold text-blue-200 mb-2">{content.price}</div>
              )}
              {content.location && (
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <span>📍</span>
                  <span>{content.location}</span>
                </div>
              )}
              {content.features && content.features.length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {content.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
              {content.url && (
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  View on Zillow →
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case 'credit_dashboard':
      return (
        <div className="mt-3">
          <CreditDashboard data={content.data} />
        </div>
      );

    case 'credit_improvement_plan':
      return (
        <div className="mt-3">
          <CreditImprovementPlan
            currentScore={content.data.currentScore}
            actions={content.data.actions}
          />
        </div>
      );

    case 'credit_score_simulator':
      return (
        <div className="mt-3">
          <CreditSimulatorTrigger 
            data={content.data} 
            onOpen={onOpenCreditSimulator || (() => {})}
          />
        </div>
      );

    case 'credit_monitoring_dashboard':
      return (
        <div className="mt-3">
          <CreditMonitoringDashboard
            currentScore={content.data.currentScore}
            creditUtilization={content.data.creditUtilization}
            scoreHistory={content.data.scoreHistory}
            alerts={content.data.alerts}
            perCardUtilization={content.data.perCardUtilization}
          />
        </div>
      );

    case 'credit_card_comparison':
      return (
        <div className="mt-3">
          <CreditCardComparison cards={content.cards || []} />
        </div>
      );

    default:
      return null;
  }
}

export function MessageBubble({ message, onOpenCreditSimulator }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const avatar = !isUser ? getCoachAvatar(message.coachId, message.coachIcon) : null;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 gap-3`}>
      {!isUser && avatar && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${avatar.bgColor} flex items-center justify-center text-xl shadow-md`}>
          {avatar.icon}
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 transition-all duration-200 ${
          isUser
            ? 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/20'
            : 'bg-gradient-to-br from-card via-card/95 to-card/90 border border-border text-card-foreground shadow-md backdrop-blur-sm'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            <div className="markdown-content prose prose-invert prose-blue max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Simplify action plan mentions since structured version is shown
                  h2: ({node, ...props}: any) => {
                    const text = props.children?.toString() || '';
                    if (text.toLowerCase().includes('action plan') || 
                        text.toLowerCase().includes('priority actions') ||
                        text.toLowerCase().includes('milestones')) {
                      return null; // Hide these headings, ActionPlan component will show them
                    }
                    return <h2 {...props} />;
                  },
                  a: ({node, ...props}: any) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline" />
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.richContent && message.richContent.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.richContent.map((content, idx) => (
                  <RichContentRenderer key={idx} content={content} onOpenCreditSimulator={onOpenCreditSimulator} />
                ))}
              </div>
            )}
          </>
        )}
        {message.isStreaming && (
          <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse ml-1" />
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
          You
        </div>
      )}
    </div>
  );
}
