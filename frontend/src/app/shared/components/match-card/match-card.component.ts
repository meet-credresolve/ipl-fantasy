import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Match, MatchStatus } from '../../../core/models/api.models';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card class="hover:shadow-lg transition-shadow cursor-pointer" appearance="outlined">
      <mat-card-header>
        <mat-card-subtitle class="flex items-center gap-2">
          <mat-icon class="text-sm">calendar_today</mat-icon>
          {{ formattedDate() }}
        </mat-card-subtitle>
        <span class="flex-1"></span>
        <mat-chip [class]="statusClass()">{{ statusLabel() }}</mat-chip>
      </mat-card-header>

      <mat-card-content class="pt-4">
        <div class="flex items-center justify-between text-center">
          <div class="flex-1">
            <div class="text-2xl font-bold text-violet-700">{{ match().team1 }}</div>
          </div>
          <div class="px-4">
            <span class="text-gray-400 font-medium text-sm">VS</span>
          </div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-orange-600">{{ match().team2 }}</div>
          </div>
        </div>

        @if (match().venue) {
          <p class="text-center text-xs text-gray-500 mt-2">📍 {{ match().venue }}</p>
        }

        @if (match().result) {
          <p class="text-center text-sm font-medium text-green-700 mt-2 bg-green-50 rounded-lg py-1">
            {{ match().result }}
          </p>
        }

        @if (isUpcoming() && timeToDeadline() > 0) {
          <p class="text-center text-xs text-orange-600 mt-2">
            ⏱ Team deadline: {{ deadlineString() }}
          </p>
        }
        @if (isUpcoming() && timeToDeadline() <= 0) {
          <p class="text-center text-xs text-red-600 mt-2 font-medium">🔒 Deadline passed</p>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        <a mat-button color="primary" [routerLink]="['/matches', match()._id]">
          @switch (match().status) {
            @case ('upcoming') { Build Team }
            @case ('toss_done') { Build Team }
            @case ('live') { View Live }
            @default { View Results }
          }
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class MatchCardComponent {
  readonly match = input.required<Match>();

  readonly formattedDate = computed(() => {
    const d = new Date(this.match().scheduledAt);
    return d.toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    }) + ' IST';
  });

  readonly timeToDeadline = computed(() =>
    new Date(this.match().deadline).getTime() - Date.now()
  );

  readonly isUpcoming = computed(() =>
    this.match().status === 'upcoming' || this.match().status === 'toss_done'
  );

  readonly deadlineString = computed(() => {
    const d = new Date(this.match().deadline);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) + ' IST';
  });

  readonly statusLabel = computed(() => {
    const labels: Record<MatchStatus, string> = {
      upcoming: 'Upcoming',
      toss_done: 'XI Announced',
      live: '🔴 Live',
      completed: 'Completed',
      abandoned: 'Abandoned',
    };
    return labels[this.match().status];
  });

  readonly statusClass = computed(() => {
    const classes: Record<MatchStatus, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      toss_done: 'bg-yellow-100 text-yellow-700',
      live: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
      abandoned: 'bg-gray-100 text-gray-500',
    };
    return classes[this.match().status];
  });
}
