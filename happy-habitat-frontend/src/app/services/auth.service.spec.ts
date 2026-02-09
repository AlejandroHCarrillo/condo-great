import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { UsersService } from './users.service';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../shared/interfaces/auth.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let sessionService: jasmine.SpyObj<SessionService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let loggerService: jasmine.SpyObj<LoggerService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const sessionSpy = jasmine.createSpyObj('SessionService', ['saveSession', 'getToken', 'clearSession']);
    const usersSpy = jasmine.createSpyObj('UsersService', ['clearCurrentUser']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn', 'debug']);
    const errorSpy = jasmine.createSpyObj('ErrorService', ['handleError']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: SessionService, useValue: sessionSpy },
        { provide: UsersService, useValue: usersSpy },
        { provide: LoggerService, useValue: loggerSpy },
        { provide: ErrorService, useValue: errorSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and update signals', (done) => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const mockResponse: LoginResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'RESIDENT'
        },
        expiresIn: 3600
      };

      // Temporarily disable mock auth for this test
      const originalUseMock = environment.auth?.useMockAuth;
      (environment as any).auth = { useMockAuth: false };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response.token).toBe('test-token');
          expect(service.isAuthenticated()).toBe(true);
          expect(service.currentUser()).toBeTruthy();
          expect(sessionService.saveSession).toHaveBeenCalled();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      // Restore original value
      (environment as any).auth = { useMockAuth: originalUseMock };
    });

    it('should handle login error', (done) => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const originalUseMock = environment.auth?.useMockAuth;
      (environment as any).auth = { useMockAuth: false };

      service.login(credentials).subscribe({
        next: () => done.fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.isLoading()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      // Restore original value
      (environment as any).auth = { useMockAuth: originalUseMock };
    });
  });

  describe('logout', () => {
    it('should clear session and redirect to login', () => {
      service.logout();

      expect(sessionService.clearSession).toHaveBeenCalled();
      expect(usersService.clearCurrentUser).toHaveBeenCalled();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('checkAuth', () => {
    it('should return true when token exists and is valid', () => {
      sessionService.getToken.and.returnValue('valid-token');
      const result = service.checkAuth();
      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      sessionService.getToken.and.returnValue(null);
      const result = service.checkAuth();
      expect(result).toBe(false);
    });
  });
});
