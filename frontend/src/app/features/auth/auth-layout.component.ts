import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative"
         style="background: var(--color-base);">
      <!-- Theme toggle (top-right) -->
      <button mat-icon-button (click)="themeService.toggle()"
              class="absolute top-4 right-4"
              style="color: var(--color-text-muted);"
              [attr.aria-label]="'Switch to ' + (themeService.theme() === 'dark' ? 'light' : 'dark') + ' theme'">
        <mat-icon>{{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <div class="w-full max-w-md fade-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
               style="background: var(--color-accent-muted);">
            <mat-icon class="text-3xl" style="color: var(--color-accent); font-size: 28px; width: 28px; height: 28px;">
              sports_cricket
            </mat-icon>
          </div>
          <h1 class="text-display text-2xl font-semibold" style="color: var(--color-text);">
            IPL Fantasy 2026
          </h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted);">Private League</p>
        </div>
        <div class="card-surface p-8" style="border: 1px solid var(--color-border);">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly themeService = inject(ThemeService);
}
