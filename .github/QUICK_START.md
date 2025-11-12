# Quick Start Guide

## 🚀 How to Use CI/CD

### Push Your Code

```bash
git add .
git commit -m "feat: your changes"
git push
```

The CI pipeline runs automatically on every push!

### Create a Pull Request

1. Go to GitHub → **Pull requests** → **New pull request**
2. Select your branch
3. Click **Create pull request**
4. CI checks will run automatically ✨

---

## Optional: Enable Code Coverage

1. Go to [codecov.io](https://codecov.io) and sign in with GitHub
2. Enable your repository
3. Copy the token
4. Add to GitHub Secrets as `CODECOV_TOKEN`

---

## Need Help?

Check the [CI/CD Documentation](./CI_CD_DOCUMENTATION.md) for more details
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
