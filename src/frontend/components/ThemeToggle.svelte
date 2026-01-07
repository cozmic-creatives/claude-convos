<script>
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  import { theme, cycleTheme } from '../stores.js';
  import Button from './Button.svelte';

  const icons = { system: Monitor, light: Sun, dark: Moon };
  let Icon = $derived(icons[$theme]);
</script>

<Button variant="icon" onclick={cycleTheme}>
  <Icon size={14} strokeWidth={1.5} />
</Button>
