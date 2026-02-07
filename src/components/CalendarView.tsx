'use client';

import { useEffect, useState } from 'react';

interface CronJob {
  jobId: string;
  name: string;
  schedule: string;
  scheduleHuman: string;
  nextRun?: string;
  lastRun?: string;
  status: string;
  target: string;
  agent: string;
}

const STATUS_COLORS: Record<string, string> = {
  ok: 'bg-green-500',
  enabled: 'bg-green-500',
  disabled: 'bg-gray-500',
  error: 'bg-red-500',
  running: 'bg-blue-500',
};

export default function CalendarView() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'week'>('list');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/cron');
        const data = await res.json();
        if (data.error && data.jobs?.length === 0) {
          setError(data.error);
        }
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
    const interval = setInterval(fetchJobs, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Generate week days
  const weekDays = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDays.push(date);
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-white/5 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'list' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'week' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Week View
        </button>
      </div>

      {error && (
        <div className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {view === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No scheduled jobs found. Use <code className="bg-white/10 px-2 py-1 rounded">openclaw cron</code> to create jobs.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.jobId}
                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[job.status] || STATUS_COLORS.disabled}`} />
                    <div>
                      <div className="font-medium text-white">{job.name}</div>
                      <div className="text-sm text-cyan-400">{job.scheduleHuman}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {job.nextRun && (
                      <div className="text-green-400">Next: {job.nextRun}</div>
                    )}
                    {job.lastRun && (
                      <div className="text-gray-500">Last: {job.lastRun}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 rounded bg-white/10 text-gray-400">
                    Target: {job.target}
                  </span>
                  <span className="px-2 py-1 rounded bg-white/10 text-gray-400">
                    Agent: {job.agent}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono truncate">{job.schedule}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Week View */
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                idx === 0 ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${idx === 0 ? 'text-cyan-400' : 'text-white'}`}>
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {jobs.slice(0, 2).map((job) => (
                  <div
                    key={job.jobId}
                    className="text-xs p-1 rounded bg-white/10 truncate"
                    title={job.name}
                  >
                    {job.name}
                  </div>
                ))}
                {jobs.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{jobs.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
