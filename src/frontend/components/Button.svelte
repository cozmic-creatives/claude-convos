<script>
  let {
    variant = 'default',  // 'default' | 'primary' | 'icon'
    disabled = false,
    onclick,
    icon: Icon = null,
    children
  } = $props();

  // Icon-only button (no children)
  let iconOnly = $derived(Icon && !children);
</script>

<button
  class="btn {variant}"
  class:has-icon={Icon && !iconOnly}
  class:icon-only={iconOnly}
  {disabled}
  {onclick}
>
  {#if Icon}
    <Icon size={14} strokeWidth={1.5} />
  {/if}
  {@render children?.()}
</button>

<style>
  .btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, opacity 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    height: 26px;
  }

  .btn.has-icon {
    gap: 5px;
  }

  /* Icon-only buttons */
  .btn.icon-only {
    width: 26px;
    padding: 0;
  }

  /* Variants */
  .btn.default:hover:not(:disabled) {
    border-color: var(--text);
    color: var(--text);
  }

  .btn.primary {
    background: var(--text);
    border-color: var(--text);
    color: var(--bg);
    font-weight: 500;
  }

  .btn.primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  /* Icon variant (borderless) */
  .btn.icon {
    background: transparent;
    border: none;
    color: var(--text-dim);
    padding: 4px;
    width: auto;
    height: auto;
  }

  .btn.icon:hover:not(:disabled) {
    color: var(--text);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
