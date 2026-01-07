import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanConversations, generateInsights } from './scanner.js';
import { getCategorizer } from './categorizer.js';
import { generateReport } from './reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 60000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

async function getConversations(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data;
  }

  const result = await scanConversations(getCategorizer());

  if (result.conversations) {
    result.insights = generateInsights(result.conversations);
  }

  cache.data = result;
  cache.timestamp = now;

  return cache.data;
}

function serveStatic(req, res, staticDir) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(staticDir, urlPath);
  const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // For SPA routing, serve index.html for non-file requests
      if (err.code === 'ENOENT' && !path.extname(urlPath)) {
        fs.readFile(path.join(staticDir, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent);
        });
        return;
      }
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function createServer(options = {}) {
  const { apiOnly = false } = options;
  const staticDir = path.join(__dirname, '..', 'dist');

  return http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API: Get conversations
    if (req.url === '/api/conversations' || req.url === '/api/refresh') {
      try {
        const data = await getConversations(req.url === '/api/refresh');
        sendJson(res, data);
      } catch (error) {
        sendJson(res, { error: error.message }, 500);
      }
      return;
    }

    // API: Generate report (uses Claude CLI)
    if (req.url === '/api/report' && req.method === 'POST') {
      try {
        const data = await getConversations();
        const result = await generateReport(data.conversations);
        sendJson(res, result);
      } catch (error) {
        sendJson(res, { error: error.message }, 500);
      }
      return;
    }

    // In API-only mode, don't serve static files
    if (apiOnly) {
      res.writeHead(404);
      res.end('Not found (API-only mode)');
      return;
    }

    serveStatic(req, res, staticDir);
  });
}
