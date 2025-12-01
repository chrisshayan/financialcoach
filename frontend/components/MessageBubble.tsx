'use client';

import { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
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
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {message.isStreaming && (
          <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
