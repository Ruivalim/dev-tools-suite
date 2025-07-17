import CodeMirror from 'codemirror';
import * as Diff from 'diff';
import * as Diff2Html from 'diff2html/lib/ui/js/diff2html-ui';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'diff2html/bundles/css/diff2html.min.css';
import './index.css';

// Tool navigation
function switchTool(toolName: string) {
  // Update active tool button
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tool="${toolName}"]`)?.classList.add('active');
  
  // Update active tool content
  document.querySelectorAll('.tool-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`tool-${toolName}`)?.classList.add('active');
}

// Initialize tool navigation
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const toolName = (e.target as HTMLElement).getAttribute('data-tool');
    if (toolName) {
      switchTool(toolName);
      // Initialize editors only when switching to the tool
      initializeToolEditors(toolName);
    }
  });
});

function initializeToolEditors(toolName: string) {
  switch (toolName) {
    case 'js-minifier':
      if (!jsInputEditor) initJavaScriptTool();
      break;
    case 'css-minifier':
      if (!cssInputEditor) initCssTool();
      break;
    case 'json-formatter':
      if (!jsonInputEditor) initJsonTool();
      break;
  }
}

// Base64 Tool
const base64Input = document.getElementById('base64-input') as HTMLTextAreaElement;
const base64Output = document.getElementById('base64-output') as HTMLTextAreaElement;
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const clearBase64Btn = document.getElementById('clear-base64');
const copyBase64Btn = document.getElementById('copy-base64');

function encodeBase64() {
  try {
    const input = base64Input.value;
    const encoded = btoa(unescape(encodeURIComponent(input)));
    base64Output.value = encoded;
  } catch (error) {
    base64Output.value = 'Error: Invalid input for encoding';
  }
}

function decodeBase64() {
  try {
    const input = base64Input.value;
    const decoded = decodeURIComponent(escape(atob(input)));
    base64Output.value = decoded;
  } catch (error) {
    base64Output.value = 'Error: Invalid base64 input';
  }
}

function clearBase64() {
  base64Input.value = '';
  base64Output.value = '';
}

function copyBase64() {
  base64Output.select();
  document.execCommand('copy');
  const originalText = copyBase64Btn?.textContent;
  if (copyBase64Btn) {
    copyBase64Btn.textContent = 'Copied!';
    setTimeout(() => {
      copyBase64Btn.textContent = originalText;
    }, 2000);
  }
}

encodeBtn?.addEventListener('click', encodeBase64);
decodeBtn?.addEventListener('click', decodeBase64);
clearBase64Btn?.addEventListener('click', clearBase64);
copyBase64Btn?.addEventListener('click', copyBase64);

// JavaScript Tool - Create CodeMirror editors
let jsInputEditor: CodeMirror.Editor;
let jsOutputEditor: CodeMirror.Editor;

function initJavaScriptTool() {
  const jsInputElement = document.getElementById('js-input');
  const jsOutputElement = document.getElementById('js-output');
  
  if (jsInputElement && jsOutputElement && !jsInputEditor) {
    // Clear any existing content first
    jsInputElement.innerHTML = '';
    jsOutputElement.innerHTML = '';
    
    jsInputEditor = CodeMirror(jsInputElement, {
      lineNumbers: true,
      mode: 'javascript',
      theme: 'default',
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
    });

    jsOutputEditor = CodeMirror(jsOutputElement, {
      lineNumbers: true,
      mode: 'javascript',
      theme: 'default',
      lineWrapping: true,
      readOnly: true,
      indentUnit: 2,
      tabSize: 2,
    });
  }
}

function minifyJavaScript() {
  const input = jsInputEditor.getValue();
  try {
    // Simple minification - remove comments and extra whitespace
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
    
    jsOutputEditor.setValue(minified);
  } catch (error) {
    jsOutputEditor.setValue('Error: Unable to minify JavaScript');
  }
}

function beautifyJavaScript() {
  const input = jsInputEditor.getValue();
  try {
    // Simple beautification with basic indentation
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
    
    jsOutputEditor.setValue(formatted.trim());
  } catch (error) {
    jsOutputEditor.setValue('Error: Unable to beautify JavaScript');
  }
}

function clearJavaScript() {
  jsInputEditor.setValue('');
  jsOutputEditor.setValue('');
}

function copyJavaScript() {
  const output = jsOutputEditor.getValue();
  navigator.clipboard.writeText(output).then(() => {
    const copyBtn = document.getElementById('copy-js');
    const originalText = copyBtn?.textContent;
    if (copyBtn) {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }
  });
}

document.getElementById('minify-js-btn')?.addEventListener('click', minifyJavaScript);
document.getElementById('beautify-js-btn')?.addEventListener('click', beautifyJavaScript);
document.getElementById('clear-js')?.addEventListener('click', clearJavaScript);
document.getElementById('copy-js')?.addEventListener('click', copyJavaScript);

// CSS Tool - Create CodeMirror editors
let cssInputEditor: CodeMirror.Editor;
let cssOutputEditor: CodeMirror.Editor;

function initCssTool() {
  const cssInputElement = document.getElementById('css-input');
  const cssOutputElement = document.getElementById('css-output');
  
  if (cssInputElement && cssOutputElement && !cssInputEditor) {
    // Clear any existing content first
    cssInputElement.innerHTML = '';
    cssOutputElement.innerHTML = '';
    
    cssInputEditor = CodeMirror(cssInputElement, {
      lineNumbers: true,
      mode: 'css',
      theme: 'default',
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
    });

    cssOutputEditor = CodeMirror(cssOutputElement, {
      lineNumbers: true,
      mode: 'css',
      theme: 'default',
      lineWrapping: true,
      readOnly: true,
      indentUnit: 2,
      tabSize: 2,
    });
  }
}

function minifyCSS() {
  const input = cssInputEditor.getValue();
  try {
    const minified = input
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/;\s*}/g, ';}') // Remove space before closing brace
      .replace(/{\s*/g, '{') // Remove space after opening brace
      .replace(/}\s*/g, '}') // Remove space after closing brace
      .replace(/,\s*/g, ',') // Remove space after comma
      .replace(/:\s*/g, ':') // Remove space after colon
      .replace(/;\s*/g, ';') // Remove space after semicolon
      .replace(/\s*>\s*/g, '>') // Remove space around child combinator
      .replace(/\s*\+\s*/g, '+') // Remove space around adjacent sibling combinator
      .replace(/\s*~\s*/g, '~') // Remove space around general sibling combinator
      .trim();
    
    cssOutputEditor.setValue(minified);
  } catch (error) {
    cssOutputEditor.setValue('Error: Unable to minify CSS');
  }
}

function beautifyCSS() {
  const input = cssInputEditor.getValue();
  try {
    let formatted = input;
    let indentLevel = 0;
    const indentSize = 2;
    
    // Add line breaks after selectors and properties
    formatted = formatted.replace(/{\s*/g, ' {\n' + ' '.repeat((++indentLevel) * indentSize));
    formatted = formatted.replace(/;\s*/g, ';\n' + ' '.repeat(indentLevel * indentSize));
    formatted = formatted.replace(/}\s*/g, '\n' + ' '.repeat((--indentLevel) * indentSize) + '}\n\n');
    formatted = formatted.replace(/,\s*/g, ',\n');
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excess blank lines
    
    cssOutputEditor.setValue(formatted.trim());
  } catch (error) {
    cssOutputEditor.setValue('Error: Unable to beautify CSS');
  }
}

function clearCSS() {
  cssInputEditor.setValue('');
  cssOutputEditor.setValue('');
}

function copyCSS() {
  const output = cssOutputEditor.getValue();
  navigator.clipboard.writeText(output).then(() => {
    const copyBtn = document.getElementById('copy-css');
    const originalText = copyBtn?.textContent;
    if (copyBtn) {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }
  });
}

document.getElementById('minify-css-btn')?.addEventListener('click', minifyCSS);
document.getElementById('beautify-css-btn')?.addEventListener('click', beautifyCSS);
document.getElementById('clear-css')?.addEventListener('click', clearCSS);
document.getElementById('copy-css')?.addEventListener('click', copyCSS);

// JSON Tool - Create CodeMirror editors
let jsonInputEditor: CodeMirror.Editor;
let jsonOutputEditor: CodeMirror.Editor;

function initJsonTool() {
  const jsonInputElement = document.getElementById('json-input');
  const jsonOutputElement = document.getElementById('json-output');
  
  if (jsonInputElement && jsonOutputElement && !jsonInputEditor) {
    // Clear any existing content first
    jsonInputElement.innerHTML = '';
    jsonOutputElement.innerHTML = '';
    
    jsonInputEditor = CodeMirror(jsonInputElement, {
      lineNumbers: true,
      mode: 'application/json',
      theme: 'default',
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
    });

    jsonOutputEditor = CodeMirror(jsonOutputElement, {
      lineNumbers: true,
      mode: 'application/json',
      theme: 'default',
      lineWrapping: true,
      readOnly: true,
      indentUnit: 2,
      tabSize: 2,
    });
  }
}

function showJsonError(message: string) {
  const errorElement = document.getElementById('json-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => {
      errorElement.classList.remove('show');
    }, 5000);
  }
}

function formatJSON() {
  const input = jsonInputEditor.getValue();
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    jsonOutputEditor.setValue(formatted);
    document.getElementById('json-error')?.classList.remove('show');
  } catch (error) {
    showJsonError('Error: Invalid JSON format');
  }
}

function minifyJSON() {
  const input = jsonInputEditor.getValue();
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    jsonOutputEditor.setValue(minified);
    document.getElementById('json-error')?.classList.remove('show');
  } catch (error) {
    showJsonError('Error: Invalid JSON format');
  }
}

function validateJSON() {
  const input = jsonInputEditor.getValue();
  try {
    JSON.parse(input);
    jsonOutputEditor.setValue('✅ Valid JSON');
    document.getElementById('json-error')?.classList.remove('show');
  } catch (error) {
    showJsonError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    jsonOutputEditor.setValue('❌ Invalid JSON');
  }
}

function clearJSON() {
  jsonInputEditor.setValue('');
  jsonOutputEditor.setValue('');
  document.getElementById('json-error')?.classList.remove('show');
}

function copyJSON() {
  const output = jsonOutputEditor.getValue();
  navigator.clipboard.writeText(output).then(() => {
    const copyBtn = document.getElementById('copy-json');
    const originalText = copyBtn?.textContent;
    if (copyBtn) {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }
  });
}

document.getElementById('format-json-btn')?.addEventListener('click', formatJSON);
document.getElementById('minify-json-btn')?.addEventListener('click', minifyJSON);
document.getElementById('validate-json-btn')?.addEventListener('click', validateJSON);
document.getElementById('clear-json')?.addEventListener('click', clearJSON);
document.getElementById('copy-json')?.addEventListener('click', copyJSON);

const [
  elemTextL,
  elemTextR,
  elemCompare,
  elemClear,
  elemInline,
  elemDiff,
  elemSyntaxMode,
  elemFile1Upload,
  elemFile2Upload,
  elemText1Info,
  elemText2Info,
  elemDiffStats,
] = [
  'text1', 
  'text2',
  'compare',
  'clear',
  'inline',
  'diff',
  'syntax-mode',
  'file1-upload',
  'file2-upload',
  'text1-info',
  'text2-info',
  'diff-stats',
].map(id => document.getElementById(id)!);

const [lEditor, rEditor] = [elemTextL, elemTextR]
  .map(e => CodeMirror(e, {
    lineNumbers: true,
    mode: 'text/plain',
    theme: 'default',
    lineWrapping: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
  }));

let [lText, rText] = ['', ''];

const updateText = () => {
  lText = lEditor.getValue();
  rText = rEditor.getValue();
};

const updateLineInfo = () => {
  const lLines = lEditor.lineCount();
  const rLines = rEditor.lineCount();
  (<HTMLElement>elemText1Info).textContent = `${lLines} lines`;
  (<HTMLElement>elemText2Info).textContent = `${rLines} lines`;
};

const updateSyntaxHighlighting = (mode: string) => {
  lEditor.setOption('mode', mode);
  rEditor.setOption('mode', mode);
};

const calculateDiffStats = (patch: string) => {
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
};

const render = () => {
  updateText();
  const patch = Diff.createPatch('diff', lText, rText);
  const stats = calculateDiffStats(patch);
  
  (<HTMLElement>elemDiffStats).innerHTML = `
    <span style="color: #28a745;">+${stats.additions}</span>
    <span style="color: #dc3545;">-${stats.deletions}</span>
  `;
  
  new Diff2Html.Diff2HtmlUI(elemDiff,
    patch,
    {
      drawFileList: false,
      fileContentToggle: false,
      outputFormat: (<HTMLInputElement>elemInline).checked ? 'line-by-line' : 'side-by-side',
      matching: 'lines',
      diffMaxChanges: 500,
    },
  ).draw();
};

const clearEditors = () => {
  lEditor.setValue('');
  rEditor.setValue('');
  updateLineInfo();
  (<HTMLElement>elemDiffStats).innerHTML = '';
  (<HTMLElement>elemDiff).innerHTML = '';
};

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const handleFileUpload = async (file: File, editor: CodeMirror.Editor) => {
  try {
    const content = await readFile(file);
    editor.setValue(content);
    updateLineInfo();
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    const syntaxSelect = <HTMLSelectElement>elemSyntaxMode;
    
    switch (extension) {
      case 'js':
        syntaxSelect.value = 'javascript';
        updateSyntaxHighlighting('javascript');
        break;
      case 'ts':
        syntaxSelect.value = 'typescript';
        updateSyntaxHighlighting('text/typescript');
        break;
      case 'css':
        syntaxSelect.value = 'css';
        updateSyntaxHighlighting('css');
        break;
      case 'html':
        syntaxSelect.value = 'htmlmixed';
        updateSyntaxHighlighting('htmlmixed');
        break;
      case 'md':
        syntaxSelect.value = 'markdown';
        updateSyntaxHighlighting('markdown');
        break;
      case 'py':
        syntaxSelect.value = 'python';
        updateSyntaxHighlighting('python');
        break;
      case 'java':
      case 'c':
      case 'cpp':
      case 'h':
        syntaxSelect.value = 'clike';
        updateSyntaxHighlighting('text/x-csrc');
        break;
      default:
        syntaxSelect.value = 'text/plain';
        updateSyntaxHighlighting('text/plain');
    }
  } catch (error) {
    console.error('Error reading file:', error);
    alert('Error reading file. Please try again.');
  }
};

// Event listeners
elemInline.addEventListener('change', render);

elemCompare.addEventListener('click', render);

elemClear.addEventListener('click', clearEditors);

elemSyntaxMode.addEventListener('change', (e) => {
  const mode = (<HTMLSelectElement>e.target).value;
  updateSyntaxHighlighting(mode);
});

elemFile1Upload.addEventListener('change', (e) => {
  const file = (<HTMLInputElement>e.target).files?.[0];
  if (file) {
    handleFileUpload(file, lEditor);
  }
});

elemFile2Upload.addEventListener('change', (e) => {
  const file = (<HTMLInputElement>e.target).files?.[0];
  if (file) {
    handleFileUpload(file, rEditor);
  }
});

lEditor.on('change', updateLineInfo);
rEditor.on('change', updateLineInfo);

// Initialize all tools
function initializeAllTools() {
  // Only initialize diff tool on startup
  updateLineInfo();
  // Other tools will be initialized lazily when clicked
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllTools);
} else {
  initializeAllTools();
}
