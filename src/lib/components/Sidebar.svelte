<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let activeTool: string;

	const dispatch = createEventDispatcher();

	const tools = [
		{ id: 'diff', name: 'Text Diff' },
		{ id: 'base64', name: 'Base64 Encoder' },
		{ id: 'js-minifier', name: 'JS Minifier' },
		{ id: 'css-minifier', name: 'CSS Minifier' },
		{ id: 'json-formatter', name: 'JSON Formatter' }
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
		background: white;
		border-right: 1px solid #dee2e6;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid #dee2e6;
		background: #f8f9fa;
	}

	.sidebar-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #495057;
	}

	.tool-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tool-list li {
		border-bottom: 1px solid #f1f3f4;
	}

	.tool-btn {
		width: 100%;
		padding: 1rem 1.5rem;
		border: none;
		background: transparent;
		text-align: left;
		color: #495057;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
	}

	.tool-btn:hover {
		background: #f8f9fa;
		color: #667eea;
	}

	.tool-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			order: 2;
		}
	}
</style>