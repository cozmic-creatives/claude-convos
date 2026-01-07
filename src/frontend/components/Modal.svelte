<script>
  import { X } from 'lucide-svelte';
  import Button from './Button.svelte';

  let { visible = false, title = '', onclose, wide = false, children } = $props();

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onclose?.();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="modal" onclick={handleBackdropClick} onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-content" class:wide>
      <div class="modal-header">
        <span>{title}</span>
        <Button variant="icon" onclick={onclose}><X size={18} strokeWidth={1.5} /></Button>
      </div>
      <div class="modal-body">
        {@render children()}
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

  .modal-content.wide {
    max-width: 900px;
    max-height: 85vh;
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
</style>
