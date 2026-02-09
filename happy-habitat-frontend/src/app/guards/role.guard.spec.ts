import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { RolesEnum } from '../enums/roles.enum';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['checkAuth', 'hasAnyRole', 'currentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/sysadmin/comunidades' } as RouterStateSnapshot;
  });

  it('should allow access when user has required role', () => {
    authService.checkAuth.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(true);
    authService.currentUser.and.returnValue({
      id: '1',
      username: 'admin',
      role: RolesEnum.SYSTEM_ADMIN
    } as any);

    const guard = roleGuard([RolesEnum.SYSTEM_ADMIN]);
    const result = guard(mockRoute, mockState);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.checkAuth.and.returnValue(false);

    const guard = roleGuard([RolesEnum.SYSTEM_ADMIN]);
    const result = guard(mockRoute, mockState);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/auth/login'],
      jasmine.objectContaining({ queryParams: { returnUrl: '/sysadmin/comunidades' } })
    );
  });

  it('should redirect to home when user does not have required role', () => {
    authService.checkAuth.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(false);
    authService.currentUser.and.returnValue({
      id: '1',
      username: 'user',
      role: RolesEnum.RESIDENT
    } as any);

    const guard = roleGuard([RolesEnum.SYSTEM_ADMIN]);
    const result = guard(mockRoute, mockState);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
