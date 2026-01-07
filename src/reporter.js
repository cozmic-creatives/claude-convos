import { spawn } from 'child_process';

const REPORT_PROMPT = `You are summarizing a developer's recent Claude Code conversations.

Here are their recent conversations (last 7 days):
{DATA}

Write a brief, friendly status report (3-5 bullet points) summarizing:
- What projects they've been focused on
- Key tasks or features they worked on
- Any patterns you notice (e.g., lots of bug fixes, new features, etc.)

Keep it concise and actionable. Use plain text, no markdown headers.`;

// Prepare minimal data for report (token-efficient)
export function prepareReportData(conversations, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return conversations
    .filter(c => c.lastMessageTime && new Date(c.lastMessageTime).getTime() > cutoff)
    .slice(0, 15)
    .map(c => ({
      project: c.project,
      topic: c.topic?.substring(0, 80),
      branch: c.gitBranch,
      category: c.category,
      daysAgo: Math.floor((Date.now() - new Date(c.lastMessageTime).getTime()) / (24 * 60 * 60 * 1000))
    }));
}

// Generate report using Claude CLI
export function generateReport(conversations) {
  const reportData = prepareReportData(conversations);

  if (reportData.length === 0) {
    return Promise.resolve({ report: 'No recent conversations to summarize.' });
  }

  const prompt = REPORT_PROMPT.replace('{DATA}', JSON.stringify(reportData, null, 2));

  return new Promise((resolve) => {
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      claude.kill();
      resolve({
        error: 'Report generation timed out after 60 seconds. Claude CLI may be unresponsive.'
      });
    }, 60000);

    const claude = spawn('claude', ['-p', prompt, '--no-session-persistence'], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    claude.stdout.on('data', (data) => {
      output += data.toString();
    });

    claude.stderr.on('data', (data) => {
      error += data.toString();
    });

    claude.on('close', (code) => {
      clearTimeout(timeoutId);
      if (timedOut) return;

      if (code !== 0) {
        resolve({
          error: `Claude CLI exited with code ${code}. ${error || 'Make sure Claude CLI is installed and authenticated.'}`
        });
      } else {
        resolve({ report: output.trim() || 'Report generated but was empty.' });
      }
    });

    claude.on('error', (err) => {
      clearTimeout(timeoutId);
      if (timedOut) return;

      if (err.code === 'ENOENT') {
        resolve({
          error: 'Claude CLI not found. Install it with: npm install -g @anthropic-ai/claude-cli'
        });
      } else {
        resolve({
          error: `Could not run Claude CLI: ${err.message}`
        });
      }
    });
  });
}
