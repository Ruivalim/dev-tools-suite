# Dev Tools Suite

## What it does

The app includes several tools that developers use daily:

**Text Diff Tool** - Compare files or text snippets side by side with syntax highlighting for most programming languages. Upload files directly or paste your code.

**Base64 Encoder/Decoder** - Quick encoding and decoding with copy-to-clipboard functionality.

**JavaScript Minifier/Beautifier** - Clean up your JavaScript or make it readable again.

**CSS Minifier/Beautifier** - Same thing but for stylesheets.

**JSON Formatter** - Validate and format JSON with proper error reporting when things go wrong.

## Tech stack

Built with SvelteKit because it's fast and the developer experience is excellent. TypeScript keeps things type-safe. CodeMirror 6 powers the code editors with syntax highlighting. The diff visualization uses diff2html for clean, readable output. Vite handles the build process and keeps development snappy.

Everything compiles to static files, so you can host it anywhere or run it locally without needing a server.

## Running it

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
```

The build output goes to the `build/` directory and can be served with any static file server.
