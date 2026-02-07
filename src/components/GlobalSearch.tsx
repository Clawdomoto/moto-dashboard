'use client';

import { useState, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface SearchResult {
  filePath: string;
  fileName: string;
  snippet: string;
  lineNumber: number;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setTotal(0);
        setSearched(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
        setSearched(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 300),
    [performSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-500/50 text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search memory files, documents, configs..."
          className="w-full px-4 py-3 pl-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results Count */}
      {searched && (
        <div className="text-sm text-gray-400">
          {total > 0 ? (
            <>
              Found <span className="text-cyan-400 font-medium">{total}</span> result{total !== 1 && 's'}
              {total > results.length && ` (showing ${results.length})`}
            </>
          ) : (
            <span>No results found for &ldquo;{query}&rdquo;</span>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, idx) => (
          <div
            key={`${result.filePath}-${result.lineNumber}-${idx}`}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {result.fileName.endsWith('.md') ? '📄' : 
                 result.fileName.endsWith('.json') ? '📦' : '📝'}
              </span>
              <span className="font-medium text-cyan-400">{result.fileName}</span>
              <span className="text-xs text-gray-500">line {result.lineNumber}</span>
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded overflow-x-auto">
              {highlightMatch(result.snippet, query)}
            </pre>
            <div className="text-xs text-gray-500 mt-2 font-mono">{result.filePath}</div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!searched && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p>Search across your OpenClaw workspace</p>
          <p className="text-sm mt-2">
            Includes MEMORY.md, daily logs, AGENTS.md, SOUL.md, and more
          </p>
        </div>
      )}
    </div>
  );
}
