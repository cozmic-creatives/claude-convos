#!/usr/bin/env node

import { createServer } from './src/server.js';
import { exec } from 'child_process';

const PORT = process.env.PORT || 3847;
const URL = `http://localhost:${PORT}`;
const isApiOnly = process.argv.includes('--api-only');

async function openBrowser() {
  try {
    const open = await import('open');
    await open.default(URL);
  } catch {
    const cmd = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} ${URL}`);
  }
}

const server = createServer({ apiOnly: isApiOnly });

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('\n  convos is already running!');
    console.log(`  opening ${URL}\n`);
    openBrowser();
    process.exit(0);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, async () => {
  if (isApiOnly) {
    console.log('\n  claude conversations (API only)');
    console.log(`  API running at ${URL}/api/*\n`);
  } else {
    console.log('\n  claude conversations');
    console.log(`  running at ${URL}\n`);
    openBrowser();
  }
});

process.on('SIGINT', () => {
  console.log('\nshutting down...\n');
  server.close(() => process.exit(0));
});
