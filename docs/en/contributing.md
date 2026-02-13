# Contributing to TranslaMate

Thank you for your interest in the TranslaMate project! We welcome contributions of all kinds.

## How to Contribute

### Reporting Bugs

1. Search for existing similar issues in [Issues](https://github.com/username/translamate/issues)
2. If none exists, create a new Issue including:
   - Clear title
   - Detailed problem description
   - Reproduction steps
   - System environment info (OS, version numbers)
   - Screenshots or error logs

### Submitting Feature Suggestions

1. Discuss your ideas first in [Discussions](https://github.com/username/translamate/discussions)
2. After receiving feedback, create a Feature Request Issue
3. Wait for maintainer confirmation before starting development

### Submitting Code

1. **Fork the repository**
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/translamate.git
   cd translamate
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Write code**
   - Follow the project's code style
   - Add necessary comments
   - Write test cases

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add some feature"
   ```

   Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation update
   - `style:` - Code formatting changes
   - `refactor:` - Code refactoring
   - `test:` - Test-related changes
   - `chore:` - Build/tooling updates

5. **Push branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Open a Pull Request on GitHub
   - Fill out the PR template
   - Wait for code review

## Development Standards

### Code Style

- Use TypeScript
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable and function names

### Testing Requirements

- Add unit tests for new features
- Ensure all tests pass
- Test coverage should not be below 80%

### Documentation

- Update relevant documentation (README, API docs, etc.)
- Add necessary JSDoc comments
- Update CHANGELOG.md

## Development Environment

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Community Guidelines

- Respect all contributors
- Friendly and inclusive communication
- Accept constructive criticism
- Focus on what's best for the community

Feel free to contact us with any questions!