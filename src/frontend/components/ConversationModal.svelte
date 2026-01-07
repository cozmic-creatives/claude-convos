<script>
  import { conversationModal, closeConversationModal } from '../stores.js';
  import { formatTimeAgo } from '../utils.js';
  import Modal from './Modal.svelte';

  function getTitle() {
    const conv = $conversationModal.conversation;
    if (!conv) return 'conversation';
    return conv.project || 'conversation';
  }
</script>

<Modal visible={$conversationModal.visible} title={getTitle()} onclose={closeConversationModal} wide>
  {#if $conversationModal.loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>loading conversation...</span>
    </div>
  {:else if $conversationModal.error}
    <div class="error">
      <span class="error-icon">!</span>
      <span>{$conversationModal.error}</span>
    </div>
  {:else}
    <div class="conversation-header">
      {#if $conversationModal.conversation?.topic}
        <div class="topic">{$conversationModal.conversation.topic}</div>
      {/if}
      <div class="meta">
        <span>{$conversationModal.messages.length} messages</span>
        {#if $conversationModal.conversation?.lastMessageTime}
          <span>last active {formatTimeAgo($conversationModal.conversation.lastMessageTime)}</span>
        {/if}
      </div>
    </div>
    <div class="messages">
      {#each $conversationModal.messages as message}
        <div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
          <div class="message-role">{message.role}</div>
          <div class="message-content">{message.content}</div>
        </div>
      {/each}
    </div>
  {/if}
</Modal>

<style>
  .loading {
    color: var(--text-dim);
    text-align: center;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-top-color: var(--text);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    color: var(--text);
    text-align: center;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .error-icon {
    width: 32px;
    height: 32px;
    border: 2px solid var(--text-dim);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: var(--text-dim);
  }

  .conversation-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .topic {
    color: var(--text);
    font-size: 11px;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .meta {
    display: flex;
    gap: 12px;
    font-size: 10px;
    color: var(--text-muted);
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .message {
    padding: 8px 10px;
    border: 1px solid var(--border);
  }

  .message.user {
    background: var(--card-bg);
    border-left: 2px solid var(--text-muted);
  }

  .message.assistant {
    background: transparent;
    border-left: 2px solid var(--text-dim);
  }

  .message-role {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .message-content {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message.user .message-content {
    color: var(--text);
  }
</style>
