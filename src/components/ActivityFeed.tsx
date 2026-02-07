'use client';

import { useEffect, useState } from 'react';

interface Activity {
  timestamp: number;
  actionType: string;
  description: string;
  status: string;
  tokensUsed?: number;
  source: string;
}

const ACTION_ICONS: Record<string, string> = {
  analysis: '📊',
  cron: '⏰',
  message: '💬',
  file: '📄',
  search: '🔍',
  tool: '🔧',
  note: '📝',
};

const ACTION_COLORS: Record<string, string> = {
  analysis: 'bg-purple-500/20 border-purple-500/50',
  cron: 'bg-blue-500/20 border-blue-500/50',
  message: 'bg-green-500/20 border-green-500/50',
  file: 'bg-yellow-500/20 border-yellow-500/50',
  search: 'bg-cyan-500/20 border-cyan-500/50',
  tool: 'bg-orange-500/20 border-orange-500/50',
  note: 'bg-gray-500/20 border-gray-500/50',
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setActivities(data.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No activities found. Check ~/.openclaw/workspace/memory/ for logs.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, idx) => (
        <div
          key={`${activity.timestamp}-${idx}`}
          className={`p-4 rounded-lg border ${ACTION_COLORS[activity.actionType] || ACTION_COLORS.note} transition-all hover:scale-[1.01]`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ACTION_ICONS[activity.actionType] || '📝'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white capitalize">{activity.actionType}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                    activity.status === 'failed' ? 'bg-red-500/30 text-red-300' :
                    'bg-yellow-500/30 text-yellow-300'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">{activity.description}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{new Date(activity.timestamp).toLocaleTimeString()}</div>
              <div>{new Date(activity.timestamp).toLocaleDateString()}</div>
              {activity.tokensUsed && (
                <div className="text-cyan-400 mt-1">{activity.tokensUsed.toLocaleString()} tokens</div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono">{activity.source}</div>
        </div>
      ))}
    </div>
  );
}
