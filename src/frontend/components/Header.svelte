<script>
  import { RefreshCw } from 'lucide-svelte';
  import { lastSync, isRefreshing, fetchConversations } from '../stores.js';
  import Button from './Button.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  function formatSyncTime(date) {
    if (!date) return 'loading...';
    return `synced ${date.toLocaleTimeString()}`;
  }

  async function handleRefresh() {
    await fetchConversations(true);
  }
</script>

<header class="header">
  <div class="header-content">
    <h1>CLAUDE CONVERSATIONS</h1>
    <div class="header-meta">
      <ThemeToggle />
      <span class="last-sync">{formatSyncTime($lastSync)}</span>
      <Button icon={RefreshCw} disabled={$isRefreshing} onclick={handleRefresh}>
        {$isRefreshing ? '...' : 'refresh'}
      </Button>
    </div>
  </div>
</header>

<style>
  .header {
    border: 1px solid var(--border);
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  h1 {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: var(--text);
    margin: 0;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--text-dim);
    font-size: 12px;
  }

  @media (max-width: 640px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
