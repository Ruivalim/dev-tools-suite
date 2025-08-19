<script lang="ts">
	import { theme, switchTheme, type Theme } from '$lib/stores/theme';
	import { getThemeNames } from '$lib/themes';

	const themes = getThemeNames();
	
	function handleThemeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		switchTheme(target.value as Theme);
	}
</script>

<div class="theme-switcher">
	<label for="theme-select">Theme:</label>
	<select id="theme-select" bind:value={$theme} on:change={handleThemeChange}>
		{#each themes as themeName}
			<option value={themeName}>{themeName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
		{/each}
	</select>
</div>

<style>
	.theme-switcher {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	label {
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}

	select {
		padding: 0.375rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.375rem;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.875rem;
		min-width: 120px;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	select:hover {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.15);
	}

	select:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.6);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
	}

	select option {
		background: var(--card-background);
		color: var(--text-primary);
	}
</style>