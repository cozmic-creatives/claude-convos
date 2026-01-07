<script>
  import { stats } from '../stores.js';
</script>

<div class="stats-bar">
  <span class="label">STATS</span>
  <span class="stat"><strong>{$stats.total}</strong> total</span>
  <span class="stat"><strong>{$stats.work}</strong> work</span>
  <span class="stat"><strong>{$stats.sideProject}</strong> side</span>
  <span class="stat"><strong>{$stats.other}</strong> other</span>
</div>

<style>
  .stats-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    margin-bottom: 16px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .label {
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .stat strong {
    color: var(--text-dim);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 480px) {
    .stats-bar {
      flex-wrap: wrap;
      gap: 8px 16px;
    }
  }
</style>
