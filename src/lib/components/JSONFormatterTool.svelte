<script lang="ts">
	let input = '';
	let output = '';
	let copyBtnText = 'Copy';
	let errorMessage = '';
	let showError = false;

	function showJsonError(message: string) {
		errorMessage = message;
		showError = true;
		setTimeout(() => {
			showError = false;
		}, 5000);
	}

	function format() {
		try {
			const parsed = JSON.parse(input);
			const formatted = JSON.stringify(parsed, null, 2);
			output = formatted;
			showError = false;
		} catch (error) {
			showJsonError('Error: Invalid JSON format');
		}
	}

	function minify() {
		try {
			const parsed = JSON.parse(input);
			const minified = JSON.stringify(parsed);
			output = minified;
			showError = false;
		} catch (error) {
			showJsonError('Error: Invalid JSON format');
		}
	}

	function validate() {
		try {
			JSON.parse(input);
			output = '✅ Valid JSON';
			showError = false;
		} catch (error) {
			showJsonError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
			output = '❌ Invalid JSON';
		}
	}

	function clear() {
		input = '';
		output = '';
		showError = false;
	}

	function copy() {
		navigator.clipboard.writeText(output).then(() => {
			copyBtnText = 'Copied!';
			setTimeout(() => {
				copyBtnText = 'Copy';
			}, 2000);
		});
	}
</script>

<section class="tool-section">
	<h2>JSON Formatter/Minifier</h2>
	<div class="json-container">
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Input JSON</h3>
				<div class="json-controls">
					<button class="action-btn" on:click={format}>Format</button>
					<button class="action-btn" on:click={minify}>Minify</button>
					<button class="action-btn" on:click={validate}>Validate</button>
					<button class="clear-btn" on:click={clear}>Clear</button>
				</div>
			</div>
			<textarea 
				bind:value={input}
				placeholder="Enter JSON to format, minify, or validate..."
			></textarea>
		</div>
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Output</h3>
				<button class="copy-btn" on:click={copy}>{copyBtnText}</button>
			</div>
			<textarea 
				bind:value={output}
				readonly 
				placeholder="Result will appear here..."
			></textarea>
		</div>
	</div>
	{#if showError}
		<div class="error-message show">
			{errorMessage}
		</div>
	{/if}
</section>

<style>
	.json-container {
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

	.json-controls {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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
		.json-container {
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
	}
</style>