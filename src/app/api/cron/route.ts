import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseCronOutput } from '@/lib/parseMemory';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('openclaw cron list 2>&1');
    const jobs = parseCronOutput(stdout);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    // Return mock data for development
    return NextResponse.json({ 
      jobs: [],
      error: 'Could not fetch cron jobs - ensure openclaw CLI is available'
    });
  }
}
