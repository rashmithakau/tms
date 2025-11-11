# TMS - Time Management System

[![CI Pipeline](https://github.com/rashmithakau/tms/actions/workflows/ci.yml/badge.svg)](https://github.com/rashmithakau/tms/actions/workflows/ci.yml)
[![Deploy](https://github.com/rashmithakau/tms/actions/workflows/deploy.yml/badge.svg)](https://github.com/rashmithakau/tms/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/node-18.x-green.svg)
![Nx](https://img.shields.io/badge/built%20with-Nx-orange.svg)

> Enterprise-grade Time Management System with automated CI/CD pipeline

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 📊 **Time Tracking** - Track time across projects and tasks
- 👥 **Team Management** - Manage teams and assign supervisors
- 📈 **Reporting** - Generate comprehensive reports
- 🔔 **Notifications** - Real-time notifications with Socket.IO
- 🔐 **Authentication** - Secure JWT-based authentication
- 📱 **Responsive UI** - Material-UI based responsive interface
- 🚀 **Automated CI/CD** - Production-ready GitHub Actions pipeline

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Forms**: React Hook Form + Yup
- **Build Tool**: Vite
- **Charts**: Chart.js

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Email**: Nodemailer
- **Scheduling**: Node-cron

### Monorepo & DevOps
- **Build System**: Nx 20.8
- **Language**: TypeScript 5.7
- **Linting**: ESLint
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rashmithakau/tms.git
   cd tms
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Create `.env` file in `apps/api/`:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/tms
   
   # Server
   PORT=4004
   NODE_ENV=development
   APP_ORIGIN=http://localhost:4200
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   
   # Email (optional)
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

   Create `.env` file in `apps/ui/`:
   ```env
   VITE_API_URL=http://localhost:4004
   REACT_APP_ENV=development
   ```

4. **Start development servers**

   Terminal 1 - API:
   ```bash
   npx nx serve api
   ```

   Terminal 2 - UI:
   ```bash
   npx nx serve ui
   ```

5. **Access the application**
   - UI: http://localhost:4200
   - API: http://localhost:4004

## 💻 Development

### Project Structure

```
tms/
├── apps/
│   ├── api/              # Backend Express API
│   │   ├── src/
│   │   │   ├── config/   # Configuration files
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── project.json
│   └── ui/               # Frontend React app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── api/
│       │   ├── store/
│       │   └── utils/
│       └── project.json
├── libs/
│   └── shared/          # Shared types and utilities
└── .github/
    └── workflows/       # CI/CD workflows
```

### Available Commands

```bash
# Development
npx nx serve api          # Start API dev server
npx nx serve ui           # Start UI dev server

# Building
npx nx build api          # Build API for production
npx nx build ui           # Build UI for production

# Testing
npx nx test api           # Run API tests
npx nx test ui            # Run UI tests
npx nx affected -t test   # Test only affected projects

# Linting
npx nx lint api           # Lint API
npx nx lint ui            # Lint UI
npx nx affected -t lint   # Lint only affected projects

# Type checking
npx nx run api:typecheck  # TypeScript check for API
npx nx run ui:typecheck   # TypeScript check for UI

# Dependency graph
npx nx graph              # Visualize project dependencies
```

## 🧪 Testing

### Run All Tests
```bash
npx nx run-many -t test --all
```

### Run Tests with Coverage
```bash
npx nx run-many -t test --all --code-coverage
```

### Run Tests for Changed Code
```bash
npx nx affected -t test
```

### Watch Mode (for development)
```bash
npx nx test api --watch
```

## 🔄 CI/CD

This project includes a comprehensive CI/CD pipeline with GitHub Actions.

### Workflows

- **CI Pipeline** - Runs on every push and PR
  - Linting, type checking, tests
  - Build verification
  - Security audits
  
- **PR Checks** - Enhanced PR validation
  - Conventional commit validation
  - PR size checking
  - Auto-labeling
  
- **Nightly Tests** - Comprehensive testing
  - Full test suite
  - Integration tests
  - E2E tests
  
- **Deployment** - Automated deployments
  - Staging (from main branch)
  - Production (from version tags)

### Documentation

- 📖 [Full CI/CD Documentation](.github/CI_CD_DOCUMENTATION.md)
- 🚀 [Quick Start Guide](.github/QUICK_START.md)
- 📊 [Status Badges](.github/BADGES.md)

## 🚢 Deployment

### Staging Deployment

Push to `main` branch:
```bash
git push origin main
```

### Production Deployment

Create and push a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Manual Deployment

1. Go to Actions tab on GitHub
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose environment and confirm

## 🤝 Contributing

### Branch Naming Convention

```
feat/feature-name        # New features
fix/bug-description      # Bug fixes
docs/documentation       # Documentation changes
chore/maintenance        # Maintenance tasks
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login issue
docs: update API documentation
chore: update dependencies
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Create a pull request
6. Wait for CI checks to pass
7. Request review from team members

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rashmitha Kaushalya** - [@rashmithakau](https://github.com/rashmithakau)

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev)
- UI powered by [Material-UI](https://mui.com)
- Backend powered by [Express](https://expressjs.com)

## 📞 Support

For issues and questions:
- 🐛 [Report Issues](https://github.com/rashmithakau/tms/issues)
- 📧 Contact: [your-email@example.com]
- 💬 Discussions: [GitHub Discussions](https://github.com/rashmithakau/tms/discussions)

---

**Made with ❤️ by the TMS Team**
