import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

function findClaudeDir() {
  const claudeDir = path.join(os.homedir(), '.claude');
  return fs.existsSync(claudeDir) ? claudeDir : null;
}

// Convert directory name to original path by checking filesystem
// e.g., "-Users-BRACM-Projects-claude-conversations" -> "/Users/BRACM/Projects/claude-conversations"
function dirNameToPath(dirName) {
  const parts = dirName.replace(/^-/, '').split('-');
  let currentPath = '/';
  let i = 0;

  while (i < parts.length) {
    // Try joining remaining parts progressively to find existing path
    let found = false;
    for (let j = parts.length; j > i; j--) {
      const segment = parts.slice(i, j).join('-');
      const testPath = path.join(currentPath, segment);
      if (fs.existsSync(testPath)) {
        currentPath = testPath;
        i = j;
        found = true;
        break;
      }
    }
    // Fallback: just use single part
    if (!found) {
      currentPath = path.join(currentPath, parts[i]);
      i++;
    }
  }

  return currentPath;
}

// Read first and last N lines efficiently
async function readFirstAndLastLines(filePath, count = 50) {
  const firstLines = [];
  const lastLines = [];

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (firstLines.length < count) {
      firstLines.push(line);
    }
    lastLines.push(line);
    if (lastLines.length > count) {
      lastLines.shift();
    }
  }

  return { firstLines, lastLines, totalLines: lineCount };
}

// Truncate text at word boundary
function truncate(text, maxLength = 120) {
  if (!text) return null;

  const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;

  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > maxLength * 0.7
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Check if a topic is unhelpful (system messages, caveats, etc.)
function isUnhelpfulTopic(text) {
  if (!text || text.length < 10) return true;
  const lower = text.toLowerCase();
  return lower.startsWith('caveat:') ||
         /^<[a-z-]+>/.test(text) ||  // Any XML-like tag at start
         (lower.startsWith('continue') && text.length < 20);
}

// Parse session file and extract metadata
async function parseSession(filePath) {
  const sessionId = path.basename(filePath, '.jsonl');

  // Skip agent files
  if (sessionId.startsWith('agent-')) {
    return null;
  }

  try {
    const { firstLines, lastLines, totalLines } = await readFirstAndLastLines(filePath);

    let slug = null;
    let gitBranch = null;
    let cwd = null;
    let firstUserMessage = null;
    let firstTimestamp = null;
    let lastTimestamp = null;
    let messageCount = 0;

    // Dedupe lines in case file is small
    const allLines = [...new Set([...firstLines, ...lastLines])];

    for (const line of allLines) {
      if (!line.trim()) continue;

      try {
        const entry = JSON.parse(line);

        if (entry.type === 'file-history-snapshot') continue;
        messageCount++;

        if (!slug && entry.slug) slug = entry.slug;
        if (!gitBranch && entry.gitBranch) gitBranch = entry.gitBranch;
        if (!cwd && entry.cwd) cwd = entry.cwd;

        if (entry.timestamp) {
          const ts = new Date(entry.timestamp);
          if (!firstTimestamp || ts < firstTimestamp) firstTimestamp = ts;
          if (!lastTimestamp || ts > lastTimestamp) lastTimestamp = ts;
        }

        // Extract first useful user message as topic
        if (!firstUserMessage && entry.type === 'user' && entry.message?.content) {
          const content = entry.message.content;
          let text = null;

          if (typeof content === 'string') {
            text = content;
          } else if (Array.isArray(content)) {
            const textContent = content.find(c => typeof c === 'string' || c.type === 'text');
            if (textContent) {
              text = typeof textContent === 'string' ? textContent : textContent.text;
            }
          }

          // Skip unhelpful messages
          if (text && !isUnhelpfulTopic(text)) {
            firstUserMessage = text;
          }
        }
      } catch {
        // Skip malformed JSON lines
      }
    }

    // Fallback to file stats for timestamps
    if (!firstTimestamp || !lastTimestamp) {
      const stats = fs.statSync(filePath);
      firstTimestamp = firstTimestamp || stats.birthtime;
      lastTimestamp = lastTimestamp || stats.mtime;
    }

    // Estimate message count (~30% are file-history-snapshot)
    const estimatedMessages = Math.max(messageCount, Math.floor(totalLines * 0.7));

    return {
      id: sessionId,
      slug: slug || sessionId.substring(0, 8),
      cwd,
      gitBranch,
      topic: truncate(firstUserMessage),
      messageCount: estimatedMessages,
      firstMessageTime: firstTimestamp?.toISOString() || null,
      lastMessageTime: lastTimestamp?.toISOString() || null
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Scan all projects and return conversation data
export async function scanConversations(categorizer) {
  const claudeDir = findClaudeDir();

  if (!claudeDir) {
    return {
      error: 'Claude Code directory not found. Make sure Claude Code is installed.',
      claudeDir: null,
      conversations: []
    };
  }

  const projectsDir = path.join(claudeDir, 'projects');

  if (!fs.existsSync(projectsDir)) {
    return {
      error: 'No conversations found. Start using Claude Code to create some!',
      claudeDir,
      conversations: []
    };
  }

  const conversations = [];
  const projectDirs = fs.readdirSync(projectsDir);

  for (const projectDir of projectDirs) {
    const projectPath = path.join(projectsDir, projectDir);
    const stats = fs.statSync(projectPath);

    if (!stats.isDirectory()) continue;

    const originalPath = dirNameToPath(projectDir);
    const projectName = path.basename(originalPath);

    const files = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const session = await parseSession(filePath);

      if (session && session.messageCount > 0) {
        const category = categorizer ? categorizer(originalPath) : 'other';

        conversations.push({
          ...session,
          project: projectName,
          projectPath: originalPath,
          projectDir: projectDir,  // Encoded dir name for file access
          category,
          resumeCommand: `claude --resume ${session.id}`
        });
      }
    }
  }

  // Sort by most recent first
  conversations.sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
    return timeB - timeA;
  });

  const stats = {
    total: conversations.length,
    work: conversations.filter(c => c.category === 'work').length,
    sideProject: conversations.filter(c => c.category === 'sideProject').length,
    other: conversations.filter(c => c.category === 'other').length
  };

  return {
    scannedAt: new Date().toISOString(),
    claudeDir,
    stats,
    conversations
  };
}

// Generate smart insights (no Claude needed - pure data analysis)
export function generateInsights(conversations) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const withTime = conversations.map(c => ({
    ...c,
    lastTime: c.lastMessageTime ? new Date(c.lastMessageTime).getTime() : 0
  }));

  // Stale work: touched 2-7 days ago but not since
  const stale = withTime
    .filter(c => {
      const age = now - c.lastTime;
      return age > 2 * DAY && age < 7 * DAY;
    })
    .slice(0, 3)
    .map(c => ({
      type: 'stale',
      message: `"${c.project}" hasn't been touched in ${Math.floor((now - c.lastTime) / DAY)} days`,
      conversation: c
    }));

  // Hot projects: multiple conversations in last 3 days
  const recent = withTime.filter(c => now - c.lastTime < 3 * DAY);
  const projectCounts = {};
  recent.forEach(c => {
    projectCounts[c.project] = (projectCounts[c.project] || 0) + 1;
  });
  const hot = Object.entries(projectCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([project, count]) => ({
      type: 'hot',
      message: `"${project}" has ${count} active conversations`,
      conversation: recent.find(c => c.project === project)
    }));

  // Recent with branches (likely in-progress features)
  const inProgress = withTime
    .filter(c => c.gitBranch && c.gitBranch !== 'main' && c.gitBranch !== 'master')
    .filter(c => now - c.lastTime < 5 * DAY)
    .slice(0, 3)
    .map(c => ({
      type: 'branch',
      message: `branch "${c.gitBranch}" on ${c.project}`,
      conversation: c
    }));

  return [...hot, ...stale, ...inProgress].slice(0, 5);
}

export { findClaudeDir, parseSession };
