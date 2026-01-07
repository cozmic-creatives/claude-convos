<script>
  import { Play } from 'lucide-svelte';
  import { conversations } from '../stores.js';
  import { formatTimeAgo, copyToClipboard } from '../utils.js';
  import Button from './Button.svelte';

  let latest = $derived($conversations[0] || null);
</script>

{#if latest}
  <div class="continue">
    <div class="continue-info">
      <span class="label">CONTINUE WHERE YOU LEFT OFF</span>
      <span class="project">{latest.project}</span>
      {#if latest.topic}
        <span class="topic">{latest.topic}</span>
      {/if}
      <span class="meta">{formatTimeAgo(latest.lastMessageTime)}</span>
    </div>
    <Button variant="primary" icon={Play} onclick={() => copyToClipboard(latest.resumeCommand)}>
      resume
    </Button>
  </div>
{/if}

<style>
  .continue {
    border: 1px solid var(--border);
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    background: var(--card-bg);
  }

  .continue-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .label {
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .project {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }

  .topic {
    font-size: 12px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 11px;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .continue {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
