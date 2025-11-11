# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline ensures code quality, runs automated tests, and handles deployments.

## Workflows

### 1. **CI Pipeline** (`ci.yml`)

Runs on every push and pull request to main branches.

**Jobs:**
- ✅ **Setup** - Install dependencies with caching
- 🔍 **Lint** - ESLint checks on affected projects
- 📝 **Type Check** - TypeScript type validation
- 🧪 **Test** - Unit tests with coverage
- 🏗️ **Build API** - Production build of API
- 🎨 **Build UI** - Production build of UI
- 🔒 **Security** - npm audit and Snyk scan
- 📊 **Code Quality** - SonarCloud analysis

**Triggers:**
- Push to `master`, `main`, `develop`, `feat/**`, `fix/**`, `hotfix/**`
- Pull requests to `master`, `main`, `develop`

**Duration:** ~5-10 minutes

---

### 2. **PR Checks** (`pr-checks.yml`)

Enhanced validation for pull requests.

**Features:**
- 📋 PR title validation (conventional commits)
- 📏 PR size check (warns if >1000 changes)
- 🔀 Merge conflict detection
- 📊 Affected projects visualization
- 🏷️ Automatic labeling based on changed files
- 💬 Bot comments with status updates

**Special Handling:**
- Draft PRs: Quick validation only
- Ready PRs: Full CI pipeline

---

### 3. **Nightly Tests** (`nightly.yml`)

Comprehensive testing suite that runs every night.

**Jobs:**
- 🌙 **Full Test Suite** - All tests across Node 18.x & 20.x
- 🔗 **Integration Tests** - With MongoDB service
- 🎭 **E2E Tests** - End-to-end with Playwright
- 🔍 **Dependency Audit** - Security vulnerability scan
- ⚡ **Performance Tests** - Bundle size analysis

**Schedule:** Daily at 2 AM UTC  
**Manual Trigger:** Available via workflow_dispatch

---

### 4. **Deploy** (`deploy.yml`)

Automated deployment pipeline.

**Environments:**
- 🟡 **Staging** - Auto-deploys from `main`/`master` branch
- 🔴 **Production** - Auto-deploys from version tags (`v*.*.*`)
- 🎯 **Manual** - Workflow dispatch to any environment

**Jobs:**
1. **Setup** - Determine environment
2. **CI Checks** - Full validation before deploy
3. **Build** - Create deployment packages
4. **Deploy API** - Deploy backend services
5. **Deploy UI** - Deploy frontend application
6. **Migrate** - Run database migrations (production only)
7. **Smoke Tests** - Post-deployment validation
8. **Rollback** - Automatic rollback on failure

---

### 5. **Dependency Updates** (`dependency-update.yml`)

Automated dependency management.

**Features:**
- 📦 Weekly dependency updates
- 🧪 Automatic test run
- 📝 Creates PR with changes
- 🏷️ Auto-labeled as `dependencies`

**Schedule:** Every Monday at 8 AM UTC

---

## Setup Instructions

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

#### **Essential Secrets**

```
GITHUB_TOKEN              # Auto-provided by GitHub
```

#### **Optional Secrets (for enhanced features)**

```
# Code Coverage
CODECOV_TOKEN             # From codecov.io

# Security Scanning
SNYK_TOKEN                # From snyk.io

# Code Quality
SONAR_TOKEN               # From sonarcloud.io

# Deployment
VITE_API_URL              # Production API URL
API_URL                   # API endpoint for health checks
UI_URL                    # UI URL for smoke tests

# Nx Cloud (optional - speeds up CI)
NX_CLOUD_ACCESS_TOKEN     # From nx.app
```

### Setting Up Secrets

1. Go to repository **Settings**
2. Select **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

### Environment Setup

Create environments in **Settings → Environments**:

1. **staging**
   - No protection rules needed
   - Add staging-specific secrets

2. **production**
   - ✅ Required reviewers (recommended)
   - ⏱️ Wait timer: 5 minutes
   - 🔒 Deployment branches: tags only
   - Add production-specific secrets

---

## Usage Guide

### Running CI Locally

Before pushing, test locally:

```bash
# Lint affected projects
npx nx affected -t lint

# Type check
npx nx run-many -t typecheck --all

# Run tests
npx nx affected -t test

# Build
npx nx affected -t build
```

### Creating a Pull Request

1. **Branch naming:**
   ```
   feat/add-new-feature
   fix/bug-description
   docs/update-readme
   ```

2. **PR title format** (conventional commits):
   ```
   feat: add user authentication
   fix: resolve login issue
   docs: update API documentation
   chore: update dependencies
   ```

3. **PR checklist:**
   - [ ] Tests pass locally
   - [ ] No linting errors
   - [ ] TypeScript compiles
   - [ ] Added tests for new features
   - [ ] Updated documentation

### Deploying

#### **To Staging:**
```bash
git push origin main
```
Automatically deploys to staging environment.

#### **To Production:**
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```
Triggers production deployment after approval.

#### **Manual Deployment:**
1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Choose environment
5. Confirm

---

## Monitoring & Notifications

### Build Status

Check build status:
- Badge in README (add this):
  ```markdown
  ![CI](https://github.com/rashmithakau/tms/workflows/CI%20Pipeline/badge.svg)
  ```

### Failed Builds

When a build fails:
1. Check the **Actions** tab
2. Click on the failed workflow
3. Review logs for the failed job
4. Fix the issue
5. Push changes

### Notifications

Configure notifications in **Settings → Notifications**:
- Email on workflow failures
- Slack/Discord webhooks (optional)

---

## Best Practices

### ✅ Do's

- ✅ Keep PRs small and focused
- ✅ Write descriptive commit messages
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Fix linting errors before pushing
- ✅ Review CI logs when builds fail
- ✅ Tag releases properly (`v1.0.0`)

### ❌ Don'ts

- ❌ Don't skip tests
- ❌ Don't commit directly to master
- ❌ Don't ignore security warnings
- ❌ Don't merge with failing CI
- ❌ Don't push unformatted code
- ❌ Don't commit secrets/credentials

---

## Troubleshooting

### Build Failures

**Lint errors:**
```bash
npx nx affected -t lint --fix
```

**Type errors:**
```bash
npx nx run-many -t typecheck --all
```

**Test failures:**
```bash
npx nx affected -t test --verbose
```

### Cache Issues

Clear GitHub Actions cache:
```bash
# Delete cache via GitHub CLI
gh cache delete --all
```

Or in Actions tab → Caches → Delete

### Performance Issues

**Slow builds:**
1. Enable Nx Cloud for caching
2. Use matrix strategy for parallel jobs
3. Cache dependencies properly

---

## Metrics & Reporting

### Coverage Reports

View coverage at: [Codecov Dashboard](https://codecov.io/gh/rashmithakau/tms)

### Code Quality

View quality metrics at: [SonarCloud Dashboard](https://sonarcloud.io/dashboard?id=tms)

### Build Times

Monitor in **Actions** tab → **Workflow runs** → **Timing**

---

## Continuous Improvement

### Workflow Optimization

1. **Monitor build times** - Aim for <10 minutes
2. **Update regularly** - Keep actions up to date
3. **Add more tests** - Increase coverage
4. **Improve caching** - Reduce install time

### Adding New Workflows

1. Create `.github/workflows/new-workflow.yml`
2. Test with `workflow_dispatch` trigger first
3. Add to documentation
4. Monitor for issues

---

## Support

For issues with CI/CD:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Ask team members
4. Create an issue if needed

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx CI Documentation](https://nx.dev/ci/intro/ci-with-nx)
- [Conventional Commits](https://www.conventionalcommits.org/)
