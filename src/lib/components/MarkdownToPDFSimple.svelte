<script lang="ts">
	import { onMount } from 'svelte';
	import { jsPDF } from 'jspdf';
	import { EditorView, basicSetup } from 'codemirror';
	import { markdown } from '@codemirror/lang-markdown';

	let editorElement: HTMLElement;
	let previewElement: HTMLElement;
	let markdownText = `# Sample Markdown Document

## Introduction
This is a **sample markdown** document that you can edit and convert to PDF with basic formatting and **table of contents** support.

### Features
- *Italic text*
- **Bold text**
- ~~Strikethrough text~~
- Basic header styling
- Optional table of contents

## Lists and Quotes

### Ordered List
1. First item with *emphasis*
2. Second item
3. Third item

### Unordered List
- Bullet point with **bold text**
- Another point with *italic text*
- Final point with ~~strikethrough~~

> This is a blockquote example with **bold text** and *italic text*.

## Advanced Formatting

Text with **bold**, *italic*, and ~~strikethrough~~ all in one paragraph.

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

	// ========== Parsing & Layout ==========

	interface TextElement {
		type: 'text' | 'header' | 'list' | 'blockquote';
		content: string;
		level?: number;
		style: {
			fontSize: number;     // pt
			fontWeight: string;   // 'normal' | 'bold'
			lineHeight: number;   // unitless
			marginTop: number;    // pt
			marginBottom: number; // pt
			color: string;
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
				
				// Process basic inline formatting in headers
				text = text
					.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting (jsPDF will handle via fontWeight)
					.replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
					.replace(/~~(.*?)~~/g, '$1');    // Remove strikethrough formatting
				
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
			// Blockquotes
			else if (line.startsWith('>')) {
				let text = line.replace(/^>\s*/, '');
				
				// Process basic inline formatting in blockquotes
				text = text
					.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting (handled via fontWeight)
					.replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
					.replace(/~~(.*?)~~/g, '$1');    // Remove strikethrough formatting
				
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
				
				// Process basic inline formatting in list items
				text = text
					.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting (handled via fontWeight)
					.replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
					.replace(/~~(.*?)~~/g, '$1');    // Remove strikethrough formatting
				
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
					// Process basic inline markdown formatting by removing markup
					let processedText = line
						.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting (handled via fontWeight)
						.replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
						.replace(/~~(.*?)~~/g, '$1')     // Remove strikethrough formatting
						.replace(/&nbsp;/g, ' ');        // Convert &nbsp; to regular space

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
				const tempLines = tmp.splitTextToSize(el.content, widthMm);
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

			const plain = el.content;
			const lines = tmp.splitTextToSize(plain, Math.max(widthMm, 50)); // Minimum width to avoid errors
			const lineHeightMm = el.style.fontSize * el.style.lineHeight * MM_PER_PT;

			const blockHeightMm =
				toMmFromPt(el.style.marginTop) +
				(lines.length * lineHeightMm) +
				toMmFromPt(el.style.marginBottom);

			const requiredMm = blockHeightMm;

			// Check for bottom logo collision and adjust bottom margin
			let availableHeight = paper.height - marginBottom;
			if (logoSpace && (logoSpace.position === 'bottom-left' || logoSpace.position === 'bottom-right')) {
				availableHeight = Math.min(availableHeight, logoSpace.y);
			}

			if ((y + requiredMm > availableHeight) && current.length) {
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
		previewHtml += `<div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000;">`;

		pageLayout.forEach((page) => {
			previewHtml += `<div class="pdf-page" style="
				width: ${paper.width}mm;
				min-height: ${paper.height}mm;
				background: white;
				box-shadow: 0 2px 4px rgba(0,0,0,0.1);
				margin: 0 0 20px 0;
				position: relative;
				border: 1px solid #ddd;
			">`;

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

			previewHtml += `<div class="pdf-content" style="
				position: absolute;
				top: ${marginTop}mm;
				left: ${marginLeft}mm;
				right: ${marginRight}mm;
				bottom: ${marginBottom}mm;
				padding: 0;
				overflow: hidden;
			">`;

			page.elements.forEach(element => {
				if (element.type === 'header') {
					previewHtml += `<h${element.level} style="
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
				else if (element.type === 'blockquote') {
					previewHtml += `<blockquote style="
						border-left: 4px solid #ddd;
						padding-left: ${element.style.padding ?? 0}pt;
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
						padding-left: ${element.style.padding || 20}px;
					">${element.content}</div>`;
				}
				else { // text
					previewHtml += `<p style="
						margin-top: ${element.style.marginTop}pt;
						margin-bottom: ${element.style.marginBottom}pt;
						font-size: ${element.style.fontSize}pt;
						line-height: ${element.style.lineHeight};
						color: ${element.style.color};
					">${element.content}</p>`;
				}
			});

			previewHtml += `</div></div>`;
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
					const tempLines = pdf.splitTextToSize(element.content, textFrameWidth - padMm * 2);
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

				// Blockquote left rule
				if (element.type === 'blockquote' && element.style.borderLeft) {
					const lines = pdf.splitTextToSize(element.content, textFrameWidth - padMm * 2);
					const lineHeightMm = element.style.fontSize * element.style.lineHeight * MM_PER_PT;
					const contentH = (lines.length * lineHeightMm);
					pdf.setDrawColor('#ddd');
					pdf.setLineWidth(0.5);
					pdf.line(textX - 2, yPosition, textX - 2, yPosition + contentH);
				}

				// Plain text
				const lines = pdf.splitTextToSize(element.content, Math.max(textFrameWidth - padMm * 2, 50));
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

	// Update preview when parameters change
	$: if (marginTop || marginRight || marginBottom || marginLeft || paperSize) {
		updatePreview().catch(console.error);
	}
</script>

<div class="markdown-pdf-tool">
	<div class="tool-header">
		<h2>Markdown to PDF Converter</h2>
		<p>Write markdown and convert it to PDF with basic text formatting</p>
		<div class="info-box">
			<strong>✅ Text Mode Benefits:</strong>
			<ul>
				<li>Fast and reliable text-based rendering</li>
				<li>Consistent results across all browsers</li>
				<li>Optimized for simple documents</li>
				<li>Better performance for large documents</li>
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

			<button on:click={generatePDF} class="generate-btn">Generate & Download PDF</button>
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
	
	.info-box {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		border-radius: 6px;
		padding: 1rem;
		margin-top: 1rem;
		color: #155724;
		font-size: 0.9rem;
	}
	.info-box strong { color: #0b432e; margin-bottom: 0.5rem; display: block; }
	.info-box ul { margin: 0.5rem 0 0 0; padding-left: 1.2rem; }
	.info-box li { margin-bottom: 0.3rem; }

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
