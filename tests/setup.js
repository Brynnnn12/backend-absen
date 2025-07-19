/**
 * Jest setup file
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.RESET_PASSWORD_SECRET = 'test-reset-secret';
process.env.MONGO_URI = 'mongodb+srv://brynnnn12:Mudzakir15@notesapp.ogg2p.mongodb.net/?retryWrites=true&w=majority&appName=notesapp';
process.env.PORT = '5001'; // Different port for testing

// Mock email service in tests
jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendNotificationEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Mock logger in tests
jest.mock('../src/utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
  logAuth: jest.fn(),
  logSecurity: jest.fn()
}));

// Set longer timeout for database operations
jest.setTimeout(10000);

// Global test hooks
beforeAll(async () => {
  // Database setup if needed
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
