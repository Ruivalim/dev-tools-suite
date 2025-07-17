<script lang="ts">
	let input = '';
	let output = '';
	let copyBtnText = 'Copy';

	function minify() {
		try {
			const minified = input
				.replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
				.replace(/\/\/.*$/gm, '') // Remove // comments
				.replace(/\s+/g, ' ') // Replace multiple whitespace with single space
				.replace(/;\s*}/g, ';}') // Remove space before closing brace
				.replace(/{\s*/g, '{') // Remove space after opening brace
				.replace(/}\s*/g, '}') // Remove space after closing brace
				.replace(/,\s*/g, ',') // Remove space after comma
				.replace(/:\s*/g, ':') // Remove space after colon
				.replace(/;\s*/g, ';') // Remove space after semicolon
				.trim();
			
			output = minified;
		} catch (error) {
			output = 'Error: Unable to minify JavaScript';
		}
	}

	function beautify() {
		try {
			let formatted = input;
			let indentLevel = 0;
			const indentSize = 2;
			
			formatted = formatted.replace(/[{}]/g, (match) => {
				if (match === '{') {
					return '{\n' + ' '.repeat((++indentLevel) * indentSize);
				} else {
					return '\n' + ' '.repeat((--indentLevel) * indentSize) + '}';
				}
			});
			
			formatted = formatted.replace(/;/g, ';\n' + ' '.repeat(indentLevel * indentSize));
			formatted = formatted.replace(/,/g, ',\n' + ' '.repeat(indentLevel * indentSize));
			formatted = formatted.replace(/\n\s*\n/g, '\n'); // Remove empty lines
			
			output = formatted.trim();
		} catch (error) {
			output = 'Error: Unable to beautify JavaScript';
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
	<h2>JavaScript Minifier/Beautifier</h2>
	<div class="minifier-container">
		<div class="input-output-panel">
			<div class="panel-header">
				<h3>Input JavaScript</h3>
				<div class="minifier-controls">
					<button class="action-btn" on:click={minify}>Minify</button>
					<button class="action-btn" on:click={beautify}>Beautify</button>
					<button class="clear-btn" on:click={clear}>Clear</button>
				</div>
			</div>
			<textarea 
				bind:value={input}
				placeholder="Enter JavaScript code to minify or beautify..."
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
	.minifier-container {
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

	.minifier-controls {
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
		.minifier-container {
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