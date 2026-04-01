import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-800">Admin Panel</h1>
      <p class="text-gray-500">Manage the league from here.</p>

      <div class="grid md:grid-cols-3 gap-4">
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow">
          <mat-card-content class="flex flex-col items-center p-6 gap-3">
            <mat-icon class="text-5xl text-violet-600">people</mat-icon>
            <h3 class="font-bold text-lg">Players</h3>
            <p class="text-sm text-gray-500 text-center">Add, edit, and set credit values for all IPL 2026 players.</p>
            <a mat-flat-button color="primary" routerLink="/admin/players" class="mt-2">Manage Players</a>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow">
          <mat-card-content class="flex flex-col items-center p-6 gap-3">
            <mat-icon class="text-5xl text-orange-600">sports_cricket</mat-icon>
            <h3 class="font-bold text-lg">Matches</h3>
            <p class="text-sm text-gray-500 text-center">Schedule matches, announce playing XI after toss.</p>
            <a mat-flat-button color="primary" routerLink="/admin/matches" class="mt-2">Manage Matches</a>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow">
          <mat-card-content class="flex flex-col items-center p-6 gap-3">
            <mat-icon class="text-5xl text-green-600">scoreboard</mat-icon>
            <h3 class="font-bold text-lg">Enter Scores</h3>
            <p class="text-sm text-gray-500 text-center">Enter player stats after a match to calculate fantasy points.</p>
            <a mat-flat-button color="primary" routerLink="/admin/matches" class="mt-2">Go to Matches</a>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class AdminComponent {}
