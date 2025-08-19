<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import DiffTool from '$lib/components/DiffTool.svelte';
	import Base64Tool from '$lib/components/Base64Tool.svelte';
	import JSMinifierTool from '$lib/components/JSMinifierTool.svelte';
	import CSSMinifierTool from '$lib/components/CSSMinifierTool.svelte';
	import JSONFormatterTool from '$lib/components/JSONFormatterTool.svelte';
	import SortTool from '$lib/components/SortTool.svelte';
	import MarkdownToPDFTool from '$lib/components/MarkdownToPDFTool.svelte';

	let activeTool = 'diff';

	function switchTool(toolName: string) {
		activeTool = toolName;
	}
</script>

<svelte:head>
	<title>Dev Tools Suite</title>
	<meta name="description" content="A modern, web-based text and file comparison tool with syntax highlighting" />
</svelte:head>

<Header />

<div class="app-container">
	<Sidebar {activeTool} on:switchTool={(e) => switchTool(e.detail)} />
	
	<main class="main-container">
		{#if activeTool === 'diff'}
			<DiffTool />
		{:else if activeTool === 'base64'}
			<Base64Tool />
		{:else if activeTool === 'js-minifier'}
			<JSMinifierTool />
		{:else if activeTool === 'css-minifier'}
			<CSSMinifierTool />
		{:else if activeTool === 'json-formatter'}
			<JSONFormatterTool />
		{:else if activeTool === 'sort'}
			<SortTool />
		{:else if activeTool === 'markdown-to-pdf'}
			<MarkdownToPDFTool />
		{/if}
	</main>
</div>

<style>
	.app-container {
		display: flex;
		min-height: calc(100vh - 120px);
	}

	.main-container {
		flex: 1;
		padding: 2rem;
		max-width: calc(100% - 250px);
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.app-container {
			flex-direction: column;
		}
		
		.main-container {
			max-width: 100%;
			padding: 1rem;
			order: 1;
		}
	}
</style>
