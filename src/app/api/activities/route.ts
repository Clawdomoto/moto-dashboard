import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parseMemoryFile, Activity } from '@/lib/parseMemory';

const WORKSPACE_PATH = process.env.OPENCLAW_WORKSPACE || 
  join(process.env.HOME || '', '.openclaw', 'workspace');
const MEMORY_PATH = join(WORKSPACE_PATH, 'memory');

export async function GET() {
  try {
    const activities: Activity[] = [];
    
    // Read memory files
    try {
      const files = await readdir(MEMORY_PATH);
      const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
      
      for (const file of mdFiles.slice(0, 7)) { // Last 7 days
        const content = await readFile(join(MEMORY_PATH, file), 'utf-8');
        const parsed = parseMemoryFile(content, file);
        activities.push(...parsed);
      }
    } catch {
      console.log('No memory directory found');
    }
    
    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({ activities, source: MEMORY_PATH });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
