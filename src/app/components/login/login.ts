import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoginRequest } from '../../models/auth.model';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  // DI via inject() at class level (safe)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // UI state
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;

  // Return URL; empty means "no return URL provided"
  private returnUrl = '';

  // Demo credentials for user reference (unchanged)
  demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'doctor', password: 'doctor123', role: 'Doctor' },
    { username: 'nurse', password: 'nurse123', role: 'Nurse' },
  ];

  ngOnInit(): void {
    // Initialize login form with validators
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Read returnUrl from query params
    const param = this.route.snapshot.queryParamMap.get('returnUrl');
    if (param) {
      this.returnUrl = param;
    } else {
      // One-time subscription as a fallback if the URL might change before init
      this.route.queryParamMap
        .pipe(
          map((map) => map.get('returnUrl')),
          take(1)
        )
        .subscribe((url) => {
          if (url) this.returnUrl = url;
        });
    }

    // If already logged in, redirect (fallback to dashboard when no return URL)
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl || '/dashboard');
    }
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const credentials: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response.user);
        this.isLoading = false;

        // If a returnUrl exists, prefer it
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        // Otherwise, navigate based on user role
        const role = (response?.user?.role ?? '').toLowerCase();
        if (role === 'admin' || role === 'administrator') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        this.isLoading = false;
        this.errorMessage = error?.message || 'Invalid username or password';
      },
    });
  }

  /**
   * Quick login with demo credentials
   */
  quickLogin(username: string, password: string): void {
    this.loginForm.patchValue({ username, password });
    this.onSubmit();
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get form control for template access
   */
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
