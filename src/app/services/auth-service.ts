import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:300';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Current logged-in user state
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔐 AuthService initialized');
    // Check token validity on initialization
    this.checkTokenValidity();
  }

  // ========== Authentication Methods ==========

  /**
   * Login with username and password
   * In production, this would call a real API
   * For demo: We'll simulate authentication
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔑 Attempting login:', credentials.username);

    // Simulate API call with mock users
    return this.mockLogin(credentials).pipe(
      tap((response) => {
        console.log('✅ Login successful:', response.user.username);
        this.setSession(response);
      }),
      catchError((error) => {
        console.error('❌ Login failed:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Logout user and clear session
   */
  logout(): void {
    console.log('👋 Logging out user');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ========== Private Methods ==========

  /**
   * Mock login implementation
   * In production, replace with actual API call
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock users database
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@hospital.com',
        role: 'admin' as const,
        fullName: 'Admin User',
      },
      {
        id: 2,
        username: 'doctor',
        password: 'doctor123',
        email: 'doctor@hospital.com',
        role: 'doctor' as const,
        fullName: 'Dr. John Smith',
      },
      {
        id: 3,
        username: 'nurse',
        password: 'nurse123',
        email: 'nurse@hospital.com',
        role: 'nurse' as const,
        fullName: 'Nurse Mary Johnson',
      },
    ];

    // Simulate network delay
    return of(null).pipe(
      map(() => {
        // Find user
        const user = mockUsers.find(
          (u) => u.username === credentials.username && u.password === credentials.password,
        );

        if (!user) {
          throw new Error('Invalid username or password');
        }

        // Generate mock JWT token
        const token = this.generateMockToken(user);

        // Return login response
        const response: LoginResponse = {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          },
          expiresIn: 3600, // 1 hour
        };

        return response;
      }),
    );
  }

  /**
   * Generate mock JWT token
   * In production, token comes from backend
   */
  private generateMockToken(user: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        username: user.username,
        role: user.role,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 3600, // 1 hour
      }),
    );
    const signature = 'mock_signature';

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Set authentication session
   */
  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Check if token exists and is valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // In production, validate token expiration
    try {
      const payload = this.decodeToken(token);
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /**
   * Get user from local storage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check token validity on service initialization
   */
  private checkTokenValidity(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }
}
