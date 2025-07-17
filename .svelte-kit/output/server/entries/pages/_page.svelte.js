import { F as ensure_array_like, G as attr_class, z as escape_html, J as stringify, K as bind_props, w as pop, u as push, N as attr, O as maybe_selected, P as head } from "../../chunks/index.js";
import "clsx";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html as html$1 } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import "diff";
import "diff2html/lib/ui/js/diff2html-ui.js";
function html(value) {
  var html2 = String(value);
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function Header($$payload) {
  $$payload.out += `<header class="header svelte-1vi6tv3"><h1 class="svelte-1vi6tv3">Dev Tools Suite</h1></header>`;
}
function Sidebar($$payload, $$props) {
  push();
  let activeTool = $$props["activeTool"];
  const tools = [
    { id: "diff", name: "Text Diff" },
    { id: "base64", name: "Base64 Encoder" },
    { id: "js-minifier", name: "JS Minifier" },
    { id: "css-minifier", name: "CSS Minifier" },
    { id: "json-formatter", name: "JSON Formatter" }
  ];
  const each_array = ensure_array_like(tools);
  $$payload.out += `<nav class="sidebar svelte-15dx9cd"><div class="sidebar-header svelte-15dx9cd"><h3 class="svelte-15dx9cd">Tools</h3></div> <ul class="tool-list svelte-15dx9cd"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let tool = each_array[$$index];
    $$payload.out += `<li class="svelte-15dx9cd"><button${attr_class(`tool-btn ${stringify(activeTool === tool.id ? "active" : "")}`, "svelte-15dx9cd")}>${escape_html(tool.name)}</button></li>`;
  }
  $$payload.out += `<!--]--></ul></nav>`;
  bind_props($$props, { activeTool });
  pop();
}
function DiffTool($$payload, $$props) {
  push();
  let syntaxMode = "text/plain";
  let inlineView = false;
  let leftLines = 0;
  let rightLines = 0;
  let diffStats = "";
  ({
    "javascript": [javascript()],
    "typescript": [javascript({ typescript: true })],
    "css": [css()],
    "html": [html$1()],
    "markdown": [markdown()],
    "python": [python()],
    "java": [java()],
    "cpp": [cpp()]
  });
  $$payload.out += `<div class="input-section svelte-pcxapp"><div class="controls-panel svelte-pcxapp"><div class="file-upload-section svelte-pcxapp"><div class="upload-group svelte-pcxapp"><label for="file1-upload" class="upload-label svelte-pcxapp">Upload File 1:</label> <input id="file1-upload" type="file" accept=".txt,.js,.ts,.json,.html,.css,.md,.py,.java,.cpp,.c,.h"/></div> <div class="upload-group svelte-pcxapp"><label for="file2-upload" class="upload-label svelte-pcxapp">Upload File 2:</label> <input id="file2-upload" type="file" accept=".txt,.js,.ts,.json,.html,.css,.md,.py,.java,.cpp,.c,.h"/></div></div> <div class="diff-options svelte-pcxapp"><div class="option-group svelte-pcxapp"><label class="option-label svelte-pcxapp"><input type="checkbox"${attr("checked", inlineView, true)}/> <span>Inline View</span></label></div> <div class="option-group svelte-pcxapp"><label for="syntax-mode" class="option-label svelte-pcxapp">Syntax:</label> <select id="syntax-mode">`;
  $$payload.select_value = syntaxMode;
  $$payload.out += `<option value="text/plain"${maybe_selected($$payload, "text/plain")}>Plain Text</option><option value="javascript"${maybe_selected($$payload, "javascript")}>JavaScript</option><option value="typescript"${maybe_selected($$payload, "typescript")}>TypeScript</option><option value="css"${maybe_selected($$payload, "css")}>CSS</option><option value="html"${maybe_selected($$payload, "html")}>HTML</option><option value="markdown"${maybe_selected($$payload, "markdown")}>Markdown</option><option value="python"${maybe_selected($$payload, "python")}>Python</option><option value="java"${maybe_selected($$payload, "java")}>Java</option><option value="cpp"${maybe_selected($$payload, "cpp")}>C/C++</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div></div></div> <div class="text-container svelte-pcxapp"><div class="text-panel svelte-pcxapp"><div class="text-header svelte-pcxapp"><span class="text-title svelte-pcxapp">Text 1</span> <span class="text-info svelte-pcxapp">${escape_html(leftLines)} lines</span></div> <div class="text svelte-pcxapp"></div></div> <div class="text-panel svelte-pcxapp"><div class="text-header svelte-pcxapp"><span class="text-title svelte-pcxapp">Text 2</span> <span class="text-info svelte-pcxapp">${escape_html(rightLines)} lines</span></div> <div class="text svelte-pcxapp"></div></div></div> <div class="action-buttons svelte-pcxapp"><button class="compare-btn">Compare</button> <button class="clear-btn">Clear</button></div></div> <section class="diff-section svelte-pcxapp"><div class="diff-header svelte-pcxapp"><h2 class="svelte-pcxapp">Comparison Result</h2> <div class="diff-stats svelte-pcxapp">${html(diffStats)}</div></div> <div class="diff-container svelte-pcxapp"></div></section>`;
  pop();
}
function _page($$payload) {
  let activeTool = "diff";
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dev Tools Suite</title>`;
    $$payload2.out += `<meta name="description" content="A modern, web-based text and file comparison tool with syntax highlighting"/>`;
  });
  Header($$payload);
  $$payload.out += `<!----> <div class="app-container svelte-3ompxw">`;
  Sidebar($$payload, { activeTool });
  $$payload.out += `<!----> <main class="main-container svelte-3ompxw">`;
  {
    $$payload.out += "<!--[-->";
    DiffTool($$payload);
  }
  $$payload.out += `<!--]--></main></div>`;
}
export {
  _page as default
};
