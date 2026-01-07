import { writable, derived } from 'svelte/store';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Core data
export const conversations = writable([]);
export const insights = writable([]);
export const stats = writable({ total: 0, work: 0, sideProject: 0, other: 0 });
export const lastSync = writable(null);

// Filters (default to today)
export const filters = writable({
  category: 'all',
  time: 'today',
  search: ''
});

// UI state
export const toast = writable({ message: '', visible: false });
export const reportModal = writable({ visible: false, content: '', loading: false, error: null });
export const isRefreshing = writable(false);
export const viewMode = writable('list'); // 'list' | 'grid'

// Derived: filtered conversations
export const filteredConversations = derived(
  [conversations, filters],
  ([$conversations, $filters]) => {
    return $conversations.filter(conv => {
      // Category filter
      if ($filters.category !== 'all' && conv.category !== $filters.category) {
        return false;
      }

      // Time filter
      if ($filters.time !== 'all' && conv.lastMessageTime) {
        const date = new Date(conv.lastMessageTime);
        const now = Date.now();

        if ($filters.time === 'today' && date.toDateString() !== new Date().toDateString()) return false;
        if ($filters.time === 'week' && date < new Date(now - 7 * MS_PER_DAY)) return false;
        if ($filters.time === 'month' && date < new Date(now - 30 * MS_PER_DAY)) return false;
      }

      // Search filter
      if ($filters.search) {
        const q = $filters.search.toLowerCase();
        const fields = [conv.project, conv.topic, conv.gitBranch, conv.slug];
        if (!fields.some(f => f?.toLowerCase().includes(q))) return false;
      }

      return true;
    });
  }
);

// Toast helper
export function showToast(message, duration = 2000) {
  toast.set({ message, visible: true });
  setTimeout(() => toast.set({ message: '', visible: false }), duration);
}

// API functions
export async function fetchConversations(refresh = false) {
  isRefreshing.set(true);

  try {
    const res = await fetch(refresh ? '/api/refresh' : '/api/conversations');
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    conversations.set(data.conversations || []);
    stats.set(data.stats || { total: 0, work: 0, sideProject: 0, other: 0 });
    insights.set(data.insights || []);
    if (data.scannedAt) lastSync.set(new Date(data.scannedAt));
    if (refresh) showToast('refreshed');
  } finally {
    isRefreshing.set(false);
  }
}

export async function generateReport() {
  reportModal.set({ visible: true, content: '', loading: true, error: null });

  try {
    const res = await fetch('/api/report', { method: 'POST' });
    const data = await res.json();

    reportModal.update(m => ({
      ...m,
      loading: false,
      content: data.report || '',
      error: data.error || null
    }));
  } catch {
    reportModal.update(m => ({ ...m, loading: false, error: 'failed to generate report' }));
  }
}

export function closeReportModal() {
  reportModal.set({ visible: false, content: '', loading: false, error: null });
}
