<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme, initializeTheme } from '$lib/stores/theme';
	import { getTheme } from '$lib/themes';

	onMount(() => {
		initializeTheme();
	});

	$: {
		if (typeof document !== 'undefined') {
			const themeConfig = getTheme($theme);
			const root = document.documentElement;
			
			Object.entries(themeConfig.colors).forEach(([key, value]) => {
				const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
				root.style.setProperty(cssVar, value);
			});
		}
	}
</script>

<slot />
