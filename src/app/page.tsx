'use client';

import { useState } from 'react';
import ActivityFeed from '@/components/ActivityFeed';
import CalendarView from '@/components/CalendarView';
import GlobalSearch from '@/components/GlobalSearch';

type Tab = 'activity' | 'calendar' | 'search';

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<Tab>('activity');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'activity', label: 'Activity Feed', icon: '📊' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'search', label: 'Search', icon: '🔍' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                🦞
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mission Control</h1>
                <p className="text-xs text-gray-500">OpenClaw Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-400">Connected</span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {activeTab === 'activity' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
              </div>
              <ActivityFeed />
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Scheduled Tasks</h2>
                <span className="text-xs text-gray-500">From OpenClaw cron jobs</span>
              </div>
              <CalendarView />
            </div>
          )}
          
          {activeTab === 'search' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Global Search</h2>
                <span className="text-xs text-gray-500">Search across workspace</span>
              </div>
              <GlobalSearch />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-600">
          Mission Control • OpenClaw Agent Dashboard
        </div>
      </footer>
    </main>
  );
}
