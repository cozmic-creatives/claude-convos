<script>
  import { toast } from '../stores.js';
</script>

<div class="toast" class:show={$toast.visible}>
  {$toast.message}
</div>

<style>
  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--text);
    color: var(--bg);
    padding: 0.75rem 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    z-index: 1000;
  }

  .toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
</style>
