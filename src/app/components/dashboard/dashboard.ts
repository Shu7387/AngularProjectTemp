import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { User } from '../../models/auth.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  menuItems = [
    {
      path: '/dashboard/patients',
      icon: 'bi-people',
      label: 'Patients',
      roles: ['admin', 'doctor', 'nurse'],
    },
    {
      path: '/dashboard/appointments',
      icon: 'bi-calendar-check',
      label: 'Appointments',
      roles: ['admin', 'doctor', 'nurse'],
    },
    { path: '/admin', icon: 'bi-gear', label: 'Admin Panel', roles: ['admin'] },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  // if no take until Subscription continues even after component is destroyed
  ngOnInit(): void {
    this.authService.currentUser$ // Emits user data whenever authentication state changes:with currentUser$
      .pipe(takeUntil(this.destroy$)) // Step 2: Complete when destroy$ emits
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canAccessRoute(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  getRoleBadgeClass(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'doctor':
        return 'bg-primary';
      case 'nurse':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}
