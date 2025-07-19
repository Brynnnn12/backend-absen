# Development Tools Setup

## 🛠️ Development Tools yang Tersedia

### 1. ESLint - Code Linting
- **Konfigurasi**: `.eslintrc.json`
- **Rules**: Standar ES2021 + Node.js best practices
- **Commands**:
  ```bash
  npm run lint          # Check linting errors
  npm run lint:fix      # Auto-fix linting errors
  ```

### 2. Prettier - Code Formatting
- **Konfigurasi**: `.prettierrc`
- **Format**: Single quotes, semicolons, 2 spaces
- **Commands**:
  ```bash
  npm run format        # Format all code
  npm run format:check  # Check formatting
  ```

### 3. Jest - Testing Framework
- **Konfigurasi**: `jest.config.json`
- **Setup**: `tests/setup.js`
- **Commands**:
  ```bash
  npm test              # Run all tests
  npm run test:watch    # Run tests in watch mode
  npm run test:coverage # Run tests with coverage report
  ```

### 4. VS Code Debugging
- **Konfigurasi**: `.vscode/launch.json`
- **Debug Modes**:
  - Debug Server
  - Debug Tests
  - Debug Single Test
  - Attach to Process

### 5. Git Ignore
- **File**: `.gitignore`
- **Includes**: node_modules, .env, logs, coverage, etc.

## 📁 Test Structure

```
tests/
├── setup.js           # Jest setup and mocks
├── auth.test.js       # Authentication tests
├── user.test.js       # User model tests
└── ...               # More test files
```

## 🧪 Testing Examples

### Unit Tests
```javascript
// Test user model
describe('User Model', () => {
  test('should create user with valid data', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    expect(user.email).toBe('test@example.com');
  });
});
```

### Integration Tests
```javascript
// Test API endpoints
describe('Auth API', () => {
  test('POST /api/auth/register', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '123456' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

## 🔧 VS Code Extensions Recommended

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Jest** - Test runner
4. **GitLens** - Git integration
5. **Thunder Client** - API testing
6. **MongoDB for VS Code** - Database management
7. **Node.js Extension Pack** - Node.js development

## 🐛 Debugging Guide

### 1. Server Debugging
- Set breakpoints in VS Code
- Press F5 or use "Debug Server" configuration
- Server runs in debug mode with hot reload

### 2. Test Debugging
- Set breakpoints in test files
- Use "Debug Tests" or "Debug Single Test"
- Step through test execution

### 3. Attach to Running Process
```bash
# Start server with debug flag
node --inspect src/server.js

# Then use "Attach to Process" in VS Code
```

## 📊 Code Quality Metrics

### Coverage Reports
- Run `npm run test:coverage`
- View reports in `coverage/` directory
- HTML report: `coverage/lcov-report/index.html`

### Linting Results
- ESLint checks code quality
- Prettier ensures consistent formatting
- Pre-commit hooks can be added

## 🚀 Development Workflow

1. **Start Development**:
   ```bash
   npm run dev          # Start server with nodemon
   ```

2. **Run Tests**:
   ```bash
   npm run test:watch   # Tests in watch mode
   ```

3. **Check Code Quality**:
   ```bash
   npm run lint         # Check linting
   npm run format:check # Check formatting
   ```

4. **Fix Issues**:
   ```bash
   npm run lint:fix     # Auto-fix linting
   npm run format       # Auto-format code
   ```

5. **Run Full Test Suite**:
   ```bash
   npm run test:coverage # Tests with coverage
   ```

## 🔄 CI/CD Ready

### Package.json Scripts
- `npm start` - Production
- `npm run dev` - Development
- `npm test` - Testing
- `npm run lint` - Code quality

### Environment Variables
- Development: `.env`
- Testing: `tests/setup.js`
- Production: Server environment

## 📝 Best Practices

1. **Write Tests First** (TDD)
2. **Use ESLint Rules** consistently
3. **Format Code** with Prettier
4. **Debug with Breakpoints** instead of console.log
5. **Test Coverage** should be > 80%
6. **Commit Clean Code** only

## 🎯 Quick Start Testing

```bash
# Install dependencies (already done)
npm install

# Run linting
npm run lint

# Run tests
npm test

# Start development server
npm run dev

# Debug in VS Code
# Press F5 and select "Debug Server"
```
