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
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border text-card-foreground shadow-sm'
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
