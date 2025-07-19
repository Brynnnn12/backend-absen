/* eslint-disable no-trailing-spaces */
/**
 * Utils Tests - Simple unit tests without database
 */

const { dateHelper, responseHelper } = require('../src/utils');

describe('Utils Tests', () => {
  describe('dateHelper', () => {
    test('should format date correctly', () => {
      const date = new Date('2024-01-01');
      const formatted = dateHelper.formatDate(date);
      expect(formatted).toBe('1 Januari 2024');
    });

    test('should format date with specific locale', () => {
      const date = new Date('2024-01-01');
      const formatted = dateHelper.formatDate(date, 'en-US');
      expect(formatted).toBe('January 1, 2024');
    });

    test('should format time correctly', () => {
      const date = new Date('2024-01-01T08:30:45');
      const formatted = dateHelper.formatTime(date, 'en-US');
      expect(formatted).toMatch(/08:30:45/);
    });

    test('should check if date is late', () => {
      const earlyTime = new Date();
      earlyTime.setHours(7, 30, 0, 0);
      
      const lateTime = new Date();
      lateTime.setHours(8, 30, 0, 0);

      expect(dateHelper.isLate(earlyTime)).toBe(false);
      expect(dateHelper.isLate(lateTime)).toBe(true);
    });

    test('should calculate work duration', () => {
      const clockIn = new Date('2024-01-01T08:00:00');
      const clockOut = new Date('2024-01-01T17:00:00');
      
      const duration = dateHelper.calculateWorkDuration(clockIn, clockOut);
      expect(duration).toBe(540); // 9 hours = 540 minutes
    });

    test('should format duration correctly', () => {
      expect(dateHelper.formatDuration(60)).toBe('1h');
      expect(dateHelper.formatDuration(90)).toBe('1h 30m');
      expect(dateHelper.formatDuration(30)).toBe('30m');
      expect(dateHelper.formatDuration(0)).toBe('0m');
    });

    test('should get today date range', () => {
      const { startOfDay, endOfDay } = dateHelper.getTodayDateRange();
      
      expect(startOfDay).toBeInstanceOf(Date);
      expect(endOfDay).toBeInstanceOf(Date);
      expect(startOfDay.getHours()).toBe(0);
      expect(endOfDay.getHours()).toBe(23);
    });

    test('should check if date is weekend', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      const sunday = new Date('2024-01-07'); // Sunday
      const monday = new Date('2024-01-08'); // Monday

      expect(dateHelper.isWeekend(saturday)).toBe(true);
      expect(dateHelper.isWeekend(sunday)).toBe(true);
      expect(dateHelper.isWeekend(monday)).toBe(false);
    });
  });

  describe('responseHelper', () => {
    test('should create mock response object', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      responseHelper.sendSuccess(mockRes, 200, 'Test success', { id: 1 });
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Test success',
        data: { id: 1 }
      });
    });

    test('should send error response', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      responseHelper.sendError(mockRes, 400, 'Test error');
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error'
      });
    });

    test('should send paginated response', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const data = [1, 2, 3];
      responseHelper.sendPaginatedResponse(mockRes, data, 1, 10, 3);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Data retrieved successfully',
        data: [1, 2, 3],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    });

    test('should send validation error', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const errors = { field: 'required' };
      responseHelper.sendValidationError(mockRes, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        errors
      });
    });

    test('should send unauthorized response', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      responseHelper.sendUnauthorized(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized'
      });
    });

    test('should send not found response', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      responseHelper.sendNotFound(mockRes, 'User not found');
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
});
