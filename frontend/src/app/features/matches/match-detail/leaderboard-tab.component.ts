import { Component, inject, input, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { interval, Subscription, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaderboardEntry, FantasyTeam, MatchStatus } from '../../../core/models/api.models';

const POLL_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-leaderboard-tab',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule, MatChipsModule],
  template: `
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-700">Match Leaderboard</h3>
        @if (isLive()) {
          <mat-chip class="bg-red-100 text-red-700">
            <mat-icon class="text-xs mr-1">circle</mat-icon> Live · updates every 30s
          </mat-chip>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8"><mat-spinner diameter="40" /></div>
      }
      @if (error()) {
        <p class="text-red-500 text-center">{{ error() }}</p>
      }

      @for (entry of leaderboard(); track entry.userId; let i = $index) {
        <div class="flex items-center gap-3 p-3 rounded-xl border"
             [class.border-violet-400]="entry.userId === myUserId()"
             [class.bg-violet-50]="entry.userId === myUserId()">
          <span class="w-8 text-center font-bold text-lg"
                [class.text-yellow-500]="i === 0"
                [class.text-gray-400]="i === 1"
                [class.text-orange-600]="i === 2">
            {{ i + 1 }}
          </span>
          <mat-icon class="text-gray-400">person</mat-icon>
          <span class="flex-1 font-medium">
            {{ entry.userName }}
            @if (entry.userId === myUserId()) {
              <span class="text-xs text-violet-500 ml-1">(You)</span>
            }
          </span>
          <span class="font-bold text-violet-700 text-lg">{{ entry.totalPoints }}</span>
        </div>
      }

      @if (leaderboard().length === 0 && !loading()) {
        <p class="text-center text-gray-400 py-8">No teams submitted for this match yet.</p>
      }
    </div>
  `,
})
export class LeaderboardTabComponent implements OnInit, OnDestroy {
  readonly matchId = input.required<string>();
  readonly matchStatus = input.required<MatchStatus>();

  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly leaderboard = signal<LeaderboardEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly isLive = computed(() => this.matchStatus() === 'live');
  readonly myUserId = computed(() => this.auth.currentUser()?.id ?? '');

  private subscription?: Subscription;

  ngOnInit() {
    // Poll every 30s if live, otherwise fetch once
    const source$ = this.isLive()
      ? interval(POLL_INTERVAL_MS).pipe(startWith(0), switchMap(() => this.api.getMatchLeaderboard(this.matchId())))
      : this.api.getMatchLeaderboard(this.matchId());

    this.subscription = source$.subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load leaderboard');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
