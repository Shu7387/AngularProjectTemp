import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for JWT Authentication
 * - Attaches JWT token to outgoing requests
 * - Handles 401 Unauthorized responses
 * - Demonstrates Angular's functional interceptor pattern
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the auth token from the service
  const authToken = authService.getToken();

  console.log('🔄 HTTP Interceptor:', req.method, req.url);

  // Clone the request and add authorization header if token exists
  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('🔑 Token attached to request');
  }

  // Pass the cloned request to the next handler
  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized:
      // - Immediately log out the user and redirect to the login page.
      // - Rethrow the error so downstream subscribers can still handle it
      //   (e.g., a service making an HTTP call can process it in the background).
      //   The user will simply see the normal login page.

      if (error.status === 401) {
        console.error('❌ 401 Unauthorized - Logging out');
        authService.logout();
        router.navigate(['/login']);
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('❌ 403 Forbidden - Insufficient permissions');
      }

      return throwError(() => error);
    })
  );
};
