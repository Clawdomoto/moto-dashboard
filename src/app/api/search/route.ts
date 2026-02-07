import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

const WORKSPACE_PATH = process.env.OPENCLAW_WORKSPACE || 
  join(process.env.HOME || '', '.openclaw', 'workspace');

interface SearchResult {
  filePath: string;
  fileName: string;
  snippet: string;
  lineNumber: number;
}

async function searchInFile(filePath: string, query: string, basePath: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      // Get context (2 lines before and after)
      const start = Math.max(0, i - 2);
      const end = Math.min(lines.length, i + 3);
      const snippet = lines.slice(start, end).join('\n');
      
      results.push({
        filePath: relative(basePath, filePath),
        fileName: filePath.split('/').pop() || '',
        snippet,
        lineNumber: i + 1,
      });
    }
  }
  
  return results;
}

async function walkDir(dir: string, files: string[] = []): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await walkDir(fullPath, files);
      } else if (entry.endsWith('.md') || entry.endsWith('.txt') || entry.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore permission errors
  }
  
  return files;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], error: 'Query too short' });
  }
  
  try {
    const allResults: SearchResult[] = [];
    
    // Search priority files first
    const priorityFiles = ['AGENTS.md', 'SOUL.md', 'USER.md', 'TOOLS.md', 'MEMORY.md'];
    
    for (const file of priorityFiles) {
      try {
        const results = await searchInFile(join(WORKSPACE_PATH, file), query, WORKSPACE_PATH);
        allResults.push(...results);
      } catch {
        // File doesn't exist
      }
    }
    
    // Search memory directory
    const memoryPath = join(WORKSPACE_PATH, 'memory');
    try {
      const memoryFiles = await walkDir(memoryPath);
      for (const file of memoryFiles) {
        const results = await searchInFile(file, query, WORKSPACE_PATH);
        allResults.push(...results);
      }
    } catch {
      // Memory dir doesn't exist
    }
    
    // Search other workspace files
    const otherFiles = await walkDir(WORKSPACE_PATH);
    for (const file of otherFiles.slice(0, 100)) { // Limit for performance
      if (!file.includes('/memory/') && !priorityFiles.some(pf => file.endsWith(pf))) {
        const results = await searchInFile(file, query, WORKSPACE_PATH);
        allResults.push(...results);
      }
    }
    
    return NextResponse.json({ 
      results: allResults.slice(0, 50),
      total: allResults.length,
      workspace: WORKSPACE_PATH 
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
