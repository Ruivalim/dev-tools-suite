<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import { jsPDF } from 'jspdf';
	import html2canvas from 'html2canvas';
	import { EditorView, basicSetup } from 'codemirror';
	import { markdown } from '@codemirror/lang-markdown';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	let editorElement: HTMLElement;
	let previewElement: HTMLElement;
	let markdownText = `# Sample Markdown Document

## Introduction
This is a **sample markdown** document that you can edit and convert to PDF with **syntax highlighting**, **proper header styling**, and **table of contents** support.

### Features
- *Italic text*
- **Bold text**
- ~~Strikethrough text~~
- Syntax highlighted code blocks
- Professional header styling
- Optional table of contents

## Code Examples

### JavaScript
\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

### Python
\`\`\`python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\`

### CSS
\`\`\`css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 8px;
}
\`\`\`

## Lists and Quotes

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Bullet point one
- Bullet point two
- Bullet point three

> This is a blockquote example with some important information that stands out from the regular text.

## Links and Formatting

Visit [Google](https://google.com) for more information.

**Important:** Enable the table of contents option to see all these headers organized in a separate page!
`;

	// PDF Configuration
	let logoFile: File | null = null;
	let logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-right';
	let marginTop = 20;
	let marginBottom = 20;
	let marginLeft = 15;
	let marginRight = 15;
	let paperSize: 'a4' | 'a3' | 'letter' | 'legal' = 'a4';
	let codeBackgroundColor = '#f4f4f4';
	let codeBorderColor = '#ddd';
	let codeTextColor = '#333';
	let includeTOC = false;

	// Paper size configurations
	const paperSizes = {
		a4: { width: 210, height: 297 },
		a3: { width: 297, height: 420 },
		letter: { width: 216, height: 279 },
		legal: { width: 216, height: 356 }
	};

	let editorView: EditorView;
	let htmlContent = '';
	let headers: Array<{level: number, text: string, id: string, page?: number}> = [];

	onMount(async () => {
		// Initialize CodeMirror editor
		editorView = new EditorView({
			doc: markdownText,
			extensions: [
				basicSetup,
				markdown(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						markdownText = editorView.state.doc.toString();
						updatePreview().catch(console.error);
					}
				})
			],
			parent: editorElement
		});

		await updatePreview();
	});

	function convertHighlightJSToInlineStyles(highlightedCode: string): string {
		// Convert highlight.js classes to inline styles for PDF generation
		const styleMap: {[key: string]: string} = {
			'hljs-keyword': 'color: #d73a49; font-weight: bold;',
			'hljs-string': 'color: #032f62;',
			'hljs-comment': 'color: #6a737d; font-style: italic;',
			'hljs-number': 'color: #005cc5;',
			'hljs-function': 'color: #6f42c1;',
			'hljs-variable': 'color: #e36209;',
			'hljs-title': 'color: #6f42c1; font-weight: bold;',
			'hljs-params': 'color: #24292e;',
			'hljs-built_in': 'color: #005cc5;',
			'hljs-literal': 'color: #005cc5;',
			'hljs-attr': 'color: #005cc5;',
			'hljs-selector-tag': 'color: #22863a;',
			'hljs-selector-class': 'color: #6f42c1;',
			'hljs-selector-id': 'color: #6f42c1;',
			'hljs-property': 'color: #005cc5;',
			'hljs-value': 'color: #032f62;',
			'hljs-operator': 'color: #d73a49;',
			'hljs-punctuation': 'color: #24292e;'
		};

		let result = highlightedCode;
		
		// Replace each class with inline styles
		for (const [className, style] of Object.entries(styleMap)) {
			const regex = new RegExp(`<span class="${className}">([^<]*)</span>`, 'g');
			result = result.replace(regex, `<span style="${style}">$1</span>`);
		}
		
		return result;
	}

	async function updatePreview() {
		// Parse markdown to elements (same as PDF generation)
		const elements = parseMarkdownToElements();
		
		// Extract headers for table of contents
		headers = [];
		let headerCounter = 0;
		
		// Build preview HTML that matches PDF layout exactly
		let previewHtml = '';
		const paper = paperSizes[paperSize];
		const contentWidth = paper.width - marginLeft - marginRight;
		
		// Simulate page layout
		const pageLayout = simulatePageLayout();
		
		previewHtml += `<div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000;">`;
		
		pageLayout.forEach((page, pageIndex) => {
			previewHtml += `<div style="
				width: ${contentWidth}mm; 
				min-height: ${paper.height - marginTop - marginBottom}mm;
				margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
				border: 1px solid #ddd;
				page-break-after: always;
				padding: 10mm;
				background: white;
				box-shadow: 0 2px 4px rgba(0,0,0,0.1);
				margin-bottom: 20px;
			">`;
			
			// Add page number indicator
			previewHtml += `<div style="position: absolute; top: 5px; right: 10px; font-size: 10px; color: #666;">Page ${page.page}</div>`;
			
			// Add elements to page
			page.elements.forEach(element => {
				if (element.type === 'header') {
					headerCounter++;
					const id = `header-${headerCounter}`;
					headers.push({ level: element.level || 1, text: element.content, id });
					
					previewHtml += `<h${element.level} id="${id}" style="
						font-size: ${element.style.fontSize}pt;
						font-weight: ${element.style.fontWeight};
						line-height: ${element.style.lineHeight};
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						color: ${element.style.color};
						${element.level === 1 ? 'border-bottom: 2px solid #333; padding-bottom: 0.3em;' : ''}
						${element.level === 2 ? 'border-bottom: 1px solid #666; padding-bottom: 0.2em;' : ''}
					">${element.content}</h${element.level}>`;
				}
				else if (element.type === 'code') {
					// Apply syntax highlighting if available
					let highlightedCode = element.content;
					if (element.language && hljs.getLanguage(element.language)) {
						try {
							const highlighted = hljs.highlight(element.content, { language: element.language }).value;
							highlightedCode = convertHighlightJSToInlineStyles(highlighted);
						} catch (err) {
							console.error('Syntax highlighting error:', err);
						}
					}
					
					previewHtml += `<pre style="
						background-color: ${element.style.backgroundColor};
						border: 1px solid ${codeBorderColor};
						padding: ${element.style.padding}px;
						border-radius: 4px;
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						font-size: ${element.style.fontSize}pt;
						line-height: ${element.style.lineHeight};
						overflow-x: auto;
						white-space: pre;
					"><code style="color: ${element.style.color}; font-family: 'Courier New', monospace;">${highlightedCode}</code></pre>`;
				}
				else if (element.type === 'blockquote') {
					previewHtml += `<blockquote style="
						border-left: 4px solid #ddd;
						padding-left: ${element.style.padding}px;
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						font-size: ${element.style.fontSize}pt;
						line-height: ${element.style.lineHeight};
						color: ${element.style.color};
						font-style: italic;
					">${element.content}</blockquote>`;
				}
				else if (element.type === 'list') {
					previewHtml += `<div style="
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						font-size: ${element.style.fontSize}pt;
						line-height: ${element.style.lineHeight};
						color: ${element.style.color};
						padding-left: 20px;
					">${element.content}</div>`;
				}
				else { // text
					// Process inline formatting
					let content = element.content
						.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
						.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
						.replace(/<code>(.*?)<\/code>/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
					
					previewHtml += `<p style="
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						font-size: ${element.style.fontSize}pt;
						line-height: ${element.style.lineHeight};
						color: ${element.style.color};
					">${content}</p>`;
				}
			});
			
			previewHtml += `</div>`;
		});
		
		previewHtml += `</div>`;

		if (previewElement) {
			previewElement.innerHTML = previewHtml;
		}
	}

	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			logoFile = target.files[0];
		}
	}

	function generateTOCPage(pdf: jsPDF, paper: any) {
		if (!includeTOC || headers.length === 0) return false;
		
		// Add TOC title
		pdf.setFontSize(24);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Table of Contents', marginLeft, marginTop + 10);
		
		let yPosition = marginTop + 25;
		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');
		
		headers.forEach((header, index) => {
			if (yPosition > paper.height - marginBottom - 10) {
				pdf.addPage();
				yPosition = marginTop;
			}
			
			const indent = (header.level - 1) * 8;
			const pageNum = header.page || 1;
			
			// Add dots between header text and page number
			const headerText = header.text;
			const maxTextWidth = paper.width - marginLeft - marginRight - 20 - indent;
			const truncatedText = headerText.length > 50 ? headerText.substring(0, 47) + '...' : headerText;
			
			pdf.text(truncatedText, marginLeft + indent, yPosition);
			
			// Add page number
			pdf.text(pageNum.toString(), paper.width - marginRight - 10, yPosition);
			
			yPosition += 7;
		});
		
		return true;
	}

	// Text-based PDF generation
	interface TextElement {
		type: 'text' | 'header' | 'code' | 'list' | 'blockquote';
		content: string;
		level?: number; // for headers
		language?: string; // for code blocks
		style: {
			fontSize: number;
			fontWeight: string;
			lineHeight: number;
			marginTop: number;
			marginBottom: number;
			color: string;
			backgroundColor?: string;
			borderLeft?: string;
			padding?: number;
		};
	}

	function parseMarkdownToElements(): TextElement[] {
		const elements: TextElement[] = [];
		const lines = markdownText.split('\n');
		let i = 0;
		
		while (i < lines.length) {
			const line = lines[i].trim();
			
			if (!line) {
				i++;
				continue;
			}
			
			// Headers
			if (line.startsWith('#')) {
				const level = line.match(/^#+/)?.[0].length || 1;
				const text = line.replace(/^#+\s*/, '');
				elements.push({
					type: 'header',
					content: text,
					level,
					style: {
						fontSize: level === 1 ? 18 : level === 2 ? 16 : level === 3 ? 14 : 12,
						fontWeight: level <= 2 ? 'bold' : '600',
						lineHeight: 1.4,
						marginTop: level === 1 ? 20 : level === 2 ? 16 : 12,
						marginBottom: 8,
						color: '#000'
					}
				});
			}
			// Code blocks
			else if (line.startsWith('```')) {
				const language = line.substring(3).trim();
				const codeLines: string[] = [];
				i++; // Skip opening ```
				
				while (i < lines.length && !lines[i].trim().startsWith('```')) {
					codeLines.push(lines[i]);
					i++;
				}
				
				elements.push({
					type: 'code',
					content: codeLines.join('\n'),
					language,
					style: {
						fontSize: 10,
						fontWeight: 'normal',
						lineHeight: 1.4,
						marginTop: 12,
						marginBottom: 12,
						color: codeTextColor,
						backgroundColor: codeBackgroundColor,
						padding: 10
					}
				});
			}
			// Blockquotes
			else if (line.startsWith('>')) {
				const text = line.replace(/^>\s*/, '');
				elements.push({
					type: 'blockquote',
					content: text,
					style: {
						fontSize: 11,
						fontWeight: 'normal',
						lineHeight: 1.5,
						marginTop: 12,
						marginBottom: 12,
						color: '#666',
						borderLeft: '4px solid #ddd',
						padding: 10
					}
				});
			}
			// Lists
			else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
				const text = line.replace(/^[-*+]\s/, '• ').replace(/^\d+\.\s/, '1. ');
				elements.push({
					type: 'list',
					content: text,
					style: {
						fontSize: 11,
						fontWeight: 'normal',
						lineHeight: 1.5,
						marginTop: 4,
						marginBottom: 4,
						color: '#000'
					}
				});
			}
			// Regular text
			else {
				// Process inline formatting (bold, italic, code)
				let processedText = line
					.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
					.replace(/\*(.*?)\*/g, '<i>$1</i>')
					.replace(/`(.*?)`/g, '<code>$1</code>');
				
				elements.push({
					type: 'text',
					content: processedText,
					style: {
						fontSize: 11,
						fontWeight: 'normal',
						lineHeight: 1.6,
						marginTop: 6,
						marginBottom: 6,
						color: '#000'
					}
				});
			}
			
			i++;
		}
		
		return elements;
	}

	function calculateLinesPerPage(): number {
		const paper = paperSizes[paperSize];
		const contentHeight = paper.height - marginTop - marginBottom;
		const baseLineHeight = 11 * 1.6; // 11pt font with 1.6 line height
		const lineHeightMm = (baseLineHeight * 25.4) / 72; // Convert pt to mm
		return Math.floor(contentHeight / lineHeightMm);
	}

	function simulatePageLayout(): Array<{elements: TextElement[], page: number}> {
		const elements = parseMarkdownToElements();
		const linesPerPage = calculateLinesPerPage();
		const pages: Array<{elements: TextElement[], page: number}> = [];
		
		let currentPage: TextElement[] = [];
		let currentLines = 0;
		let pageNumber = includeTOC ? 2 : 1;
		
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			
			// Calculate lines needed for this element
			const elementLines = Math.ceil(element.content.length / 80) || 1; // Rough estimate
			const totalElementLines = elementLines + Math.ceil(element.style.marginTop / 4) + Math.ceil(element.style.marginBottom / 4);
			
			// Check if we need to break page
			if (currentLines + totalElementLines > linesPerPage && currentPage.length > 0) {
				// Smart break rules
				const shouldBreakBefore = 
					element.type === 'header' || // Headers start new pages
					element.type === 'code' || // Code blocks don't split
					(currentPage.length > 0 && currentPage[currentPage.length - 1].type === 'header'); // Don't leave headers alone
				
				if (shouldBreakBefore) {
					// Finish current page and start new one
					pages.push({elements: [...currentPage], page: pageNumber});
					currentPage = [element];
					currentLines = totalElementLines;
					pageNumber++;
					
					// Update header page tracking
					if (element.type === 'header') {
						const headerIndex = headers.findIndex(h => h.text === element.content);
						if (headerIndex !== -1) {
							headers[headerIndex].page = pageNumber;
						}
					}
					continue;
				}
			}
			
			// Add element to current page
			currentPage.push(element);
			currentLines += totalElementLines;
			
			// Update header page tracking
			if (element.type === 'header') {
				const headerIndex = headers.findIndex(h => h.text === element.content);
				if (headerIndex !== -1) {
					headers[headerIndex].page = pageNumber;
				}
			}
		}
		
		// Add final page if it has content
		if (currentPage.length > 0) {
			pages.push({elements: currentPage, page: pageNumber});
		}
		
		return pages;
	}

	async function generatePDF() {
		const paper = paperSizes[paperSize];
		const pdf = new jsPDF({
			unit: 'mm',
			format: [paper.width, paper.height]
		});

		// Calculate page layout
		const pageLayout = simulatePageLayout();

		// Generate table of contents page if enabled
		let tocAdded = false;
		if (includeTOC && headers.length > 0) {
			tocAdded = generateTOCPage(pdf, paper);
		}

		// Generate content pages
		for (let pageIndex = 0; pageIndex < pageLayout.length; pageIndex++) {
			const page = pageLayout[pageIndex];
			
			// Add new page if not first content page or if TOC was added
			if (pageIndex > 0 || tocAdded) {
				pdf.addPage();
			}

			// Add content to page
			let yPosition = marginTop;
			
			for (const element of page.elements) {
				yPosition += element.style.marginTop;
				
				// Set font properties
				pdf.setFontSize(element.style.fontSize);
				pdf.setFont('helvetica', element.style.fontWeight === 'bold' ? 'bold' : 'normal');
				pdf.setTextColor(element.style.color);
				
				// Add background for code blocks
				if (element.type === 'code' && element.style.backgroundColor) {
					const textWidth = paper.width - marginLeft - marginRight - 20; // Account for padding
					const textHeight = (element.content.split('\n').length * element.style.fontSize * element.style.lineHeight * 25.4) / 72;
					
					pdf.setFillColor(element.style.backgroundColor);
					pdf.rect(marginLeft, yPosition - 5, textWidth, textHeight + 10, 'F');
				}
				
				// Add border for blockquotes
				if (element.type === 'blockquote' && element.style.borderLeft) {
					pdf.setDrawColor('#ddd');
					pdf.setLineWidth(1);
					pdf.line(marginLeft - 2, yPosition, marginLeft - 2, yPosition + 20);
				}
				
				// Add text content
				const textWidth = paper.width - marginLeft - marginRight - (element.style.padding || 0) * 2;
				const lines = pdf.splitTextToSize(element.content, textWidth);
				
				pdf.text(lines, marginLeft + (element.style.padding || 0), yPosition);
				
				// Update y position
				const lineHeight = (element.style.fontSize * element.style.lineHeight * 25.4) / 72;
				yPosition += lines.length * lineHeight + element.style.marginBottom;
			}

			// Add logo to each page if provided
			if (logoFile) {
				try {
					const logoDataUrl = await fileToDataURL(logoFile);
					const logoSize = 20; // 20mm
					
					let logoX: number, logoY: number;
					switch (logoPosition) {
						case 'top-left':
							logoX = marginLeft + 5;
							logoY = marginTop + 5;
							break;
						case 'top-right':
							logoX = paper.width - marginRight - logoSize - 5;
							logoY = marginTop + 5;
							break;
						case 'bottom-left':
							logoX = marginLeft + 5;
							logoY = paper.height - marginBottom - logoSize - 5;
							break;
						case 'bottom-right':
							logoX = paper.width - marginRight - logoSize - 5;
							logoY = paper.height - marginBottom - logoSize - 5;
							break;
					}
					
					// Add semi-transparent white background behind logo
					pdf.setFillColor(255, 255, 255);
					pdf.setGState(new pdf.GState({opacity: 0.8}));
					pdf.roundedRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 2, 2, 'F');
					
					// Reset opacity and add logo
					pdf.setGState(new pdf.GState({opacity: 1}));
					pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
				} catch (error) {
					console.error('Error adding logo:', error);
				}
			}
		}

		// Download the PDF
		pdf.save('markdown-document.pdf');
	}

	function fileToDataURL(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					resolve(event.target.result as string);
				} else {
					reject(new Error('Failed to read file'));
				}
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// Update preview when colors change
	$: if (codeBackgroundColor || codeBorderColor || codeTextColor) {
		updatePreview().catch(console.error);
	}
</script>

<div class="markdown-pdf-tool">
	<div class="tool-header">
		<h2>Markdown to PDF Converter</h2>
		<p>Write markdown and convert it to a customized PDF document</p>
	</div>

	<div class="tool-content">
		<!-- Configuration Panel -->
		<div class="config-panel">
			<h3>PDF Configuration</h3>
			
			<!-- Logo Settings -->
			<div class="config-section">
				<h4>Logo Settings</h4>
				<div class="form-group">
					<label for="logo-upload">Logo Image:</label>
					<input
						id="logo-upload"
						type="file"
						accept="image/*"
						on:change={handleLogoUpload}
						class="file-input"
					/>
				</div>
				<div class="form-group">
					<label for="logo-position">Logo Position:</label>
					<select id="logo-position" bind:value={logoPosition} class="select-input">
						<option value="top-left">Top Left</option>
						<option value="top-right">Top Right</option>
						<option value="bottom-left">Bottom Left</option>
						<option value="bottom-right">Bottom Right</option>
					</select>
				</div>
			</div>

			<!-- Page Settings -->
			<div class="config-section">
				<h4>Page Settings</h4>
				<div class="form-group">
					<label for="paper-size">Paper Size:</label>
					<select id="paper-size" bind:value={paperSize} class="select-input">
						<option value="a4">A4</option>
						<option value="a3">A3</option>
						<option value="letter">Letter</option>
						<option value="legal">Legal</option>
					</select>
				</div>
			</div>

			<!-- Margin Settings -->
			<div class="config-section">
				<h4>Margins (mm)</h4>
				<div class="margin-grid">
					<div class="form-group">
						<label for="margin-top">Top:</label>
						<input id="margin-top" type="number" bind:value={marginTop} min="0" max="50" class="number-input" />
					</div>
					<div class="form-group">
						<label for="margin-right">Right:</label>
						<input id="margin-right" type="number" bind:value={marginRight} min="0" max="50" class="number-input" />
					</div>
					<div class="form-group">
						<label for="margin-bottom">Bottom:</label>
						<input id="margin-bottom" type="number" bind:value={marginBottom} min="0" max="50" class="number-input" />
					</div>
					<div class="form-group">
						<label for="margin-left">Left:</label>
						<input id="margin-left" type="number" bind:value={marginLeft} min="0" max="50" class="number-input" />
					</div>
				</div>
			</div>

			<!-- Code Block Styling -->
			<div class="config-section">
				<h4>Code Block Colors</h4>
				<div class="form-group">
					<label for="code-bg">Background:</label>
					<input id="code-bg" type="color" bind:value={codeBackgroundColor} class="color-input" />
				</div>
				<div class="form-group">
					<label for="code-border">Border:</label>
					<input id="code-border" type="color" bind:value={codeBorderColor} class="color-input" />
				</div>
				<div class="form-group">
					<label for="code-text">Text:</label>
					<input id="code-text" type="color" bind:value={codeTextColor} class="color-input" />
				</div>
			</div>

			<!-- Table of Contents -->
			<div class="config-section">
				<h4>Table of Contents</h4>
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={includeTOC} class="checkbox-input" />
						<span class="checkbox-text">Include Table of Contents</span>
					</label>
					{#if includeTOC && headers.length > 0}
						<p class="toc-preview">Found {headers.length} headers</p>
					{/if}
				</div>
			</div>

			<button on:click={generatePDF} class="generate-btn">
				Generate & Download PDF
			</button>
		</div>

		<!-- Editor and Preview -->
		<div class="editor-preview">
			<div class="editor-container">
				<h3>Markdown Editor</h3>
				<div bind:this={editorElement} class="editor"></div>
			</div>

			<div class="preview-container">
				<h3>Preview</h3>
				<div bind:this={previewElement} class="preview"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.markdown-pdf-tool {
		max-width: 100%;
		margin: 0 auto;
	}

	.tool-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--card-background);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.tool-header h2 {
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: 600;
	}

	.tool-header p {
		color: var(--text-secondary);
		margin: 0;
		font-size: 1rem;
	}

	.tool-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
		height: calc(100vh - 250px);
	}

	.config-panel {
		background: var(--card-background);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1.5rem;
		height: fit-content;
		overflow-y: auto;
	}

	.config-panel h3 {
		color: var(--text-primary);
		margin: 0 0 1.5rem 0;
		font-size: 1.2rem;
		font-weight: 600;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
	}

	.config-section {
		margin-bottom: 1.5rem;
	}

	.config-section h4 {
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 500;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.file-input,
	.select-input,
	.number-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--surface-background);
		color: var(--text-primary);
		font-size: 0.9rem;
		transition: border-color 0.2s ease;
	}

	.file-input:focus,
	.select-input:focus,
	.number-input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.color-input {
		width: 100%;
		height: 40px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--surface-background);
		cursor: pointer;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		color: var(--text-primary);
		font-size: 0.9rem;
	}

	.checkbox-input {
		margin-right: 0.5rem;
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.checkbox-text {
		user-select: none;
	}

	.toc-preview {
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-style: italic;
	}

	.margin-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.generate-btn {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 1rem;
	}

	.generate-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
	}

	.editor-preview {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 1rem;
		height: 100%;
	}

	.editor-container,
	.preview-container {
		background: var(--card-background);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.editor-container h3,
	.preview-container h3 {
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
	}

	.editor {
		flex: 1;
		overflow: auto;
		border: 1px solid var(--border-color);
		border-radius: 6px;
	}

	.preview {
		flex: 1;
		overflow: auto;
		padding: 1rem;
		background: var(--surface-background);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		color: var(--text-primary);
		line-height: 1.6;
	}

	.preview :global(h1),
	.preview :global(h2),
	.preview :global(h3),
	.preview :global(h4),
	.preview :global(h5),
	.preview :global(h6) {
		color: var(--text-primary);
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.preview :global(h1) {
		font-size: 1.75rem;
		border-bottom: 2px solid var(--border-color);
		padding-bottom: 0.5rem;
	}

	.preview :global(h2) {
		font-size: 1.5rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.3rem;
	}

	.preview :global(code) {
		background: var(--surface-background);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		font-size: 0.9em;
		border: 1px solid var(--border-color);
	}

	.preview :global(blockquote) {
		border-left: 4px solid var(--primary);
		margin: 1rem 0;
		padding: 0.5rem 1rem;
		background: var(--surface-background);
		font-style: italic;
		color: var(--text-secondary);
	}

	.preview :global(a) {
		color: var(--primary);
		text-decoration: none;
	}

	.preview :global(a:hover) {
		text-decoration: underline;
	}

	@media (max-width: 1024px) {
		.tool-content {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.config-panel {
			height: auto;
		}

		.editor-preview {
			grid-template-rows: 300px 1fr;
		}
	}
</style>