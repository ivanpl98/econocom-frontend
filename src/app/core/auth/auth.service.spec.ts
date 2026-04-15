import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);

    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save auth token to localStorage', () => {
    service.setAuthToken('Bearer', 'test-token', 'test-refresh-token');
    expect(localStorage.getItem('authToken')).toEqual('Bearer test-token');
    expect(localStorage.getItem('refreshToken')).toEqual('Bearer test-refresh-token');
  }); 

  it('should retrieve auth token from localStorage', () => {
    localStorage.setItem('authToken', 'Bearer test-token');
    expect(service.getAuthToken()).toEqual('Bearer test-token');
  });

  it('should clear auth token from localStorage', () => {
    service.setAuthToken('Bearer', 'test-token', 'test-refresh-token');
    service.clearAuthToken();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should return true for isLoggedIn when auth token exists', () => {
    service.setAuthToken('Bearer', 'test-token', 'test-refresh-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false for isLoggedIn when no auth token exists', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

});
