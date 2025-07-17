Generate beautiful, comprehensive documentation for your Model Context Protocol (MCP) servers with zero configuration.
🚀 Quick Start
bash# Install globally
npm install -g mcp-docgen

# Generate documentation for your MCP server
mcp-docgen generate ./my-mcp-server

# Serve documentation locally
mcp-docgen serve ./docs

# Your docs are now available at http://localhost:3000
✨ Features

🔍 Automatic Discovery - Analyzes MCP servers and extracts all capabilities
📝 Beautiful Documentation - Generates clean, responsive documentation
🎨 Customizable Themes - Multiple built-in themes and custom template support
🚀 Development Server - Live reload during documentation development
📱 Responsive Design - Works perfectly on all devices
🔧 Multiple Formats - HTML, Markdown, and JSON output
🌐 Easy Deployment - One-command deployment to GitHub Pages, Netlify, and more

📖 What is MCP?
The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect with external data sources and tools. MCP servers expose:

Tools - Actions that AI models can execute
Resources - Data sources that provide context
Prompts - Templates for common interactions

🛠 Installation
Global Installation (Recommended)
bashnpm install -g mcp-docgen
Local Installation
bashnpm install --save-dev mcp-docgen
Using npx
bashnpx mcp-docgen generate ./my-server
📚 Usage
Generate Documentation
bash# Basic usage
mcp-docgen generate ./path/to/your/mcp-server

# Specify output directory
mcp-docgen generate ./server --output ./documentation

# Use a different theme
mcp-docgen generate ./server --template modern

# Generate markdown instead of HTML
mcp-docgen generate ./server --format markdown
Serve Documentation Locally
bash# Serve on default port (3000)
mcp-docgen serve ./docs

# Specify custom port
mcp-docgen serve ./docs --port 8080

# Open browser automatically
mcp-docgen serve ./docs --open
Deploy Documentation
bash# Deploy to GitHub Pages
mcp-docgen deploy ./docs --platform github-pages

# Deploy to Netlify
mcp-docgen deploy ./docs --platform netlify
Initialize New MCP Server
bash# Create a new MCP server with documentation setup
mcp-docgen init my-new-server --template typescript
⚙️ Configuration
Create a mcp-docgen.config.json file in your project root:
json{
  "title": "My MCP Server Documentation",
  "description": "Comprehensive API documentation for my MCP server",
  "template": "default",
  "output": "./docs",
  "logo": "./assets/logo.png",
  "theme": {
    "primaryColor": "#2563eb",
    "accentColor": "#10b981"
  },
  "navigation": {
    "github": "https://github.com/username/repo"
  }
}
🎨 Templates
MCP DocGen comes with several built-in templates:

default - Clean, professional documentation
modern - Contemporary design with animations
minimal - Simple, lightweight documentation
api-focused - Technical documentation for developers

Custom Templates
Create your own templates using our template system:
bashmcp-docgen template create my-custom-template
🧩 Server Support
MCP DocGen automatically detects and supports:

Node.js/TypeScript servers using @modelcontextprotocol/sdk
Python servers using mcp package
C# servers using MCP SDK
Ruby servers using MCP SDK
Custom servers following MCP protocol

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.
Development Setup
bash# Clone the repository
git clone https://github.com/yourusername/mcp-docgen.git
cd mcp-docgen

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development
npm run dev
🔧 CLI Reference
Commands

generate <server-path> - Generate documentation
serve <docs-dir> - Serve documentation locally
deploy <docs-dir> - Deploy documentation
init <project-name> - Initialize new MCP server
template <action> - Manage templates

Global Options

--verbose - Enable verbose logging
--quiet - Suppress non-essential output
--config <path> - Specify config file path

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

Anthropic for creating the Model Context Protocol
MCP Community for building an amazing ecosystem
All contributors who help make this project better

🔗 Links

Model Context Protocol
MCP Specification
MCP Server Examples
Documentation


Made with ❤️ by the MCP community