import { showToast } from './stores.js';

// Format relative time
export function formatTimeAgo(dateString) {
  if (!dateString) return 'unknown';

  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;

  return date.toLocaleDateString();
}

// Copy to clipboard with toast feedback
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('copied to clipboard');
    return true;
  } catch {
    showToast('failed to copy');
    return false;
  }
}

// Insight type icons
export const INSIGHT_ICONS = {
  hot: '~',
  stale: '!',
  branch: '>'
};
