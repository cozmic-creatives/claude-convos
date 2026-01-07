<script>
  import { onMount } from 'svelte';
  import { fetchConversations } from './stores.js';
  import Header from './components/Header.svelte';
  import ContinueSession from './components/ContinueSession.svelte';
  import StatsBar from './components/StatsBar.svelte';
  import InsightsSection from './components/InsightsSection.svelte';
  import Filters from './components/Filters.svelte';
  import ConversationsList from './components/ConversationsList.svelte';
  import ReportModal from './components/ReportModal.svelte';
  import Toast from './components/Toast.svelte';

  let error = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      await fetchConversations();
    } catch (e) {
      error = e.message || 'Failed to load conversations';
    } finally {
      loading = false;
    }
  });
</script>

<div class="app">
  <Header />
  <ContinueSession />
  <StatsBar />
  <InsightsSection />
  <Filters />

  {#if loading}
    <div class="loading-state">
      <span>loading conversations...</span>
    </div>
  {:else if error}
    <div class="error-state">
      <h2>error</h2>
      <p>{error}</p>
    </div>
  {:else}
    <ConversationsList />
  {/if}

  <ReportModal />
  <Toast />
</div>

<style>
  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--text-dim);
    border: 1px solid var(--border);
  }

  .error-state h2 {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 8px 0;
    color: var(--text);
  }

  .error-state p {
    font-size: 12px;
    margin: 0;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .app {
      padding: 12px;
    }
  }
</style>
