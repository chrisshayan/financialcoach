'use client';

import { useState } from 'react';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  weeklyDigest: boolean;
  milestoneAlerts: boolean;
  productRecommendations: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    weeklyDigest: true,
    milestoneAlerts: true,
    productRecommendations: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: 'USD',
    language: 'en'
  });

  if (!isOpen) return null;

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border z-50 overflow-y-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <div className="text-sm font-medium text-foreground">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">Receive updates via email</div>
                </div>
                <button
                  onClick={() => toggleNotification('email')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <div className="text-sm font-medium text-foreground">SMS Notifications</div>
                  <div className="text-xs text-muted-foreground">Receive text message alerts</div>
                </div>
                <button
                  onClick={() => toggleNotification('sms')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.sms ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <div className="text-sm font-medium text-foreground">Push Notifications</div>
                  <div className="text-xs text-muted-foreground">Browser push notifications</div>
                </div>
                <button
                  onClick={() => toggleNotification('push')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-foreground">Weekly Digest</span>
                  <button
                    onClick={() => toggleNotification('weeklyDigest')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notifications.weeklyDigest ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-foreground">Milestone Alerts</span>
                  <button
                    onClick={() => toggleNotification('milestoneAlerts')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notifications.milestoneAlerts ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.milestoneAlerts ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-foreground">Product Recommendations</span>
                  <button
                    onClick={() => toggleNotification('productRecommendations')}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      notifications.productRecommendations ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.productRecommendations ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Preferences</h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <label className="text-sm font-medium text-foreground mb-2 block">Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Data & Privacy</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                📥 Export My Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                🔒 Privacy Settings
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                🗑️ Delete Account
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}

