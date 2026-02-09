import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { ErrorType, ErrorSeverity } from '../shared/interfaces/error.interface';

describe('ErrorService', () => {
  let service: ErrorService;
  let loggerService: jasmine.SpyObj<LoggerService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['showError']);

    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        { provide: LoggerService, useValue: loggerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(ErrorService);
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('normalizeError', () => {
    it('should normalize HttpErrorResponse 404', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Resource not found' }
      });

      const normalized = service.normalizeError(httpError, 'TestContext');

      expect(normalized.type).toBe(ErrorType.NOT_FOUND);
      expect(normalized.severity).toBe(ErrorSeverity.LOW);
      expect(normalized.context).toBe('TestContext');
      expect(normalized.originalError).toBe(httpError);
    });

    it('should normalize HttpErrorResponse 500', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      const normalized = service.normalizeError(httpError);

      expect(normalized.type).toBe(ErrorType.SERVER_ERROR);
      expect(normalized.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should normalize JavaScript Error', () => {
      const jsError = new Error('Test error message');

      const normalized = service.normalizeError(jsError, 'TestContext');

      expect(normalized.type).toBe(ErrorType.UNKNOWN);
      expect(normalized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(normalized.message).toBe('Test error message');
      expect(normalized.context).toBe('TestContext');
    });

    it('should return AppError as-is if already normalized', () => {
      const appError = {
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: 'Validation failed',
        userMessage: 'Please check your input',
        timestamp: new Date()
      };

      const normalized = service.normalizeError(appError);

      expect(normalized).toBe(appError);
    });
  });

  describe('handleError', () => {
    it('should log error when logError is true', () => {
      const error = new Error('Test error');
      service.handleError(error, { logError: true });

      expect(loggerService.error).toHaveBeenCalled();
    });

    it('should not log error when logError is false', () => {
      const error = new Error('Test error');
      service.handleError(error, { logError: false });

      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should show notification when showNotification is true', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request'
      });

      service.handleError(httpError, { showNotification: true });

      expect(notificationService.showError).toHaveBeenCalled();
    });

    it('should navigate when redirectTo is provided', () => {
      const error = new Error('Test error');
      service.handleError(error, { redirectTo: '/login' });

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call custom handler when provided', () => {
      const error = new Error('Test error');
      const customHandler = jasmine.createSpy('customHandler');

      service.handleError(error, { customHandler });

      expect(customHandler).toHaveBeenCalled();
    });

    it('should add error to activeErrors signal', () => {
      const error = new Error('Test error');
      const initialCount = service.activeErrors().length;

      service.handleError(error);

      expect(service.activeErrors().length).toBeGreaterThan(initialCount);
    });
  });
});
