#!/usr/bin/env node

import { createServer } from './src/server.js';
import { exec } from 'child_process';

const PORT = process.env.PORT || 3847;
const URL = `http://localhost:${PORT}`;
const isApiOnly = process.argv.includes('--api-only');

const server = createServer({ apiOnly: isApiOnly });

server.listen(PORT, async () => {
  if (isApiOnly) {
    console.log('\n  claude conversations (API only)');
    console.log(`  API running at ${URL}/api/*\n`);
  } else {
    console.log('\n  claude conversations');
    console.log(`  running at ${URL}\n`);

    // Auto-open browser (only in production mode)
    try {
      const open = await import('open');
      await open.default(URL);
    } catch {
      const cmd = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${cmd} ${URL}`);
    }
  }
});

process.on('SIGINT', () => {
  console.log('\nshutting down...\n');
  server.close(() => process.exit(0));
});
