export interface Activity {
  timestamp: number;
  actionType: string;
  description: string;
  status: string;
  tokensUsed?: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export function parseMemoryFile(content: string, fileName: string): Activity[] {
  const activities: Activity[] = [];
  const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  const fileDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
  
  // Split by headers (## or ###)
  const sections = content.split(/(?=^##\s)/m).filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headerLine = lines[0];
    
    // Parse header like "## Backtest Audit Complete (14:58 EST)"
    const headerMatch = headerLine.match(/^##\s*(.+?)(?:\s*\((\d{1,2}:\d{2})\s*(AM|PM|EST|PST|UTC)?\))?$/i);
    if (!headerMatch) continue;
    
    const title = headerMatch[1].trim();
    const timeStr = headerMatch[2] || '12:00';
    
    // Parse time
    let hours = parseInt(timeStr.split(':')[0]);
    const minutes = parseInt(timeStr.split(':')[1]);
    const ampm = headerMatch[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const timestamp = new Date(`${fileDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`).getTime();
    
    // Determine action type from content
    let actionType = 'note';
    const contentLower = section.toLowerCase();
    if (contentLower.includes('backtest') || contentLower.includes('analysis')) actionType = 'analysis';
    else if (contentLower.includes('cron') || contentLower.includes('scheduled')) actionType = 'cron';
    else if (contentLower.includes('message') || contentLower.includes('sent')) actionType = 'message';
    else if (contentLower.includes('file') || contentLower.includes('created') || contentLower.includes('updated')) actionType = 'file';
    else if (contentLower.includes('search') || contentLower.includes('research')) actionType = 'search';
    else if (contentLower.includes('tool') || contentLower.includes('exec') || contentLower.includes('browser')) actionType = 'tool';
    
    // Extract description (first non-header paragraph)
    const descriptionLines = lines.slice(1).filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*'));
    const description = descriptionLines.slice(0, 2).join(' ').trim() || title;
    
    activities.push({
      timestamp,
      actionType,
      description: description.slice(0, 500),
      status: 'completed',
      source: `memory/${fileName}`,
    });
  }
  
  return activities;
}

export function parseCronOutput(output: string): Array<{
  jobId: string;
  name: string;
  schedule: string;
  scheduleHuman: string;
  nextRun?: string;
  lastRun?: string;
  status: string;
  target: string;
  agent: string;
}> {
  const jobs: Array<{
    jobId: string;
    name: string;
    schedule: string;
    scheduleHuman: string;
    nextRun?: string;
    lastRun?: string;
    status: string;
    target: string;
    agent: string;
  }> = [];
  
  const lines = output.split('\n').filter(l => l.trim());
  
  // Find header line to get column positions
  const headerLine = lines.find(l => l.startsWith('ID'));
  if (!headerLine) return jobs;
  
  // Get column positions from header
  const cols = {
    id: headerLine.indexOf('ID'),
    name: headerLine.indexOf('Name'),
    schedule: headerLine.indexOf('Schedule'),
    next: headerLine.indexOf('Next'),
    last: headerLine.indexOf('Last'),
    status: headerLine.indexOf('Status'),
    target: headerLine.indexOf('Target'),
    agent: headerLine.indexOf('Agent'),
  };
  
  for (const line of lines) {
    if (line.startsWith('ID') || !line.trim()) continue;
    
    // Parse fixed-width columns
    const jobId = line.slice(cols.id, cols.name).trim();
    const name = line.slice(cols.name, cols.schedule).trim();
    const schedule = line.slice(cols.schedule, cols.next).trim();
    const nextRun = line.slice(cols.next, cols.last).trim();
    const lastRun = line.slice(cols.last, cols.status).trim();
    const status = line.slice(cols.status, cols.target).trim();
    const target = line.slice(cols.target, cols.agent).trim();
    const agent = line.slice(cols.agent).trim();
    
    if (!jobId) continue;
    
    jobs.push({
      jobId,
      name,
      schedule,
      scheduleHuman: parseCronToHuman(schedule),
      nextRun: nextRun && nextRun !== '-' ? nextRun : undefined,
      lastRun: lastRun && lastRun !== '-' ? lastRun : undefined,
      status: status || 'unknown',
      target: target || 'isolated',
      agent: agent || 'main',
    });
  }
  
  return jobs;
}

function parseCronToHuman(schedule: string): string {
  // Handle "cron 0 18 * * 1-5 @ America/New_York" format
  const cronMatch = schedule.match(/cron\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/);
  if (!cronMatch) {
    // Handle "every Xms" format
    const everyMatch = schedule.match(/every\s+(\d+)(ms|s|m|h)/i);
    if (everyMatch) {
      const value = parseInt(everyMatch[1]);
      const unit = everyMatch[2].toLowerCase();
      const units: Record<string, string> = { ms: 'milliseconds', s: 'seconds', m: 'minutes', h: 'hours' };
      return `Every ${value} ${units[unit] || unit}`;
    }
    return schedule;
  }
  
  const [, minute, hour, dayOfMonth, month, dayOfWeek] = cronMatch;
  
  const days: Record<string, string> = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday',
    '1-5': 'weekdays', '0,6': 'weekends', '*': 'day'
  };
  
  const dayStr = days[dayOfWeek] || `day ${dayOfWeek}`;
  const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  
  if (dayOfMonth === '*' && month === '*') {
    return `${timeStr} every ${dayStr}`;
  }
  
  return `${timeStr} on ${dayStr}`;
}
