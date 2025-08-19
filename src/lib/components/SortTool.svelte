<script lang="ts">
	let input = '';
	let output = '';
	let copyBtnText = 'Copy';
	let sortMode: 'text' | 'numbers' = 'text';

	function sortText() {
		if (!input.trim()) {
			output = '';
			return;
		}

		const lines = input.split('\n').filter(line => line.trim() !== '');
		
		if (sortMode === 'text') {
			lines.sort((a, b) => a.localeCompare(b));
		} else {
			lines.sort((a, b) => {
				const numA = parseFloat(a);
				const numB = parseFloat(b);
				
				// Handle cases where one or both values are not numbers
				if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
				if (isNaN(numA)) return 1;
				if (isNaN(numB)) return -1;
				
				return numA - numB;
			});
		}
		
		output = lines.join('\n');
	}

	function sortReverse() {
		if (!input.trim()) {
			output = '';
			return;
		}

		const lines = input.split('\n').filter(line => line.trim() !== '');
		
		if (sortMode === 'text') {
			lines.sort((a, b) => b.localeCompare(a));
		} else {
			lines.sort((a, b) => {
				const numA = parseFloat(a);
				const numB = parseFloat(b);
				
				// Handle cases where one or both values are not numbers
				if (isNaN(numA) && isNaN(numB)) return b.localeCompare(a);
				if (isNaN(numA)) return -1;
				if (isNaN(numB)) return 1;
				
				return numB - numA;
			});
		}
		
		output = lines.join('\n');
	}

	function clear() {
		input = '';
		output = '';
	}

	function copy() {
		navigator.clipboard.writeText(output).then(() => {
			copyBtnText = 'Copied!';
			setTimeout(() => {
				copyBtnText = 'Copy';
			}, 2000);
		});
	}

	// Auto-sort when sort mode changes
	$: if (input) {
		sortText();
	}
</script>

<section class="tool-section">
	<h2>Text & Number Sorter</h2>
	<div class="sort-container">
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Input Text</h3>
				<div class="sort-controls">
					<select bind:value={sortMode} class="mode-select">
						<option value="text">Alphabetical</option>
						<option value="numbers">Numerical</option>
					</select>
					<button class="action-btn" on:click={sortText}>Sort A→Z</button>
					<button class="action-btn" on:click={sortReverse}>Sort Z→A</button>
					<button class="clear-btn" on:click={clear}>Clear</button>
				</div>
			</div>
			<textarea 
				bind:value={input}
				placeholder="Enter lines of text or numbers to sort (one per line)..."
			></textarea>
		</div>
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Sorted Output</h3>
				<button class="copy-btn" on:click={copy}>{copyBtnText}</button>
			</div>
			<textarea 
				bind:value={output}
				readonly 
				placeholder="Sorted result will appear here..."
			></textarea>
		</div>
	</div>
</section>

<style>
	.sort-container {
		display: flex;
		gap: 1.5rem;
		height: 500px;
	}

	.input-output-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
	}

	.panel-header {
		background: var(--surface-background);
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.sort-controls {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.mode-select {
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--card-background);
		color: var(--text-primary);
		font-size: 13px;
	}

	textarea {
		flex: 1;
		border: none;
		padding: 1rem;
		font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		font-size: 13px;
		line-height: 1.4;
		resize: none;
		outline: none;
		background: var(--card-background);
		color: var(--text-primary);
	}

	textarea[readonly] {
		background: var(--surface-background);
	}

	@media (max-width: 768px) {
		.sort-container {
			flex-direction: column;
			height: auto;
		}
		
		.input-output-panel {
			height: 250px;
		}
		
		.panel-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}
		
		.sort-controls {
			justify-content: center;
		}
	}
</style>