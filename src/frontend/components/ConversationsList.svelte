<script>
  import { filteredConversations, viewMode } from '../stores.js';
  import ConversationCard from './ConversationCard.svelte';
</script>

<div class="conversations" class:grid={$viewMode === 'grid'}>
  {#if $filteredConversations.length === 0}
    <div class="no-results">
      <div class="empty-state">
        <h2>no conversations found</h2>
        <p>try adjusting your filters or search query</p>
      </div>
    </div>
  {:else}
    {#each $filteredConversations as conversation, i (conversation.id + '-' + i)}
      <ConversationCard {conversation} compact={$viewMode === 'grid'} />
    {/each}
  {/if}
</div>

<style>
  .conversations {
    display: flex;
    flex-direction: column;
  }

  .conversations.grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
  }

  .conversations.grid :global(.card) {
    border: 1px solid var(--border);
    margin: -1px 0 0 -1px;
  }

  .no-results {
    text-align: center;
    padding: 48px 16px;
    color: var(--text-dim);
    border: 1px solid var(--border);
  }

  .conversations.grid .no-results {
    grid-column: 1 / -1;
  }

  .empty-state h2 {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 8px 0;
    color: var(--text);
  }

  .empty-state p {
    color: var(--text-muted);
    font-size: 12px;
    margin: 0;
  }

  @media (max-width: 900px) {
    .conversations.grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .conversations.grid {
      grid-template-columns: 1fr;
    }
  }
</style>
