<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from "codemirror";
	import { EditorState } from "@codemirror/state";
	import { javascript } from "@codemirror/lang-javascript";
	import { css } from "@codemirror/lang-css";
	import { html } from "@codemirror/lang-html";
	import { markdown } from "@codemirror/lang-markdown";
	import { python } from "@codemirror/lang-python";
	import { java } from "@codemirror/lang-java";
	import { cpp } from "@codemirror/lang-cpp";
	import * as Diff from 'diff';
	import { Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui';
	import 'diff2html/bundles/css/diff2html.min.css';

	let leftEditor: EditorView;
	let rightEditor: EditorView;
	let leftTextContainer: HTMLElement;
	let rightTextContainer: HTMLElement;
	let diffContainer: HTMLElement;
	let leftFileInput: HTMLInputElement;
	let rightFileInput: HTMLInputElement;
	let syntaxMode = 'text/plain';
	let inlineView = false;
	let leftLines = 0;
	let rightLines = 0;
	let diffStats = '';

	const syntaxModes = {
		'text/plain': [],
		'javascript': [javascript()],
		'typescript': [javascript({ typescript: true })],
		'css': [css()],
		'html': [html()],
		'markdown': [markdown()],
		'python': [python()],
		'java': [java()],
		'cpp': [cpp()]
	};

	onMount(() => {
		initializeEditors();
	});

	function initializeEditors() {
		if (leftTextContainer && rightTextContainer) {
			leftEditor = new EditorView({
				state: EditorState.create({
					doc: "",
					extensions: [basicSetup, ...syntaxModes[syntaxMode]]
				}),
				parent: leftTextContainer
			});

			rightEditor = new EditorView({
				state: EditorState.create({
					doc: "",
					extensions: [basicSetup, ...syntaxModes[syntaxMode]]
				}),
				parent: rightTextContainer
			});

			updateLineInfo();
		}
	}

	function updateLineInfo() {
		if (leftEditor && rightEditor) {
			leftLines = leftEditor.state.doc.lines;
			rightLines = rightEditor.state.doc.lines;
		}
	}

	function updateSyntaxHighlighting() {
		if (leftEditor && rightEditor) {
			const extensions = [basicSetup, ...syntaxModes[syntaxMode]];
			
			leftEditor.dispatch({
				effects: EditorView.reconfigure.of(extensions)
			});
			
			rightEditor.dispatch({
				effects: EditorView.reconfigure.of(extensions)
			});
		}
	}

	function calculateDiffStats(patch: string) {
		const lines = patch.split('\n');
		let additions = 0;
		let deletions = 0;
		
		lines.forEach(line => {
			if (line.startsWith('+') && !line.startsWith('+++')) {
				additions++;
			} else if (line.startsWith('-') && !line.startsWith('---')) {
				deletions++;
			}
		});
		
		return { additions, deletions };
	}

	function compare() {
		if (!leftEditor || !rightEditor || !diffContainer) return;
		
		const leftText = leftEditor.state.doc.toString();
		const rightText = rightEditor.state.doc.toString();
		const patch = Diff.createPatch('diff', leftText, rightText);
		const stats = calculateDiffStats(patch);
		
		diffStats = `<span class="diff-add">+${stats.additions}</span> <span class="diff-remove">-${stats.deletions}</span>`;
		
		const diff2htmlUi = new Diff2HtmlUI(diffContainer, patch, {
			drawFileList: false,
			fileContentToggle: false,
			outputFormat: inlineView ? 'line-by-line' : 'side-by-side',
			matching: 'lines',
			diffMaxChanges: 500,
		});
		
		diff2htmlUi.draw();
	}

	function clear() {
		if (leftEditor && rightEditor) {
			leftEditor.dispatch({
				changes: { from: 0, to: leftEditor.state.doc.length, insert: "" }
			});
			rightEditor.dispatch({
				changes: { from: 0, to: rightEditor.state.doc.length, insert: "" }
			});
			updateLineInfo();
			diffStats = '';
			if (diffContainer) {
				diffContainer.innerHTML = '';
			}
		}
	}

	async function handleFileUpload(event: Event, isLeft: boolean) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const content = await readFile(file);
			const editor = isLeft ? leftEditor : rightEditor;
			
			editor.dispatch({
				changes: { from: 0, to: editor.state.doc.length, insert: content }
			});
			
			updateLineInfo();
			
			// Auto-detect syntax mode based on file extension
			const extension = file.name.split('.').pop()?.toLowerCase();
			switch (extension) {
				case 'js':
					syntaxMode = 'javascript';
					break;
				case 'ts':
					syntaxMode = 'typescript';
					break;
				case 'css':
					syntaxMode = 'css';
					break;
				case 'html':
					syntaxMode = 'html';
					break;
				case 'md':
					syntaxMode = 'markdown';
					break;
				case 'py':
					syntaxMode = 'python';
					break;
				case 'java':
					syntaxMode = 'java';
					break;
				case 'cpp':
				case 'c':
				case 'h':
					syntaxMode = 'cpp';
					break;
				default:
					syntaxMode = 'text/plain';
			}
			
			updateSyntaxHighlighting();
		} catch (error) {
			console.error('Error reading file:', error);
			alert('Error reading file. Please try again.');
		}
	}

	function readFile(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = (e) => reject(e);
			reader.readAsText(file);
		});
	}

	$: if (syntaxMode) {
		updateSyntaxHighlighting();
	}
</script>

<div class="input-section">
	<div class="controls-panel">
		<div class="file-upload-section">
			<div class="upload-group">
				<label for="file1-upload" class="upload-label">Upload File 1:</label>
				<input
					id="file1-upload"
					type="file"
					accept=".txt,.js,.ts,.json,.html,.css,.md,.py,.java,.cpp,.c,.h"
					on:change={(e) => handleFileUpload(e, true)}
					bind:this={leftFileInput}
				/>
			</div>
			<div class="upload-group">
				<label for="file2-upload" class="upload-label">Upload File 2:</label>
				<input
					id="file2-upload"
					type="file"
					accept=".txt,.js,.ts,.json,.html,.css,.md,.py,.java,.cpp,.c,.h"
					on:change={(e) => handleFileUpload(e, false)}
					bind:this={rightFileInput}
				/>
			</div>
		</div>

		<div class="diff-options">
			<div class="option-group">
				<label class="option-label">
					<input type="checkbox" bind:checked={inlineView} />
					<span>Inline View</span>
				</label>
			</div>
			<div class="option-group">
				<label for="syntax-mode" class="option-label">Syntax:</label>
				<select id="syntax-mode" bind:value={syntaxMode}>
					<option value="text/plain">Plain Text</option>
					<option value="javascript">JavaScript</option>
					<option value="typescript">TypeScript</option>
					<option value="css">CSS</option>
					<option value="html">HTML</option>
					<option value="markdown">Markdown</option>
					<option value="python">Python</option>
					<option value="java">Java</option>
					<option value="cpp">C/C++</option>
				</select>
			</div>
		</div>
	</div>

	<div class="text-container">
		<div class="text-panel">
			<div class="text-header">
				<span class="text-title">Text 1</span>
				<span class="text-info">{leftLines} lines</span>
			</div>
			<div class="text" bind:this={leftTextContainer}></div>
		</div>
		<div class="text-panel">
			<div class="text-header">
				<span class="text-title">Text 2</span>
				<span class="text-info">{rightLines} lines</span>
			</div>
			<div class="text" bind:this={rightTextContainer}></div>
		</div>
	</div>

	<div class="action-buttons">
		<button class="compare-btn" on:click={compare}>Compare</button>
		<button class="clear-btn" on:click={clear}>Clear</button>
	</div>
</div>

<section class="diff-section">
	<div class="diff-header">
		<h2>Comparison Result</h2>
		<div class="diff-stats">{@html diffStats}</div>
	</div>
	<div class="diff-container" bind:this={diffContainer}></div>
</section>

<style>
	.input-section {
		margin-bottom: 2rem;
	}

	.controls-panel {
		background: var(--card-background);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 8px var(--shadow-card);
		border: 1px solid var(--border-color);
	}

	.file-upload-section {
		display: flex;
		gap: 2rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.upload-group {
		flex: 1;
		min-width: 250px;
	}

	.upload-label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.diff-options {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.option-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.option-label {
		font-weight: 500;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 1.5rem 0;
		padding: 1rem;
		background: var(--card-background);
		border-radius: 12px;
		box-shadow: 0 2px 8px var(--shadow-card);
		border: 1px solid var(--border-color);
	}

	.text-container {
		display: flex;
		gap: 1rem;
		height: 400px;
	}

	.text-panel {
		flex: 1;
		background: var(--card-background);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px var(--shadow-card);
	}

	.text-header {
		background: var(--surface-background);
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.text-title {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 14px;
	}

	.text-info {
		font-size: 12px;
		color: var(--text-muted);
		background: var(--surface-background);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.text {
		height: calc(100% - 50px);
		overflow: auto;
	}

	.diff-section {
		background: var(--card-background);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px var(--shadow-card);
		border: 1px solid var(--border-color);
	}

	.diff-header {
		background: var(--surface-background);
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.diff-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.diff-stats {
		font-size: 12px;
		color: var(--text-muted);
		display: flex;
		gap: 1rem;
	}

	.diff-container {
    color: #131212;
		overflow: visible;
	}

	:global(.diff-add) {
		color: var(--success);
		font-weight: 600;
	}

	:global(.diff-remove) {
		color: var(--error);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.file-upload-section {
			flex-direction: column;
			gap: 1rem;
		}
		
		.diff-options {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		
		.action-buttons {
			flex-direction: column;
			align-items: stretch;
		}
		
		.text-container {
			flex-direction: column;
			height: auto;
		}
		
		.text-panel {
			height: 250px;
		}
		
		.diff-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}
	}
</style>
