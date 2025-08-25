<script lang="ts">
	import { onMount } from 'svelte';
	import { jsPDF } from 'jspdf';
	import { EditorView, basicSetup } from 'codemirror';
	import { markdown } from '@codemirror/lang-markdown';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';
  import html2canvas from 'html2canvas';

	let editorElement: HTMLElement;
	let previewElement: HTMLElement;
	let markdownText = `# Sample Markdown Document

## Introduction
This is a **sample markdown** document that you can edit and convert to PDF with **syntax highlighting**, **proper header styling**, and **table of contents** support.

### Features
- *Italic text*
- **Bold text**
- ~~Strikethrough text~~
- \`Inline code\`
- [Links to websites](https://google.com)
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

### Ordered List with **formatting**
1. First item with *emphasis*
2. Second item with \`code\`
3. Third item with [link](https://example.com)

### Unordered List with ~~strikethrough~~
- Bullet point with **bold text**
- Another point with *italic text*
- Final point with ~~strikethrough~~

### Nested Lists
- Main item 1
  - Nested item A
  - Nested item B
- Main item 2
  - Nested item C with **bold**
  - Nested item D with *italic*

> This is a blockquote example with **bold text**, *italic text*, \`inline code\`, ~~strikethrough~~, and a [link](https://example.com) that stands out from the regular text.

## Advanced Formatting

Text with **bold**, *italic*, ~~strikethrough~~, \`inline code\`, and [links](https://google.com) all in one paragraph.

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

	// Unit helpers (1pt = 1/72 inch ≈ 0.352777... mm)
	const MM_PER_PT = 25.4 / 72;
	const toMmFromPt = (pt: number) => pt * MM_PER_PT;

	let editorView: EditorView;
	let headers: Array<{level: number, text: string, id: string, page?: number}> = [];

	onMount(async () => {
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
		for (const [className, style] of Object.entries(styleMap)) {
			const regex = new RegExp(`<span class="${className}">([^<]*)</span>`, 'g');
			result = result.replace(regex, `<span style="${style}">$1</span>`);
		}
		return result;
	}

	// ========== Parsing & Layout ==========

	interface TextElement {
		type: 'text' | 'header' | 'code' | 'list' | 'blockquote';
		content: string;
		level?: number;
		language?: string;
		style: {
			fontSize: number;     // pt
			fontWeight: string;   // 'normal' | 'bold'
			lineHeight: number;   // unitless
			marginTop: number;    // pt
			marginBottom: number; // pt
			color: string;
			backgroundColor?: string;
			borderLeft?: string;
			padding?: number;     // pt
		};
	}

	interface LogoReservedSpace {
		x: number;      // mm
		y: number;      // mm  
		width: number;  // mm
		height: number; // mm
		position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	}

	function calculateLogoSpace(): LogoReservedSpace | null {
		if (!logoFile) return null;
		
		const paper = paperSizes[paperSize];
		const logoSize = 20; // mm
		const padding = 5; // mm around logo
		
		switch (logoPosition) {
			case 'top-left':
				return { x: marginLeft, y: marginTop, width: logoSize + padding, height: logoSize + padding, position: 'top-left' };
			case 'top-right':
				return { x: paper.width - marginRight - logoSize - padding, y: marginTop, width: logoSize + padding, height: logoSize + padding, position: 'top-right' };
			case 'bottom-left':
				return { x: marginLeft, y: paper.height - marginBottom - logoSize - padding, width: logoSize + padding, height: logoSize + padding, position: 'bottom-left' };
			case 'bottom-right':
				return { x: paper.width - marginRight - logoSize - padding, y: paper.height - marginBottom - logoSize - padding, width: logoSize + padding, height: logoSize + padding, position: 'bottom-right' };
			default:
				return null;
		}
	}

	function parseMarkdownToElements(): TextElement[] {
		const elements: TextElement[] = [];
		const lines = markdownText.split('\n');
		let i = 0;

		while (i < lines.length) {
			const line = lines[i].trim();

			if (!line) { i++; continue; }

			// Headers
			if (line.startsWith('#')) {
				const level = line.match(/^#+/)?.[0].length || 1;
				let text = line.replace(/^#+\s*/, '');
				
				// Process inline formatting in headers
				text = text
					.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
					.replace(/\*(.*?)\*/g, '<i>$1</i>')
					.replace(/`(.*?)`/g, '<code>$1</code>')
					.replace(/~~(.*?)~~/g, '<s>$1</s>');
				
				elements.push({
					type: 'header',
					content: text,
					level,
					style: {
						fontSize: level === 1 ? 18 : level === 2 ? 16 : level === 3 ? 14 : 12,
						fontWeight: 'bold',
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
						padding: 8
					}
				});
			}
			// Blockquotes
			else if (line.startsWith('>')) {
				let text = line.replace(/^>\s*/, '');
				
				// Process inline formatting in blockquotes
				text = text
					.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
					.replace(/\*(.*?)\*/g, '<i>$1</i>')
					.replace(/`(.*?)`/g, '<code>$1</code>')
					.replace(/~~(.*?)~~/g, '<s>$1</s>')
					.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); // Links
				
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
						padding: 8
					}
				});
			}
			// Lists - handle both ordered and unordered, including multi-line content
			else if (line.match(/^(\s*)[-*+]\s/) || line.match(/^(\s*)\d+\.\s/)) {
				const isOrdered = line.match(/^\s*\d+\.\s/);
				const indentMatch = line.match(/^(\s*)/);
				const indent = indentMatch ? indentMatch[1].length : 0;
				
				let text = line.replace(/^\s*[-*+]\s/, '').replace(/^\s*\d+\.\s/, '');
				
				// Process inline formatting in list items
				text = text
					.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
					.replace(/\*(.*?)\*/g, '<i>$1</i>')
					.replace(/`(.*?)`/g, '<code>$1</code>')
					.replace(/~~(.*?)~~/g, '<s>$1</s>')
					.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
				
				const bullet = isOrdered ? '1.' : '•';
				const paddingLeft = 20 + (indent * 10); // Nested indentation
				
				elements.push({
					type: 'list',
					content: `${bullet} ${text}`,
					style: {
						fontSize: 11,
						fontWeight: 'normal',
						lineHeight: 1.5,
						marginTop: 4,
						marginBottom: 4,
						color: '#000',
						padding: paddingLeft
					}
				});
			}
			// Regular text
			else {
				// Check if it's just &nbsp; for blank line
				if (line.trim() === '&nbsp;') {
					elements.push({
						type: 'text',
						content: ' ', // Single space to create blank line
						style: {
							fontSize: 11,
							fontWeight: 'normal',
							lineHeight: 1.6,
							marginTop: 6,
							marginBottom: 6,
							color: '#000'
						}
					});
				} else {
					// Process all inline markdown formatting
					let processedText = line
						.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
						.replace(/\*(.*?)\*/g, '<i>$1</i>')
						.replace(/`(.*?)`/g, '<code>$1</code>')
						.replace(/~~(.*?)~~/g, '<s>$1</s>')
						.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
						.replace(/&nbsp;/g, ' '); // Convert &nbsp; to regular space

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
			}

			i++;
		}

		return elements;
	}

	function extractHeadersFromElements(elements: TextElement[]) {
		headers = [];
		let counter = 0;
		for (const el of elements) {
			if (el.type === 'header') {
				counter++;
				headers.push({ level: el.level || 1, text: el.content, id: `header-${counter}` });
			}
		}
	}

	function simulatePageLayout(): Array<{elements: TextElement[], page: number, logoSpace?: LogoReservedSpace}> {
		const paper = paperSizes[paperSize];
		const tmp = new jsPDF({ unit: 'mm', format: [paper.width, paper.height] });

		const pages: Array<{elements: TextElement[], page: number, logoSpace?: LogoReservedSpace}> = [];
		const elements = parseMarkdownToElements();
		const logoSpace = calculateLogoSpace();

		extractHeadersFromElements(elements);

		const contentWidthMm = paper.width - marginLeft - marginRight;
		let current: TextElement[] = [];
		let y = marginTop;
		let pageNo = includeTOC ? 2 : 1;

		const pushPage = () => {
			if (current.length) pages.push({ elements: current, page: pageNo, logoSpace });
			current = [];
			y = marginTop;
			pageNo += 1;
		};

		for (const el of elements) {
			tmp.setFontSize(el.style.fontSize);
			const isBold = el.style.fontWeight === 'bold' || (el.type === 'header' && el.style.fontWeight !== 'normal');
			tmp.setFont('helvetica', isBold ? 'bold' : 'normal');

			const padMm = toMmFromPt(el.style.padding || 0);
			let widthMm = contentWidthMm - 2 * padMm;

			// Check if this specific text element would overlap with logo
			let adjustForLogo = false;
			if (logoSpace) {
				const elementStartY = y + toMmFromPt(el.style.marginTop);
				// First, check with normal width to see how many lines we'd have
				const plain = stripInlineHtml(el.content);
				const tempLines = tmp.splitTextToSize(plain, widthMm);
				const lineHeightMm = el.style.fontSize * el.style.lineHeight * MM_PER_PT;
				const elementEndY = elementStartY + (tempLines.length * lineHeightMm);
				
				// Only adjust if this element actually overlaps with logo vertically
				adjustForLogo = elementStartY < logoSpace.y + logoSpace.height && elementEndY > logoSpace.y;
			}

			// Adjust width only if there's actual overlap
			if (adjustForLogo && logoSpace) {
				if (logoSpace.position === 'top-left' || logoSpace.position === 'bottom-left') {
					// Logo is on left, reduce content width and move content right
					const logoRight = logoSpace.x + logoSpace.width;
					if (logoRight > marginLeft) {
						widthMm = paper.width - logoRight - marginRight - 2 * padMm;
					}
				} else if (logoSpace.position === 'top-right' || logoSpace.position === 'bottom-right') {
					// Logo is on right, just reduce content width
					const logoLeft = logoSpace.x;
					if (logoLeft < paper.width - marginRight) {
						widthMm = logoLeft - marginLeft - 2 * padMm;
					}
				}
			}

			// For code we measure line-count roughly via splitTextToSize as plain text; actual PDF drawing uses token widths, but height approximation is okay.
			const plain = stripInlineHtml(el.content);
			const lines = tmp.splitTextToSize(plain, Math.max(widthMm, 50)); // Minimum width to avoid errors
			const lineHeightMm = el.style.fontSize * el.style.lineHeight * MM_PER_PT;

			const blockHeightMm =
				toMmFromPt(el.style.marginTop) +
				(lines.length * lineHeightMm) +
				toMmFromPt(el.style.marginBottom);

			const blockHeightWithPadMm = blockHeightMm + (el.style.padding ? 2 * padMm : 0);
			const requiredMm = el.type === 'code' ? blockHeightWithPadMm : blockHeightMm;

			const shouldBreakBefore =
				el.type === 'header' ||
				el.type === 'code' ||
				(current.length && current[current.length - 1].type === 'header');

			if ((y + requiredMm > (paper.height - marginBottom)) && current.length) {
				pushPage();
			}

			if (el.type === 'header') {
				const idx = headers.findIndex(h => h.text === el.content);
				if (idx !== -1) headers[idx].page = pageNo;
			}

			current.push(el);
			y += requiredMm;
		}

		if (current.length) pages.push({ elements: current, page: pageNo, logoSpace });
		return pages;
	}

	// ========== Preview (with visible margins) ==========
async function updatePreview() {
  const paper = paperSizes[paperSize];
  const pageLayout = simulatePageLayout();

  let previewHtml = '';
  // wrapper (no special class needed)
  previewHtml += `<div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000;">`;

  pageLayout.forEach((page) => {
    // Full page — THIS is the element we’ll snapshot parent of the content
    previewHtml += `<div class="pdf-page" style="
      width: ${paper.width}mm;
      min-height: ${paper.height}mm;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 0 0 20px 0;
      position: relative;
      border: 1px solid #ddd;
    ">`;

    // Page number indicator (outside content frame)
    previewHtml += `<div style="position: absolute; top: 5px; right: 10px; font-size: 10px; color: #666;">Page ${page.page}</div>`;

    // Show logo placeholder in preview
    if (page.logoSpace && logoFile) {
      previewHtml += `<div style="
        position: absolute;
        left: ${page.logoSpace.x}mm;
        top: ${page.logoSpace.y}mm;
        width: 20mm;
        height: 20mm;
        background: rgba(0, 123, 255, 0.2);
        border: 2px dashed #007bff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: #007bff;
        font-weight: bold;
      ">LOGO</div>`;
    }

    // Inner content frame (respects margins) — THIS is what we snapshot with html2canvas
    previewHtml += `<div class="pdf-content" style="
      position: absolute;
      top: ${marginTop}mm;
      left: ${marginLeft}mm;
      right: ${marginRight}mm;
      bottom: ${marginBottom}mm;
      padding: 0;
      overflow: hidden;
    ">`;

    // Render the page elements like before
    page.elements.forEach(element => {
      if (element.type === 'header') {
        // Process HTML tags in headers
        let headerContent = element.content
          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
          .replace(/<s>(.*?)<\/s>/g, '<span style="text-decoration: line-through;">$1</span>')
          .replace(/<code>(.*?)<\/code>/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
        
        previewHtml += `<h${element.level} style="
          font-size: ${element.style.fontSize}pt;
          font-weight: ${element.style.fontWeight};
          line-height: ${element.style.lineHeight};
          margin-top: ${element.style.marginTop}pt;
          margin-bottom: ${element.style.marginBottom}pt;
          color: ${element.style.color};
          ${element.level === 1 ? 'border-bottom: 2px solid #333; padding-bottom: 0.3em;' : ''}
          ${element.level === 2 ? 'border-bottom: 1px solid #666; padding-bottom: 0.2em;' : ''}
        ">${headerContent}</h${element.level}>`;
      }
      else if (element.type === 'code') {
        let highlightedCode = element.content;
        if (element.language && hljs.getLanguage(element.language)) {
          try {
            const highlighted = hljs.highlight(element.content, { language: element.language }).value;
            highlightedCode = convertHighlightJSToInlineStyles(highlighted);
          } catch {}
        }
        previewHtml += `<pre style="
          background-color: ${element.style.backgroundColor};
          border: 1px solid ${codeBorderColor};
          padding: ${element.style.padding ?? 0}pt;
          border-radius: 4px;
          margin-top: ${element.style.marginTop}pt;
          margin-bottom: ${element.style.marginBottom}pt;
          font-size: ${element.style.fontSize}pt;
          line-height: ${element.style.lineHeight};
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        "><code style="color: ${element.style.color}; font-family: 'Courier New', monospace;">${highlightedCode}</code></pre>`;
      }
      else if (element.type === 'blockquote') {
        // Process HTML tags in blockquotes
        let blockquoteContent = element.content
          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
          .replace(/<s>(.*?)<\/s>/g, '<span style="text-decoration: line-through;">$1</span>')
          .replace(/<code>(.*?)<\/code>/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
          .replace(/<a href="([^"]*)">(.*?)<\/a>/g, '<a href="$1" style="color: #0066cc; text-decoration: none;">$2</a>');
        
        previewHtml += `<blockquote style="
          border-left: 4px solid #ddd;
          padding-left: ${element.style.padding ?? 0}pt;
          margin-top: ${element.style.marginTop}pt;
          margin-bottom: ${element.style.marginBottom}pt;
          font-size: ${element.style.fontSize}pt;
          line-height: ${element.style.lineHeight};
          color: ${element.style.color};
          font-style: italic;
        ">${blockquoteContent}</blockquote>`;
      }
      else if (element.type === 'list') {
        // Process HTML tags in list content
        let listContent = element.content
          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
          .replace(/<s>(.*?)<\/s>/g, '<span style="text-decoration: line-through;">$1</span>')
          .replace(/<code>(.*?)<\/code>/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
          .replace(/<a href="([^"]*)">(.*?)<\/a>/g, '<a href="$1" style="color: #0066cc; text-decoration: none;">$2</a>');
        
        previewHtml += `<div style="
          margin-top: ${element.style.marginTop}pt;
          margin-bottom: ${element.style.marginBottom}pt;
          font-size: ${element.style.fontSize}pt;
          line-height: ${element.style.lineHeight};
          color: ${element.style.color};
          padding-left: ${element.style.padding || 20}px;
        ">${listContent}</div>`;
      }
      else { // text
        let content = element.content
          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
          .replace(/<s>(.*?)<\/s>/g, '<span style="text-decoration: line-through;">$1</span>')
          .replace(/<code>(.*?)<\/code>/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
          .replace(/<a href="([^"]*)">(.*?)<\/a>/g, '<a href="$1" style="color: #0066cc; text-decoration: none;">$2</a>');

        previewHtml += `<p style="
          margin-top: ${element.style.marginTop}pt;
          margin-bottom: ${element.style.marginBottom}pt;
          font-size: ${element.style.fontSize}pt;
          line-height: ${element.style.lineHeight};
          color: ${element.style.color};
        ">${content}</p>`;
      }
    });

    previewHtml += `</div></div>`; // close .pdf-content then .pdf-page
  });

  previewHtml += `</div>`;
  if (previewElement) previewElement.innerHTML = previewHtml;
}

	
	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			logoFile = target.files[0];
		}
	}

	function generateTOCPage(pdf: jsPDF, paper: any) {
		if (!includeTOC || headers.length === 0) return false;

		pdf.setFontSize(24);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Table of Contents', marginLeft, marginTop + 10);

		let yPosition = marginTop + 25;
		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');

		headers.forEach((header) => {
			if (yPosition > paper.height - marginBottom - 10) {
				pdf.addPage();
				yPosition = marginTop;
			}

			const indent = (header.level - 1) * 8;
			const pageNum = header.page || 1;
			const headerText = header.text;
			const truncatedText = headerText.length > 50 ? headerText.substring(0, 47) + '...' : headerText;

			pdf.text(truncatedText, marginLeft + indent, yPosition);
			pdf.text(String(pageNum), paper.width - marginRight - 10, yPosition);

			yPosition += 7;
		});

		return true;
	}

	// ========== Helpers for PDF drawing ==========

	function stripInlineHtml(s: string): string {
		// removes <b>, <i>, <code>, <span style=...> etc.
		return s.replace(/<[^>]+>/g, '');
	}

	// Very small HTML style parser for spans produced by hljs
	function parseSpanTokens(html: string): Array<{ text: string; color?: string; fontStyle?: 'normal'|'italic'; fontWeight?: 'normal'|'bold'; }> {
		const out: Array<{ text: string; color?: string; fontStyle?: 'normal'|'italic'; fontWeight?: 'normal'|'bold'; }> = [];

		// Replace <br> with newline markers
		html = html.replace(/<br\s*\/?>/gi, '\n');

		// Split by tags but keep text; handle <span style="...">...</span>
		const regex = /<span\s+style="([^"]*)">([\s\S]*?)<\/span>|([^<]+)/gi;
		let m: RegExpExecArray | null;
		while ((m = regex.exec(html))) {
			if (m[1] != null) {
				const style = m[1];
				const text = m[2];
				const token: any = { text };
				if (/font-weight\s*:\s*bold/i.test(style)) token.fontWeight = 'bold';
				if (/font-style\s*:\s*italic/i.test(style)) token.fontStyle = 'italic';
				const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
				if (colorMatch) token.color = colorMatch[1].trim();
				out.push(token);
			} else if (m[3]) {
				out.push({ text: m[3] });
			}
		}
		return out;
	}

	// Draw highlighted code with basic wrapping
	function drawHighlightedCodeBlock(pdf: jsPDF, x: number, y: number, maxWidthMm: number, element: TextElement): number {
		const fontSize = element.style.fontSize;
		const lineHeightMm = fontSize * element.style.lineHeight * MM_PER_PT;
		pdf.setFont('courier', 'normal'); // monospace

		let html = element.content;
		if (element.language && hljs.getLanguage(element.language)) {
			try {
				const highlighted = hljs.highlight(element.content, { language: element.language }).value;
				html = convertHighlightJSToInlineStyles(highlighted);
			} catch {
				// fallback: no highlight
			}
		} else {
			// no language: escape as plain text
			html = element.content.replace(/&/g, '&amp;').replace(/</g, '&lt;');
		}

		const tokens = parseSpanTokens(html);
		let cursorX = x;
		let cursorY = y;
		const spaceW = pdf.getTextWidth(' ');

		const padMm = toMmFromPt(element.style.padding || 0);
		const innerX = x + padMm;
		const innerWidth = maxWidthMm - 2 * padMm;
		cursorX = innerX;

		// background box already drawn by caller
		for (const t of tokens) {
			const parts = t.text.split(/(\s+)/); // keep spaces as tokens
			for (const p of parts) {
				if (p === '') continue;

				// Handle explicit newlines inside tokens
				const lines = p.split('\n');
				for (let li = 0; li < lines.length; li++) {
					let segment = lines[li];
					if (segment.length === 0) {
						// newline
						cursorX = innerX;
						cursorY += lineHeightMm;
						continue;
					}

					// Measure width
					// Apply style temporarily to measure near-accurately
					const weight = t.fontWeight === 'bold' ? 'bold' : 'normal';
					const style = t.fontStyle === 'italic' ? 'italic' : 'normal';
					pdf.setFont('courier', (weight === 'bold' ? 'bold' : 'normal'));
					pdf.setFontSize(fontSize);

					// jsPDF doesn't support both bold+italic together for 'courier' by default; bold only is fine.

					let remaining = segment;
					while (remaining.length) {
						// Greedy fit
						let len = remaining.length;
						while (len > 0 && (cursorX - innerX + pdf.getTextWidth(remaining.slice(0, len))) > innerWidth) {
							len--;
						}
						if (len === 0) {
							// force wrap
							cursorX = innerX;
							cursorY += lineHeightMm;
							continue;
						}
						const chunk = remaining.slice(0, len);
						remaining = remaining.slice(len);

						// Set color
						if (t.color) pdf.setTextColor(t.color); else pdf.setTextColor(element.style.color);

						pdf.text(chunk, cursorX, cursorY);
						cursorX += pdf.getTextWidth(chunk);

						// If we've exactly filled the line, wrap for next chunk
						if (cursorX - innerX >= innerWidth - 0.1) {
							cursorX = innerX;
							cursorY += lineHeightMm;
						}
					}

					// If original part was a newline break and not last line
					if (li < lines.length - 1) {
						cursorX = innerX;
						cursorY += lineHeightMm;
					}
				}
			}
		}

		// Return consumed height from top y to last baseline + a small trailing pad
		return (cursorY - y) + padMm;
	}
async function generatePDFFromPreview() {
  const paper = paperSizes[paperSize];
  const pdf = new jsPDF({ unit: 'mm', format: [paper.width, paper.height] });

  // Add TOC if enabled
  let tocAdded = false;
  if (includeTOC && headers.length > 0) {
    tocAdded = generateTOCPage(pdf, paper);
  }

  // Grab all rendered preview "pages"
  const pages = Array.from(previewElement?.querySelectorAll<HTMLElement>('.pdf-page') || []);
  if (!pages.length) {
    console.warn('No preview pages found.');
    return;
  }

  // Scale for sharpness (2–3 is a good balance)
  const scale = Math.max(2, Math.floor(window.devicePixelRatio || 2));

  for (let i = 0; i < pages.length; i++) {
    if (i > 0 || tocAdded) pdf.addPage();

    // We only snapshot the inner content box (the margins are real PDF margins)
    const content = pages[i].querySelector<HTMLElement>('.pdf-content');
    if (!content) continue;

    // Snapshot the content area exactly as it appears
    const canvas = await html2canvas(content, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,        // allows same-origin images; external images must support CORS
      allowTaint: false,
      logging: false,
      windowWidth: document.documentElement.clientWidth // helps consistent layout
    });

    const imgData = canvas.toDataURL('image/png');

    // Place the snapshot inside the page margins
    const x = marginLeft;
    const y = marginTop;
    const targetW = paper.width - marginLeft - marginRight;
    const targetH = paper.height - marginTop - marginBottom;

    // Preserve aspect ratio of the captured content (should already match)
    const imgWmm = targetW;
    const imgHmm = (canvas.height / canvas.width) * imgWmm;

    // If for some reason it’s taller than the content box, scale to fit height
    let drawW = imgWmm;
    let drawH = imgHmm;
    if (imgHmm > targetH) {
      drawH = targetH;
      drawW = (canvas.width / canvas.height) * drawH;
    }

    pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);

    // Optional: add logo overlay after the page image
    if (logoFile) {
      try {
        const logoDataUrl = await fileToDataURL(logoFile);
        const logoSize = 20; // mm
        let logoX = marginLeft + 5;
        let logoY = marginTop + 5;
        switch (logoPosition) {
          case 'top-right':
            logoX = paper.width - marginRight - logoSize - 5; logoY = marginTop + 5; break;
          case 'bottom-left':
            logoX = marginLeft + 5; logoY = paper.height - marginBottom - logoSize - 5; break;
          case 'bottom-right':
            logoX = paper.width - marginRight - logoSize - 5; logoY = paper.height - marginBottom - logoSize - 5; break;
        }
        pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (e) {
        console.error('Logo add failed', e);
      }
    }
  }

  pdf.save('markdown-document.pdf');
}

	async function generatePDF() {
		const paper = paperSizes[paperSize];
		const pdf = new jsPDF({ unit: 'mm', format: [paper.width, paper.height] });

		const pageLayout = simulatePageLayout();

		let tocAdded = false;
		if (includeTOC && headers.length > 0) {
			tocAdded = generateTOCPage(pdf, paper);
		}

		for (let pageIndex = 0; pageIndex < pageLayout.length; pageIndex++) {
			const page = pageLayout[pageIndex];
			if (pageIndex > 0 || tocAdded) pdf.addPage();

			let yPosition = marginTop;
			const logoSpace = page.logoSpace;

			for (const element of page.elements) {
				const mtMm = toMmFromPt(element.style.marginTop);
				const mbMm = toMmFromPt(element.style.marginBottom);
				const padMm = toMmFromPt(element.style.padding || 0);
				let textFrameWidth = paper.width - marginLeft - marginRight;
				let textX = marginLeft + padMm;

				// Check if this specific element would overlap with logo (same as layout simulation)
				let adjustForLogo = false;
				if (logoSpace) {
					const elementStartY = yPosition + mtMm;
					// First check with normal width to see element size
					pdf.setFontSize(element.style.fontSize);
					const isBold = element.style.fontWeight === 'bold' || (element.type === 'header' && element.style.fontWeight !== 'normal');
					pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
					const plain = stripInlineHtml(element.content);
					const tempLines = pdf.splitTextToSize(plain, textFrameWidth - padMm * 2);
					const lineHeightMm = element.style.fontSize * element.style.lineHeight * MM_PER_PT;
					const elementEndY = elementStartY + (tempLines.length * lineHeightMm);
					
					// Only adjust if this element actually overlaps with logo vertically
					adjustForLogo = elementStartY < logoSpace.y + logoSpace.height && elementEndY > logoSpace.y;
				}

				// Adjust text positioning only if there's actual overlap
				if (adjustForLogo && logoSpace) {
					if (logoSpace.position === 'top-left' || logoSpace.position === 'bottom-left') {
						// Logo is on left, move text right
						const logoRight = logoSpace.x + logoSpace.width;
						if (logoRight > marginLeft) {
							textX = logoRight;
							textFrameWidth = paper.width - logoRight - marginRight;
						}
					} else if (logoSpace.position === 'top-right' || logoSpace.position === 'bottom-right') {
						// Logo is on right, reduce text width
						const logoLeft = logoSpace.x;
						if (logoLeft < paper.width - marginRight) {
							textFrameWidth = logoLeft - marginLeft;
						}
					}
				}

				yPosition += mtMm;

				// font setup
				const isBold = element.style.fontWeight === 'bold' || (element.type === 'header' && element.style.fontWeight !== 'normal');
				pdf.setFontSize(element.style.fontSize);
				pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
				pdf.setTextColor(element.style.color);

				if (element.type === 'code') {
					// background box
					const approxLines = pdf.splitTextToSize(stripInlineHtml(element.content), Math.max(textFrameWidth - 2 * padMm, 50));
					const approxLH = element.style.fontSize * element.style.lineHeight * MM_PER_PT;
					const approxBgH = (approxLines.length * approxLH) + 2 * padMm;
					pdf.setFillColor(element.style.backgroundColor as any);
					pdf.rect(textX - padMm, yPosition - padMm, textFrameWidth, approxBgH, 'F');

					// actual highlighted text drawing
					const consumed = drawHighlightedCodeBlock(pdf, textX, yPosition, textFrameWidth, element);

					// border (optional)
					pdf.setDrawColor(codeBorderColor);
					pdf.rect(textX - padMm, yPosition - padMm, textFrameWidth, Math.max(approxBgH, consumed + padMm), 'S');

					yPosition += Math.max(approxBgH, consumed + padMm);
					yPosition += mbMm;
					continue;
				}

				// Blockquote left rule
				if (element.type === 'blockquote' && element.style.borderLeft) {
					const plain = stripInlineHtml(element.content);
					const lines = pdf.splitTextToSize(plain, Math.max(textFrameWidth - padMm * 2, 50));
					const lineHeightMm = element.style.fontSize * element.style.lineHeight * MM_PER_PT;
					const contentH = (lines.length * lineHeightMm);
					pdf.setDrawColor('#ddd');
					pdf.setLineWidth(0.5);
					pdf.line(textX - 2, yPosition, textX - 2, yPosition + contentH);
				}

				// Plain text (strip inline HTML so no raw tags appear)
				const plain = stripInlineHtml(element.content);
				const lines = pdf.splitTextToSize(plain, Math.max(textFrameWidth - padMm * 2, 50));
				pdf.text(lines, textX, yPosition);

				const lineHeightMm = element.style.fontSize * element.style.lineHeight * MM_PER_PT;
				yPosition += (lines.length * lineHeightMm) + mbMm;
			}

			// Add logo per page using the calculated space
			if (logoFile && logoSpace) {
				try {
					const logoDataUrl = await fileToDataURL(logoFile);
					const logoSize = 20; // mm
					const logoX = logoSpace.x;
					const logoY = logoSpace.y;

					// Add subtle background for logo
					if ((pdf as any).GState) {
						pdf.setFillColor(255, 255, 255);
						pdf.setGState(new (pdf as any).GState({ opacity: 0.8 }));
						pdf.roundedRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 2, 2, 'F');
						pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
					}

					pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
				} catch (error) {
					console.error('Error adding logo:', error);
				}
			}
		}

		pdf.save('markdown-document.pdf');
	}

	function fileToDataURL(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) resolve(event.target.result as string);
				else reject(new Error('Failed to read file'));
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// Update preview when colors change
	$: if (codeBackgroundColor || codeBorderColor || codeTextColor || marginTop || marginRight || marginBottom || marginLeft || paperSize) {
		updatePreview().catch(console.error);
	}
</script>

<div class="markdown-pdf-tool">
	<div class="tool-header">
		<h2>Markdown to PDF Converter (Canvas)</h2>
		<p>Write markdown and convert it to a customized PDF document</p>
		<div class="warning-box">
			<strong>⚠️ Canvas Mode Limitations:</strong>
			<ul>
				<li>May have text rendering issues in some browsers</li>
				<li>Large documents can cause performance problems</li>
				<li>Complex layouts might not convert perfectly</li>
				<li>For simple documents, use the text-based converter instead</li>
			</ul>
		</div>
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
					<input id="logo-upload" type="file" accept="image/*" on:change={handleLogoUpload} class="file-input" />
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

			<button on:click={generatePDFFromPreview} class="generate-btn">Generate & Download PDF</button>
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
	.markdown-pdf-tool { max-width: 100%; margin: 0 auto; }

	.tool-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--card-background);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}
	.tool-header h2 { color: var(--text-primary); margin: 0 0 0.5rem 0; font-size: 1.75rem; font-weight: 600; }
	.tool-header p { color: var(--text-secondary); margin: 0 0 1rem 0; font-size: 1rem; }
	
	.warning-box {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 6px;
		padding: 1rem;
		margin-top: 1rem;
		color: #856404;
		font-size: 0.9rem;
	}
	.warning-box strong { color: #6c5700; margin-bottom: 0.5rem; display: block; }
	.warning-box ul { margin: 0.5rem 0 0 0; padding-left: 1.2rem; }
	.warning-box li { margin-bottom: 0.3rem; }

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
	.config-section { margin-bottom: 1.5rem; }
	.config-section h4 { color: var(--text-primary); margin: 0 0 1rem 0; font-size: 1rem; font-weight: 500; }
	.form-group { margin-bottom: 1rem; }
	.form-group label { display: block; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }

	.file-input, .select-input, .number-input {
		width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px;
		background: var(--surface-background); color: var(--text-primary); font-size: 0.9rem;
		transition: border-color 0.2s ease;
	}
	.file-input:focus, .select-input:focus, .number-input:focus { outline: none; border-color: var(--primary); }
	.color-input { width: 100%; height: 40px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--surface-background); cursor: pointer; }

	.checkbox-label { display: flex; align-items: center; cursor: pointer; color: var(--text-primary); font-size: 0.9rem; }
	.checkbox-input { margin-right: 0.5rem; width: 16px; height: 16px; cursor: pointer; }
	.checkbox-text { user-select: none; }
	.toc-preview { margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); font-style: italic; }

	.margin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

	.generate-btn {
		width: 100%; padding: 1rem;
		background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
		color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
		cursor: pointer; transition: all 0.2s ease; margin-top: 1rem;
	}
	.generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); }

	.editor-preview { display: grid; grid-template-rows: auto 1fr; gap: 1rem; height: 100%; }
	.editor-container {
		background: var(--card-background); border: 1px solid var(--border-color); border-radius: 8px;
		padding: 1rem; overflow: visible; display: flex; flex-direction: column;
		height: fit-content;
	}
	
	.preview-container {
		background: var(--card-background); border: 1px solid var(--border-color); border-radius: 8px;
		padding: 1rem; overflow: hidden; display: flex; flex-direction: column;
	}
	.editor-container h3, .preview-container h3 {
		color: var(--text-primary); margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;
		border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;
	}
	.editor { 
		min-height: 200px;
		border: 1px solid var(--border-color); 
		border-radius: 6px; 
	}
	
	:global(.editor .cm-editor) {
		min-height: 200px !important;
	}
	
	:global(.editor .cm-content) {
		min-height: 200px !important;
	}

	.preview { flex: 1; overflow: auto; padding: 1rem; background: var(--surface-background); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); line-height: 1.6; }

	@media (max-width: 1024px) {
		.tool-content { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
		.config-panel { height: auto; }
		.editor-preview { grid-template-rows: 300px 1fr; }
	}
</style>

