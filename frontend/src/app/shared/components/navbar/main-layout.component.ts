import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatSidenavModule, MatListModule,
  ],
  template: `
    <mat-sidenav-container class="h-full">
      <!-- Side nav (mobile) -->
      <mat-sidenav #sidenav mode="over" class="w-64 p-4">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="bg-violet-100"
             (click)="sidenav.close()">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/matches" routerLinkActive="bg-violet-100"
             (click)="sidenav.close()">
            <mat-icon matListItemIcon>sports_cricket</mat-icon>
            <span matListItemTitle>Matches</span>
          </a>
          <a mat-list-item routerLink="/leaderboard" routerLinkActive="bg-violet-100"
             (click)="sidenav.close()">
            <mat-icon matListItemIcon>leaderboard</mat-icon>
            <span matListItemTitle>Leaderboard</span>
          </a>
          @if (auth.isAdmin()) {
            <a mat-list-item routerLink="/admin" routerLinkActive="bg-violet-100"
               (click)="sidenav.close()">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Admin</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content>
        <!-- Top navbar -->
        <mat-toolbar class="sticky top-0 z-50 shadow-sm" color="primary">
          <button mat-icon-button class="md:hidden" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="font-bold text-lg tracking-wide">🏏 IPL Fantasy 2026</span>

          <!-- Desktop nav links -->
          <nav class="hidden md:flex gap-2 ml-6">
            <a mat-button routerLink="/dashboard" routerLinkActive="opacity-100"
               class="opacity-80">Dashboard</a>
            <a mat-button routerLink="/matches" routerLinkActive="opacity-100"
               class="opacity-80">Matches</a>
            <a mat-button routerLink="/leaderboard" routerLinkActive="opacity-100"
               class="opacity-80">Leaderboard</a>
            @if (auth.isAdmin()) {
              <a mat-button routerLink="/admin" routerLinkActive="opacity-100"
                 class="opacity-80">Admin</a>
            }
          </nav>

          <span class="flex-1"></span>

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="px-4 py-2 text-sm font-medium text-gray-700">
              {{ auth.currentUser()?.name }}
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content -->
        <main class="p-4 md:p-6 max-w-6xl mx-auto">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
}
