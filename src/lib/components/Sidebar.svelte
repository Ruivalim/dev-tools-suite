<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let activeTool: string;

	const dispatch = createEventDispatcher();

	const tools = [
		{ id: 'diff', name: 'Text Diff' },
		{ id: 'base64', name: 'Base64 Encoder' },
		{ id: 'js-minifier', name: 'JS Minifier' },
		{ id: 'css-minifier', name: 'CSS Minifier' },
		{ id: 'json-formatter', name: 'JSON Formatter' },
		{ id: 'sort', name: 'Text Sorter' },
		{ id: 'markdown-to-pdf', name: 'Markdown to PDF (Canvas)' },
		{ id: 'markdown-to-pdf-simple', name: 'Markdown to PDF' }
	];

	function switchTool(toolId: string) {
		dispatch('switchTool', toolId);
	}
</script>

<nav class="sidebar">
	<div class="sidebar-header">
		<h3>Tools</h3>
	</div>
	<ul class="tool-list">
		{#each tools as tool}
			<li>
				<button 
					class="tool-btn {activeTool === tool.id ? 'active' : ''}"
					on:click={() => switchTool(tool.id)}
				>
					{tool.name}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		width: 250px;
		background: var(--surface-background);
		border-right: 1px solid var(--border-color);
		box-shadow: 2px 0 5px var(--shadow-card);
		flex-shrink: 0;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
		background: var(--card-background);
	}

	.sidebar-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.tool-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tool-list li {
		border-bottom: 1px solid var(--border-color);
	}

	.tool-btn {
		width: 100%;
		padding: 1rem 1.5rem;
		border: none;
		background: transparent;
		text-align: left;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
	}

	.tool-btn:hover {
		background: var(--card-background);
		color: var(--primary);
	}

	.tool-btn.active {
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: var(--text-primary);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			order: 2;
		}
	}
</style>