import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" />
        <mat-icon matSuffix>email</mat-icon>
        @if (form.get('email')?.invalid && form.get('email')?.touched) {
          <mat-error>Valid email required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput [type]="showPassword() ? 'text' : 'password'"
               formControlName="password" autocomplete="current-password" />
        <button type="button" mat-icon-button matSuffix (click)="showPassword.update(v => !v)">
          <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        @if (form.get('password')?.invalid && form.get('password')?.touched) {
          <mat-error>Password required</mat-error>
        }
      </mat-form-field>

      @if (errorMsg()) {
        <p class="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">{{ errorMsg() }}</p>
      }

      <button mat-flat-button color="primary" type="submit"
              [disabled]="loading() || form.invalid" class="h-12 text-base">
        @if (loading()) {
          <mat-spinner diameter="24" class="inline-block mr-2" />
        }
        Sign In
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      New here?
      <a routerLink="/auth/register" class="text-violet-600 font-medium hover:underline">Create account</a>
    </p>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly errorMsg = signal('');
  readonly showPassword = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
