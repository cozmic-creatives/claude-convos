<script>
  import { X } from 'lucide-svelte';
  import { reportModal, closeReportModal } from '../stores.js';
  import Button from './Button.svelte';

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeReportModal();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeReportModal();
    }
  }

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

<svelte:window onkeydown={handleKeydown} />

{#if $reportModal.visible}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="modal" onclick={handleBackdropClick} onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-content">
      <div class="modal-header">
        <span>weekly report</span>
        <Button variant="icon" onclick={closeReportModal}><X size={18} strokeWidth={1.5} /></Button>
      </div>
      <div class="modal-body">
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
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal-content {
    background: var(--bg);
    border: 1px solid var(--border);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header span {
    color: var(--text);
    font-size: 0.9rem;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

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
