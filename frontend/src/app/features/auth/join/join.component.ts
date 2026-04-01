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
  selector: 'app-join',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Join the League</h2>
    <p class="text-gray-500 text-sm mb-6">
      Enter the 6-character invite code shared by the Admin.
    </p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
      <mat-form-field appearance="outline">
        <mat-label>Invite Code</mat-label>
        <input matInput formControlName="inviteCode" placeholder="e.g. A3F9C1"
               class="uppercase tracking-widest text-lg font-mono" maxlength="6" />
        <mat-icon matSuffix>vpn_key</mat-icon>
      </mat-form-field>

      @if (successMsg()) {
        <p class="text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg">{{ successMsg() }}</p>
      }
      @if (errorMsg()) {
        <p class="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">{{ errorMsg() }}</p>
      }

      <button mat-flat-button color="primary" type="submit"
              [disabled]="loading() || form.invalid" class="h-12 text-base">
        @if (loading()) {
          <mat-spinner diameter="24" class="inline-block mr-2" />
        }
        Join League
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      <a routerLink="/dashboard" class="text-violet-600 font-medium hover:underline">Back to Dashboard</a>
    </p>
  `,
})
export class JoinComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    inviteCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  readonly loading = signal(false);
  readonly errorMsg = signal('');
  readonly successMsg = signal('');

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.joinLeague(this.form.value.inviteCode!).subscribe({
      next: () => {
        this.successMsg.set('Joined successfully! Redirecting…');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Invalid invite code');
        this.loading.set(false);
      },
    });
  }
}
