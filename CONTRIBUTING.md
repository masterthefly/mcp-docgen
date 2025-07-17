# Contributing to MCP Documentation Generator

Thank you for your interest in contributing to MCP DocGen! This guide will help you get started with contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/masterthefly/mcp-docgen/issues) to avoid duplicates.

When filing a bug report, include:
- Clear description of the issue
- Steps to reproduce the behavior
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Relevant logs or error messages

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
- Check existing [feature requests](https://github.com/masterthefly/mcp-docgen/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Provide clear description of the proposed feature
- Explain why this enhancement would be useful
- Consider providing implementation ideas

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass** (`npm test`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

## 🛠 Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/masterthefly/mcp-docgen.git
cd mcp-docgen

# Install dependencies
npm install

# Build the project
npm run build

# Link CLI for testing
npm link

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
mcp-docgen/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── commands/           # CLI command implementations
│   ├── core/              # Core functionality
│   ├── templates/         # Documentation templates
│   └── utils/             # Utility functions
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test fixtures
├── docs/                  # Project documentation
└── examples/              # Example MCP servers
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- analyzer.test.ts

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Aim for high test coverage

Example test:

```typescript
import { MCPAnalyzer } from '../../../src/core/analyzer';

describe('MCPAnalyzer', () => {
  let analyzer: MCPAnalyzer;
  
  beforeEach(() => {
    analyzer = new MCPAnalyzer();
  });
  
  describe('analyze()', () => {
    it('should analyze TypeScript MCP server', async () => {
      // Arrange
      const serverPath = 'tests/fixtures/typescript-server';
      
      // Act
      const result = await analyzer.analyze(serverPath);
      
      // Assert
      expect(result.name).toBe('test-server');
      expect(result.tools).toHaveLength(2);
    });
  });
});
```

## 📝 Code Style

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode
- Provide proper type annotations
- Use meaningful variable and function names
- Follow established patterns in the codebase

### Code Formatting

We use Prettier for code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting

We use ESLint for code linting:

```bash
# Lint all files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## 🎯 Areas for Contribution

### High Priority

- **MCP Server Analysis**: Improve detection and parsing of different MCP server types
- **Documentation Templates**: Create new themes and improve existing ones
- **CLI Enhancements**: Add new commands and improve user experience
- **Testing**: Increase test coverage and add integration tests

### Medium Priority

- **Performance**: Optimize documentation generation for large servers
- **Deployment**: Add support for more deployment platforms
- **Configuration**: Enhance configuration options and validation
- **Examples**: Create more example MCP servers

### Good First Issues

Look for issues labeled [`good first issue`](https://github.com/masterthefly/mcp-docgen/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) which are perfect for new contributors.

## 🔧 Adding New Features

### MCP Server Types

To add support for a new MCP server type:

1. Extend `MCPAnalyzer` class in `src/core/analyzer.ts`
2. Add detection logic for the new server type
3. Implement parsing for server capabilities
4. Add tests in `tests/unit/core/analyzer.test.ts`
5. Create example server in `examples/`

### Documentation Templates

To create a new documentation template:

1. Create template directory in `templates/`
2. Add template files (HTML, CSS, JS)
3. Update template registry in `src/core/template-manager.ts`
4. Add template tests
5. Update documentation

### CLI Commands

To add a new CLI command:

1. Create command file in `src/commands/`
2. Implement command logic
3. Add command to main CLI in `src/cli.ts`
4. Add tests for the command
5. Update help documentation

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to public APIs
- Document complex algorithms and business logic
- Include usage examples in documentation

### User Documentation

- Update README.md for new features
- Add examples to `examples/` directory
- Update CLI help text

## 🏷 Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for Python MCP servers
fix: resolve template rendering issue
docs: update contributing guidelines
test: add integration tests for generator
refactor: improve error handling in analyzer
```

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Maintenance tasks

## 🔍 Code Review Process

### For Contributors

- Keep PRs focused and small
- Write clear PR descriptions
- Respond to feedback promptly
- Ensure CI passes before requesting review

### For Reviewers

- Be constructive and respectful
- Focus on code quality and maintainability
- Check for proper test coverage
- Verify documentation is updated

## 📋 Pull Request Template

When creating a pull request, include:

- **Description**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Testing**: How was this tested?
- **Breaking Changes**: Any breaking changes?
- **Checklist**: 
  - [ ] Tests pass
  - [ ] Documentation updated
  - [ ] Changelog updated (if needed)

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes for significant contributions
- Invited to join the maintainer team for sustained contributions

## ❓ Questions?

- Check the [Discussions](https://github.com/masterthefly/mcp-docgen/discussions) for Q&A
- Join our community chat (link coming soon)
- Email the maintainers at maintainers@mcpdocgen.io

Thank you for contributing to MCP DocGen! 🙏