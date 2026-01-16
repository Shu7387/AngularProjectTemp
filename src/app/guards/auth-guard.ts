import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard checking authentication for:', state.url);

  if (authService.isLoggedIn()) {
    console.log('✅ User is authenticated');
    return true;
  }

  console.log('❌ User not authenticated, redirecting to login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Role Guard - Protects routes based on user roles
 * Redirects to unauthorized page if user doesn't have required role
 */
export const roleGuard: (roles: string[]) => CanActivateFn = (allowedRoles) => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('🛡️ RoleGuard checking roles for:', state.url);
    console.log('🔑 Required roles:', allowedRoles);

    const userRole = authService.getUserRole();
    console.log('👤 User role:', userRole);

    if (userRole && allowedRoles.includes(userRole)) {
      console.log('✅ User has required role');
      return true;
    }

    console.log('❌ User does not have required role');
    router.navigate(['/unauthorized']);
    return false;
  };
};
