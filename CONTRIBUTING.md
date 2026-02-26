# Contributing

Thank you for considering contributing to this project! This document outlines our development workflow and standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/repo-name.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests and linting: `npm run lint`
7. Commit your changes following our [commit convention](#commit-message-convention)
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Git Workflow

We follow **Git Flow** branching strategy:

### Main Branches

- **`main`** - Production-ready code. Protected branch.
- **`develop`** - Integration branch for features. Next release candidate.

### Supporting Branches

#### Feature Branches

- **Naming**: `feature/feature-name`
- **Branch from**: `develop`
- **Merge back into**: `develop`
- **Purpose**: New features or enhancements

```bash
# Create feature branch
git checkout develop
git checkout -b feature/add-profile-filters

# Work on feature...
git add .
git commit -m "feat(search): add profile filters component"

# Push and create PR to develop
git push origin feature/add-profile-filters
```

#### Bugfix Branches

- **Naming**: `bugfix/bug-name`
- **Branch from**: `develop`
- **Merge back into**: `develop`
- **Purpose**: Bug fixes for next release

```bash
git checkout develop
git checkout -b bugfix/fix-search-crash
```

#### Hotfix Branches

- **Naming**: `hotfix/hotfix-name`
- **Branch from**: `main`
- **Merge back into**: `main` AND `develop`
- **Purpose**: Critical production fixes

```bash
git checkout main
git checkout -b hotfix/fix-critical-security-issue

# After fix, merge to main and develop
git checkout main
git merge --no-ff hotfix/fix-critical-security-issue
git checkout develop
git merge --no-ff hotfix/fix-critical-security-issue
```

#### Release Branches

- **Naming**: `release/version-number`
- **Branch from**: `develop`
- **Merge back into**: `main` AND `develop`
- **Purpose**: Prepare for production release

```bash
git checkout develop
git checkout -b release/1.1.0

# Final touches, version bumps, changelog
git commit -m "chore(release): prepare v1.1.0"

# Merge to main and develop
git checkout main
git merge --no-ff release/1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"
git checkout develop
git merge --no-ff release/1.1.0
```

### Branch Naming Rules

- Use lowercase
- Use hyphens to separate words
- Be descriptive but concise
- Include issue number if applicable

**Good examples:**

- `feature/profile-export-pdf`
- `bugfix/search-empty-state`
- `hotfix/auth-token-validation`
- `feature/123-add-dark-mode`

**Bad examples:**

- `feature/stuff` (too vague)
- `MyFeature` (not lowercase)
- `feature_new_thing` (use hyphens)

## Commit Message Convention

We follow the **Conventional Commits** specification with imperative mood.

### Format

```
type(scope): subject

[optional body]

[optional footer]
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should specify the place of the commit change:

- `search` - Search functionality
- `profile` - Profile pages or components
- `form` - Forms (profile creation, etc.)
- `db` - Database related
- `ui` - UI components
- `api` - API or server actions
- `auth` - Authentication
- `config` - Configuration files

### Subject

- Use **imperative, present tense**: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 72 characters
- **Must be a single line** - no multi-line commit messages

### Examples

**Good commits:**

```bash
feat(search): add filter by country
fix(profile): resolve slug generation collision
docs(readme): update installation instructions
style(ui): format button component with prettier
refactor(db): extract database connection to separate function
perf(search): optimize query with indexed fields
test(profile): add unit tests for slug generation
build(deps): upgrade next.js to 16.1.7
ci(github): add automated deployment workflow
chore(db): add seed script for test data
```

**Bad commits:**

```bash
# Missing type
"add new feature"

# Not imperative mood
"Added profile page"
"Adding search filters"

# Capitalized subject
"feat(search): Add new filter"

# Period at end
"fix(ui): resolve layout issue."

# Too vague
"fix: stuff"
"update: changes"

# Wrong type
"feature(search): add filters" # should be "feat"

# Multi-line commit (not allowed)
"fix(form): resolve validation
- convert string to number
- add country dropdown"
```

### Breaking Changes

If your commit introduces breaking changes, add `BREAKING CHANGE:` in the footer:

```bash
feat(api)!: change profile endpoint structure

BREAKING CHANGE: Profile API now returns nested skills object instead of array
```

Or add `!` after the type/scope:

```bash
refactor(db)!: migrate to PostgreSQL
```

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use interfaces for objects, types for unions/primitives

### React

- Prefer Server Components (default)
- Use Client Components only when needed (`'use client'`)
- Functional components only
- Use TypeScript for props
- Keep components under 100 lines (extract if larger)

### Naming

- **Files**: kebab-case (`profile-card.tsx`)
- **Components**: PascalCase (`ProfileCard`)
- **Functions**: camelCase (`getProfileBySlug`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_SUGGESTIONS`)
- **CSS classes**: kebab-case (Tailwind utility classes)

### Code Style

- Use ESLint configuration provided
- Run `npm run lint` before committing
- Prettier formatting is enforced
- No console.logs in production code
- Comment only complex logic, not obvious code

### File Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface ProfileCardProps {
  profile: Profile
}

// 3. Constants
const MAX_SKILLS = 5

// 4. Component
export function ProfileCard({ profile }: ProfileCardProps) {
  // Component logic
}
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or behavior
2. **Update tests** if applicable
3. **Run linting**: `npm run lint`
4. **Build succeeds**: `npm run build`
5. **Write clear PR description**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
6. **Link related issues**: Use "Fixes #123" or "Closes #456"
7. **Request review** from maintainers
8. **Address review feedback**
9. **Squash commits** if requested

### PR Title Format

Follow the same convention as commit messages:

```
feat(search): add country filter dropdown
fix(profile): resolve bio character limit
```

### PR Description Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Testing

- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex/hard-to-understand areas
- [ ] Updated documentation
- [ ] No new warnings generated
- [ ] Added tests proving fix is effective or feature works
- [ ] New and existing unit tests pass locally
```

## Questions?

Feel free to open an issue for questions about contributing or join our community discussions.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
