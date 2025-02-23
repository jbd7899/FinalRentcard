# Contributing to MyRentCard

Thank you for your interest in contributing to MyRentCard! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/myrentcard.git
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original/myrentcard.git
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## Development Process

1. **Setup Development Environment**
   - Follow the installation steps in the README
   - Ensure all tests pass before making changes
   - Set up pre-commit hooks:
     ```bash
     npm run prepare
     ```

2. **Making Changes**
   - Write clean, maintainable, and tested code
   - Follow the existing code style and conventions
   - Keep commits atomic and with clear messages
   - Update documentation as needed

3. **Testing**
   - Add tests for new features
   - Ensure all tests pass:
     ```bash
     npm run test
     ```
   - Run linting:
     ```bash
     npm run lint
     ```

4. **Committing Changes**
   - Use conventional commit messages:
     ```
     feat: add new feature
     fix: resolve bug
     docs: update documentation
     test: add tests
     chore: update dependencies
     ```
   - Sign your commits:
     ```bash
     git commit -s -m "your message"
     ```

## Pull Request Process

1. **Before Submitting**
   - Update your branch with upstream:
     ```bash
     git fetch upstream
     git rebase upstream/main
     ```
   - Ensure all tests pass
   - Update documentation if needed
   - Squash related commits

2. **Submitting**
   - Create a pull request from your fork to our main branch
   - Fill out the PR template completely
   - Link any related issues
   - Add screenshots for UI changes

3. **Review Process**
   - Address review comments promptly
   - Keep the PR updated with upstream
   - Be responsive to questions

## Code Style Guidelines

1. **TypeScript**
   - Use TypeScript for all new code
   - Follow strict mode guidelines
   - Document complex types
   - Use proper type imports/exports

2. **React**
   - Use functional components
   - Follow React hooks best practices
   - Implement error boundaries
   - Use proper prop types

3. **Testing**
   - Write unit tests for utilities
   - Add integration tests for components
   - Include E2E tests for critical paths
   - Maintain good test coverage

4. **Documentation**
   - Update README for major changes
   - Document new features
   - Include JSDoc comments
   - Update API documentation

## Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates
- `release/*`: Release preparation

## Release Process

1. Create a release branch
2. Update version numbers
3. Update CHANGELOG.md
4. Create a release PR
5. After approval, merge and tag

## Getting Help

- Join our Discord community
- Check existing issues and discussions
- Read our documentation
- Ask questions in discussions

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in our community

Thank you for contributing to MyRentCard!