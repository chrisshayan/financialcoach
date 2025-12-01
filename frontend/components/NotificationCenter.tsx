'use client';

import { useState } from 'react';

export interface Notification {
  id: string;
  type: 'milestone' | 'rate_drop' | 'product' | 'alert' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onClearAll, isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const typeColors = {
    milestone: 'bg-green-500/20 text-green-400 border-green-500/30',
    rate_drop: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    product: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    alert: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    achievement: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-4 top-16 w-96 bg-background border border-border rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-primary hover:text-primary/80"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-border flex gap-2 overflow-x-auto">
          {['all', 'milestone', 'rate_drop', 'product', 'achievement'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.read) onMarkAsRead(notification.id);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  notification.read
                    ? 'bg-muted/20 border-border/50 opacity-70'
                    : `bg-muted/40 border-border ${typeColors[notification.type]}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

