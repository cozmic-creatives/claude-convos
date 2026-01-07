<script>
  import { reportModal, closeReportModal } from '../stores.js';
  import Modal from './Modal.svelte';

  function renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^• /gm, '<li>')
      .replace(/^- /gm, '<li>')
      .replace(/\n/g, '<br>');
  }
</script>

<Modal visible={$reportModal.visible} title="weekly report" onclose={closeReportModal}>
  {#if $reportModal.loading}
    <div class="report-loading">
      <div class="loading-spinner"></div>
      <span>generating report via claude cli...</span>
      <span class="loading-hint">this may take 10-30 seconds</span>
    </div>
  {:else if $reportModal.error}
    <div class="report-error">
      <span class="error-icon">!</span>
      <span>{$reportModal.error}</span>
    </div>
  {:else}
    <div class="report-text">{@html renderMarkdown($reportModal.content)}</div>
  {/if}
</Modal>

<style>
  .report-loading {
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

  .loading-hint {
    font-size: 11px;
    color: var(--text-muted);
  }

  .report-error {
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

  .report-text {
    color: var(--text-dim);
    font-size: 13px;
    line-height: 1.7;
  }

  .report-text :global(strong) {
    color: var(--text);
    font-weight: 500;
  }

  .report-text :global(code) {
    background: var(--border);
    padding: 2px 5px;
    font-size: 12px;
  }

  .report-text :global(li) {
    display: block;
    margin: 12px 0;
    padding-left: 16px;
    position: relative;
  }

  .report-text :global(li)::before {
    content: '>';
    position: absolute;
    left: 0;
    color: var(--text-muted);
  }
</style>
