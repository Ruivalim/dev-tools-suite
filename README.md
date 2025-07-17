# Dev Tools Suite - Svelte Version

A modern, web-based development tools suite built with SvelteKit and TypeScript. This is a complete rebuild of the original simple-diff project using modern web technologies.

## Features

### Text Diff Tool
- Side-by-side and inline text comparison
- Syntax highlighting for multiple languages (JavaScript, TypeScript, CSS, HTML, Markdown, Python, Java, C/C++)
- File upload support
- Live line count display
- Diff statistics (additions/deletions)

### Base64 Encoder/Decoder
- Encode text to Base64
- Decode Base64 to text
- Copy-to-clipboard functionality

### JavaScript Minifier/Beautifier
- Minify JavaScript code
- Beautify/format JavaScript code
- Syntax highlighting with CodeMirror

### CSS Minifier/Beautifier  
- Minify CSS code
- Beautify/format CSS code
- Syntax highlighting with CodeMirror

### JSON Formatter
- Format JSON with proper indentation
- Minify JSON
- Validate JSON syntax
- Error reporting for invalid JSON

## Technologies Used

- **SvelteKit** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **CodeMirror 6** - Advanced code editor
- **diff2html** - Beautiful diff visualization
- **Vite** - Fast build tool

## Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── app.css                 # Global styles
├── app.html               # HTML template
├── lib/
│   └── components/        # Svelte components
│       ├── Header.svelte
│       ├── Sidebar.svelte
│       ├── DiffTool.svelte
│       ├── Base64Tool.svelte
│       ├── JSMinifierTool.svelte
│       ├── CSSMinifierTool.svelte
│       └── JSONFormatterTool.svelte
└── routes/
    ├── +layout.svelte     # Layout component
    └── +page.svelte       # Main page
```

## Features Comparison

| Feature | Original | Svelte Version |
|---------|----------|----------------|
| Text Diff | ✅ | ✅ |
| Base64 Encode/Decode | ✅ | ✅ |
| JS Minify/Beautify | ✅ | ✅ |
| CSS Minify/Beautify | ✅ | ✅ |
| JSON Format/Validate | ✅ | ✅ |
| Framework | Vanilla JS | SvelteKit |
| Build Tool | esbuild | Vite |
| Code Editor | CodeMirror 5 | CodeMirror 6 |
| TypeScript | ✅ | ✅ |
| Responsive Design | ✅ | ✅ |
| File Upload | ✅ | ✅ |
| Syntax Highlighting | ✅ | ✅ |

## License

MIT License