<script>
  import { Search, List, LayoutGrid } from 'lucide-svelte';
  import { filters, viewMode } from '../stores.js';

  const categories = [
    { value: 'all', label: 'all' },
    { value: 'work', label: 'work' },
    { value: 'sideProject', label: 'side' },
    { value: 'other', label: 'other' }
  ];

  const times = [
    { value: 'all', label: 'all' },
    { value: 'today', label: 'today' },
    { value: 'week', label: 'week' },
    { value: 'month', label: 'month' }
  ];

  function setCategory(value) {
    filters.update(f => ({ ...f, category: value }));
  }

  function setTime(value) {
    filters.update(f => ({ ...f, time: value }));
  }

  function setSearch(e) {
    filters.update(f => ({ ...f, search: e.target.value }));
  }
</script>

<div class="filters">
  <div class="filter-group">
    <span class="filter-label">CATEGORY</span>
    <div class="filter-pills">
      {#each categories as cat}
        <button
          class="pill"
          class:active={$filters.category === cat.value}
          onclick={() => setCategory(cat.value)}
        >
          {cat.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-group">
    <span class="filter-label">TIME</span>
    <div class="filter-pills">
      {#each times as t}
        <button
          class="pill"
          class:active={$filters.time === t.value}
          onclick={() => setTime(t.value)}
        >
          {t.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-group search-group">
    <div class="search-wrapper">
      <Search size={14} strokeWidth={1.5} />
      <input
        type="text"
        placeholder="search..."
        value={$filters.search}
        oninput={setSearch}
      />
    </div>
  </div>

  <div class="filter-group view-toggle">
    <button
      class="pill icon-pill"
      class:active={$viewMode === 'list'}
      onclick={() => viewMode.set('list')}
      aria-label="List view"
    ><List size={14} strokeWidth={1.5} /></button>
    <button
      class="pill icon-pill"
      class:active={$viewMode === 'grid'}
      onclick={() => viewMode.set('grid')}
      aria-label="Grid view"
    ><LayoutGrid size={14} strokeWidth={1.5} /></button>
  </div>
</div>

<style>
  .filters {
    border: 1px solid var(--border);
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-label {
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .filter-pills {
    display: flex;
  }

  .pill {
    padding: 4px 10px;
    border: 1px solid var(--border);
    margin-left: -1px;
    background: transparent;
    color: var(--text-dim);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    height: 26px;
    display: inline-flex;
    align-items: center;
  }

  .pill:first-child {
    margin-left: 0;
  }

  .pill:hover {
    color: var(--text);
    z-index: 1;
  }

  .pill.active {
    background: var(--text);
    border-color: var(--text);
    color: var(--bg);
    z-index: 2;
  }

  .search-group {
    flex: 1;
    min-width: 180px;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    padding-left: 10px;
    gap: 8px;
    color: var(--text-muted);
    transition: border-color 0.15s;
    width: 100%;
    height: 26px;
  }

  .search-wrapper:focus-within {
    border-color: var(--text-dim);
  }

  .search-wrapper input {
    flex: 1;
    padding: 6px 12px 6px 0;
    border: none;
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 12px;
    outline: none;
  }

  .search-wrapper input::placeholder {
    color: var(--text-muted);
  }

  .icon-pill {
    width: 26px;
    height: 26px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .view-toggle {
    margin-left: auto;
  }

  @media (max-width: 640px) {
    .filters {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .filter-group {
      flex-wrap: wrap;
    }

    .filter-pills {
      flex-wrap: wrap;
    }

    .pill {
      margin-bottom: -1px;
    }
  }
</style>
