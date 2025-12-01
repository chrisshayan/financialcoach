'use client';

import { useState } from 'react';

interface ExportShareProps {
  data?: {
    type: 'readiness' | 'dti' | 'spending' | 'action_plan' | 'clv' | 'scenario';
    title: string;
    content: any;
  };
}

export function ExportShare({ data }: ExportShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    if (!data) return;
    
    // Simulate export
    const filename = `financial-coach-${data.type}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data.content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PDF/CSV, show a message (would need libraries like jsPDF or similar)
      alert(`${format.toUpperCase()} export would be generated: ${filename}`);
    }
    
    setIsOpen(false);
  };

  const handleShare = (method: 'email' | 'link') => {
    if (!data) return;
    
    if (method === 'email') {
      const subject = encodeURIComponent(`My ${data.title} - Financial Coach`);
      const body = encodeURIComponent(`Check out my ${data.title} from Financial Coach:\n\n${JSON.stringify(data.content, null, 2)}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      // Generate shareable link (in real app, this would create a secure share link)
      const shareData = btoa(JSON.stringify(data));
      const shareUrl = `${window.location.origin}/share/${shareData}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Shareable link copied to clipboard!');
    }
    
    setIsOpen(false);
  };

  if (!data) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
      >
        <span>📤</span>
        <span>Export/Share</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
              Export
            </div>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📄</span>
              <span>Export as PDF</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              <span>Export as JSON</span>
            </button>
            
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-t border-border mt-1 pt-1">
              Share
            </div>
            <button
              onClick={() => handleShare('email')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>✉️</span>
              <span>Share via Email</span>
            </button>
            <button
              onClick={() => handleShare('link')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔗</span>
              <span>Copy Share Link</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

