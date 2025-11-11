# Quick Setup Guide for CI/CD

## 🚀 Getting Started

Your CI/CD pipeline is configured and ready! Follow these steps to activate it.

## Step 1: Push to GitHub

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin feat/ma/add-client-in-projects
```

## Step 2: Create Pull Request

1. Go to your repository on GitHub
2. Click **Pull requests** → **New pull request**
3. Select your branch → **Create pull request**
4. Watch the CI pipeline run automatically! ✨

## Step 3: Optional Integrations

### Enable Code Coverage (Codecov)

1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Enable for your repository
4. Copy the token
5. Add to GitHub Secrets as `CODECOV_TOKEN`

### Enable Security Scanning (Snyk)

1. Go to [snyk.io](https://snyk.io)
2. Sign in with GitHub
3. Import your repository
4. Get your token
5. Add to GitHub Secrets as `SNYK_TOKEN`

### Enable Code Quality (SonarCloud)

1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Sign in with GitHub
3. Analyze your repository
4. Get your token
5. Add to GitHub Secrets as `SONAR_TOKEN`

### Enable Nx Cloud (Optional - Faster Builds)

1. Go to [nx.app](https://nx.app)
2. Sign in and create workspace
3. Get your access token
4. Add to GitHub Secrets as `NX_CLOUD_ACCESS_TOKEN`

## Step 4: Configure Deployment

### For Staging/Production:

1. Go to **Settings** → **Environments**
2. Create `staging` environment
3. Create `production` environment with:
   - Required reviewers
   - Deployment branches: tags only

4. Add deployment secrets:
   - `VITE_API_URL` - Your API URL
   - `API_URL` - For health checks
   - `UI_URL` - Your app URL

## What's Included? ✨

### ✅ CI Pipeline
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests with coverage
- Build verification
- Security scanning

### ✅ PR Checks
- Automatic labeling
- Size validation
- Merge conflict detection
- Conventional commits check

### ✅ Nightly Tests
- Full test suite
- Integration tests
- E2E tests
- Dependency audits

### ✅ Deployment
- Staging (auto from main)
- Production (from tags)
- Smoke tests
- Automatic rollback

### ✅ Dependency Management
- Weekly updates
- Automatic PRs
- Test validation

## Workflow Status

You can see workflow status at:
```
https://github.com/rashmithakau/tms/actions
```

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Create a pull request
3. ✅ Watch CI run automatically
4. ⭐ Star this repo if you like it!

## Need Help?

- 📖 Read: `.github/CI_CD_DOCUMENTATION.md`
- 🐛 Issues: Create an issue on GitHub
- 💬 Ask: Your team members

---

**That's it! Your CI/CD pipeline is ready to use! 🎉**
