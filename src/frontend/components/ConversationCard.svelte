<script>
  import { Play, GitBranch, Check } from 'lucide-svelte';
  import { formatTimeAgo, copyToClipboard } from '../utils.js';
  import Button from './Button.svelte';

  let { conversation, compact = false } = $props();
  let copying = $state(false);

  async function copyCommand() {
    const success = await copyToClipboard(conversation.resumeCommand);
    if (success) {
      copying = true;
      setTimeout(() => copying = false, 1500);
    }
  }
</script>

<div class="card" class:compact>
  <div class="header">
    <span class="project">{conversation.project || 'unknown'}</span>
    <span class="time">{formatTimeAgo(conversation.lastMessageTime)}</span>
  </div>

  {#if conversation.topic}
    <div class="topic">{conversation.topic}</div>
  {/if}

  <div class="footer">
    <div class="meta">
      {#if conversation.gitBranch}
        <span class="branch"><GitBranch size={11} strokeWidth={1.5} />{conversation.gitBranch}</span>
      {/if}
      <span class="msgs">{conversation.messageCount || 0} msgs</span>
    </div>
    <Button icon={copying ? Check : Play} onclick={copyCommand}>
      {copying ? 'copied' : 'resume'}
    </Button>
  </div>
</div>

<style>
  .card {
    border: 1px solid var(--border);
    border-bottom: none;
    padding: 12px 14px;
    transition: background 0.15s;
  }

  .card:last-child {
    border-bottom: 1px solid var(--border);
  }

  .card:hover {
    background: var(--card-bg);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .project {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }

  .time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .topic {
    font-size: 12px;
    color: var(--text-dim);
    margin: 6px 0;
    line-height: 1.4;
    max-height: 34px;
    overflow: hidden;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .meta {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: var(--text-muted);
    min-width: 0;
    overflow: hidden;
  }

  .branch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .msgs {
    white-space: nowrap;
  }

  /* Compact mode for grid */
  .compact {
    padding: 10px 12px;
  }

  .compact .project {
    font-size: 12px;
  }

  .compact .topic {
    font-size: 11px;
    margin: 4px 0;
    max-height: 28px;
  }

  .compact .branch {
    flex: 1;
  }
</style>
