import fs from 'fs';
import path from 'path';

/**
 * Parse a conversation JSONL file and extract user/assistant messages
 * @param {string} sessionId - The conversation session ID
 * @param {string} projectPath - The encoded project path (e.g., "-Users-BRACM-Projects-foo")
 * @returns {Promise<{messages: Array}>} Parsed conversation messages
 */
export async function getConversation(sessionId, projectPath) {
  const claudeDir = path.join(process.env.HOME, '.claude', 'projects');
  const filePath = path.join(claudeDir, projectPath, `${sessionId}.jsonl`);

  if (!fs.existsSync(filePath)) {
    throw new Error('Conversation file not found');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const messages = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      // Only include user and assistant messages
      if (entry.type !== 'user' && entry.type !== 'assistant') continue;

      let text = '';
      if (entry.type === 'user') {
        // User content can be string or array
        if (typeof entry.message?.content === 'string') {
          text = entry.message.content;
        } else if (Array.isArray(entry.message?.content)) {
          text = entry.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');
        }
      } else if (entry.type === 'assistant') {
        // Assistant content is array with text/thinking blocks
        if (Array.isArray(entry.message?.content)) {
          text = entry.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');
        }
      }

      if (text.trim()) {
        messages.push({
          role: entry.type,
          content: text,
          timestamp: entry.timestamp
        });
      }
    } catch {
      // Skip malformed lines
    }
  }

  return { messages };
}
