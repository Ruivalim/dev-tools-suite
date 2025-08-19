<script lang="ts">
	let input = '';
	let output = '';
	let copyBtnText = 'Copy';

	function encode() {
		try {
			const encoded = btoa(unescape(encodeURIComponent(input)));
			output = encoded;
		} catch (error) {
			output = 'Error: Invalid input for encoding';
		}
	}

	function decode() {
		try {
			const decoded = decodeURIComponent(escape(atob(input)));
			output = decoded;
		} catch (error) {
			output = 'Error: Invalid base64 input';
		}
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
</script>

<section class="tool-section">
	<h2>Base64 Encoder/Decoder</h2>
	<div class="base64-container">
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Input Text</h3>
				<div class="base64-controls">
					<button class="action-btn" on:click={encode}>Encode</button>
					<button class="action-btn" on:click={decode}>Decode</button>
					<button class="clear-btn" on:click={clear}>Clear</button>
				</div>
			</div>
			<textarea 
				bind:value={input}
				placeholder="Enter text to encode or base64 to decode..."
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
</section>

<style>
	.base64-container {
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

	.base64-controls {
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
		.base64-container {
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
