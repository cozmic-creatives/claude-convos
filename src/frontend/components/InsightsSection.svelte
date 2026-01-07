<script>
  import { FileText, Play } from 'lucide-svelte';
  import { insights, generateReport } from '../stores.js';
  import { copyToClipboard, INSIGHT_ICONS } from '../utils.js';
  import Button from './Button.svelte';
</script>

{#if $insights.length > 0}
  <section class="insights">
    <header class="insights-header">
      <span class="insights-title">SMART RESUME</span>
      <Button icon={FileText} onclick={generateReport}>generate report</Button>
    </header>
    <div class="insights-list">
      {#each $insights as insight}
        <div class="insight-item">
          <span class="insight-icon">{INSIGHT_ICONS[insight.type] || '>'}</span>
          <span class="insight-message">{insight.message}</span>
          {#if insight.conversation?.resumeCommand}
            <Button icon={Play} onclick={() => copyToClipboard(insight.conversation.resumeCommand)}>
              resume
            </Button>
          {/if}
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .insights {
    border: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .insights-title {
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .insights-list {
    padding: 8px 16px;
  }

  .insight-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }

  .insight-item:last-child {
    border-bottom: none;
  }

  .insight-icon {
    color: var(--text-muted);
    font-size: 12px;
    width: 12px;
    text-align: center;
  }

  .insight-message {
    flex: 1;
    font-size: 12px;
    color: var(--text-dim);
  }
</style>
