import { Routes } from '@angular/router';
import { AddPatientComponent } from './components/add-patient/add-patient';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { PatientListComponent } from './components/patient-list/patient-list';
import { PatientDetailComponent } from './components/patient-detail/patient-detail';
import { EditPatientComponent } from './components/edit-patient/edit-patient';
import { authGuard, roleGuard } from './guards/auth-guard';

/**
 * Application Routes Configuration
 * ---------------------------------
 * This file defines all the routes for the Angular application.
 * Includes public, protected, and fallback routes.
 */

export const routes: Routes = [
  /**
   * Default route
   * Redirects empty path to the login page
   */
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  /**
   * Public route - Login page
   */
  {
    path: 'login',
    component: LoginComponent,
  },

  /**
   * Protected route - Dashboard
   * Contains child routes for patients and appointments
   * Uncomment `canActivate` to enable authentication guard
   */
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // auth guard for authenticated route check
    children: [
      /**
       * Default child route under dashboard
       * Redirects to 'patients' by default
       */
      {
        path: '',
        redirectTo: 'patients',
        pathMatch: 'full',
      },
      /**
       * Patients list route
       */
      {
        path: 'patients',
        component: PatientListComponent,
        data: { title: 'Patient Management' },
      },
      {
        path: 'patient/:id',
        component: PatientDetailComponent,
      },
      {
        path: 'add-patient',
        component: AddPatientComponent,
      },
      {
        path: 'edit-patient/:id',
        component: EditPatientComponent,
      },
      /**
       * Appointments route - Lazy loaded component
       */
      {
        path: 'appointments',
        loadComponent: () =>
          import('./components/appointments/appointments').then((m) => m.AppointmentsComponent),
        data: { title: 'Appointment Scheduling' },
      },
    ],
  },

  /**
   * Admin route - Protected by role guard
   * Uncomment `canActivate` when role-based guard is implemented
   */
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])], // Check authentication and role access
    loadComponent: () => import('./components/admin/admin').then((m) => m.AdminComponent),
    data: { title: 'Admin Panel' },
  },

  /**
   * Unauthorized access page
   */
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized').then((m) => m.UnauthorizedComponent),
  },

  /**
   * Wildcard route
   * Redirects any unknown path to login page
   */
  {
    path: '**',
    redirectTo: '/login',
  },
];
