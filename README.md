# Simple Diff - Enhanced Text Comparison Tool

A modern, web-based text and file comparison tool with syntax highlighting, built on [CodeMirror](https://github.com/codemirror/CodeMirror), [jsdiff](https://github.com/kpdecker/jsdiff), and [diff2html](https://github.com/rtfpessoa/diff2html).

## ✨ Features

- **Modern UI**: Clean, responsive design that works on desktop and mobile
- **File Upload**: Compare files directly by uploading them
- **Syntax Highlighting**: Support for JavaScript, TypeScript, CSS, HTML, Markdown, Python, C/C++/Java, and more
- **Multiple View Modes**: Side-by-side and inline diff views
- **Real-time Statistics**: Line counts and diff statistics (additions/deletions)
- **Responsive Design**: Optimized for all screen sizes
- **Docker Support**: Easy deployment with Docker and docker-compose

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ruivalim/simple-diff.git
   cd simple-diff
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

4. **Build for production**
   ```bash
   npm run build
   ```

### Docker Deployment

#### Using Docker directly

1. **Build the image**
   ```bash
   npm run docker:build
   ```

2. **Run the container**
   ```bash
   npm run docker:run
   ```
   Access the app at http://localhost:8080

#### Using Docker Compose

1. **Production deployment**
   ```bash
   npm run docker:prod
   ```

2. **Development with hot reload**
   ```bash
   npm run docker:dev
   ```

## 📖 Usage

1. **Text Input**: Type or paste text directly into the left and right panels
2. **File Upload**: Use the file upload buttons to load files for comparison
3. **Syntax Highlighting**: Select the appropriate language from the dropdown for syntax highlighting
4. **View Options**: Toggle between side-by-side and inline diff views
5. **Compare**: Click the "Compare" button to generate the diff
6. **Clear**: Use the "Clear" button to reset both panels

## 🛠️ Available Scripts

- `npm run build` - Build for production
- `npm run dev` - Start development server with hot reload
- `npm run clean` - Clean build directory
- `npm run release` - Create release package
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:dev` - Development with Docker Compose
- `npm run docker:prod` - Production deployment with Docker Compose

## 🎯 Supported File Types

- **JavaScript** (.js)
- **TypeScript** (.ts)
- **CSS** (.css)
- **HTML** (.html)
- **Markdown** (.md)
- **Python** (.py)
- **Java** (.java)
- **C/C++** (.c, .cpp, .h)
- **Plain Text** (.txt)

## 🐳 Docker Information

The application uses a multi-stage Docker build:
- **Build stage**: Compiles TypeScript and bundles assets
- **Production stage**: Serves the app with nginx
- **Health checks**: Built-in health monitoring
- **Security headers**: Configured with security best practices

## 🔧 Technologies Used

- **Frontend**: TypeScript, CodeMirror, diff2html
- **Build**: esbuild
- **Server**: nginx (for Docker deployment)
- **Containerization**: Docker & Docker Compose

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
