import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Match, ForecastResponse, ForecastEntry } from '../../core/models/api.models';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatProgressBarModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="max-w-2xl mx-auto p-4 space-y-6">
      <h1 class="text-2xl font-bold" style="color: var(--color-text);">Predictions</h1>

      <!-- Match Selector -->
      <mat-form-field class="w-full" appearance="outline">
        <mat-label>Select Match</mat-label>
        <mat-select [(value)]="selectedMatchId" (selectionChange)="onMatchChange($event.value)">
          @for (m of relevantMatches(); track m._id) {
            <mat-option [value]="m._id">
              {{ m.team1 }} vs {{ m.team2 }}
              @if (m.status === 'live') { <span class="text-green-400 ml-2">LIVE</span> }
              @else if (m.status === 'completed') { <span class="text-gray-400 ml-2">Completed</span> }
              @else { <span class="text-yellow-400 ml-2">Upcoming</span> }
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (loading()) {
        <div class="flex justify-center py-8">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      }

      @if (forecast()) {
        <!-- Match Progress -->
        <div class="rounded-xl p-4" style="background: var(--color-surface);">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium" style="color: var(--color-text-muted);">
              {{ forecast()!.matchLabel }} &mdash; Innings {{ forecast()!.matchProgress.inning }}
            </span>
            <span class="text-sm font-semibold" [style.color]="confidenceColor(forecast()!.forecast[0]?.confidence || 0)">
              {{ forecast()!.forecast[0]?.confidence || 0 }}% confidence
            </span>
          </div>
          <mat-progress-bar
            mode="determinate"
            [value]="(forecast()!.matchProgress.oversCompleted / forecast()!.matchProgress.totalOvers) * 100"
            color="primary">
          </mat-progress-bar>
          <div class="flex justify-between mt-1 text-xs" style="color: var(--color-text-muted);">
            <span>{{ forecast()!.matchProgress.oversCompleted }} overs</span>
            <span>{{ forecast()!.matchProgress.totalOvers }} total</span>
          </div>
        </div>

        <!-- Match Predictor -->
        <div>
          <h2 class="text-lg font-semibold mb-3" style="color: var(--color-text);">Match Leaderboard Forecast</h2>
          <div class="space-y-2">
            @for (entry of matchRanked(); track entry.userId) {
              <div class="rounded-xl p-3 flex items-center gap-3"
                   [style.background]="entry.userId === currentUserId() ? 'var(--color-accent-muted)' : 'var(--color-surface)'"
                   [style.border]="entry.projectedMatchRank <= 3 ? '1px solid ' + rankColor(entry.projectedMatchRank) : '1px solid transparent'">
                <!-- Rank -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                     [style.background]="rankColor(entry.projectedMatchRank)"
                     style="color: #000;">
                  {{ entry.projectedMatchRank }}
                </div>
                <!-- Name & Points -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate" style="color: var(--color-text);">{{ entry.userName }}</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs" style="color: var(--color-text-muted);">
                      Live: {{ entry.livePoints }}
                    </span>
                    <span class="text-xs font-semibold" style="color: var(--color-accent);">
                      Proj: {{ entry.projectedMatchPoints }}
                    </span>
                    <span class="text-xs" style="color: var(--color-text-muted);">
                      ({{ entry.pointRange.min }} - {{ entry.pointRange.max }})
                    </span>
                  </div>
                </div>
                <!-- Confidence Bar -->
                <div class="w-16 shrink-0">
                  <div class="h-2 rounded-full overflow-hidden" style="background: var(--color-surface-alt, #333);">
                    <div class="h-full rounded-full transition-all duration-500"
                         [style.width.%]="entry.confidence"
                         [style.background]="confidenceColor(entry.confidence)">
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Season Projector -->
        <div>
          <h2 class="text-lg font-semibold mb-3" style="color: var(--color-text);">Season Standings Projection</h2>
          <div class="space-y-2">
            @for (entry of seasonRanked(); track entry.userId) {
              <div class="rounded-xl p-3 flex items-center gap-3"
                   [style.background]="entry.userId === currentUserId() ? 'var(--color-accent-muted)' : 'var(--color-surface)'"
                   [style.border]="entry.projectedRank <= 3 ? '1px solid ' + rankColor(entry.projectedRank) : '1px solid transparent'">
                <!-- Rank -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                     [style.background]="rankColor(entry.projectedRank)"
                     style="color: #000;">
                  {{ entry.projectedRank }}
                </div>
                <!-- Name & Points -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate" style="color: var(--color-text);">{{ entry.userName }}</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs" style="color: var(--color-text-muted);">
                      Season: {{ entry.currentPoints }}
                    </span>
                    <span class="text-xs" style="color: var(--color-text-muted);">+</span>
                    <span class="text-xs" style="color: var(--color-accent);">
                      {{ entry.projectedMatchPoints }}
                    </span>
                    <span class="text-xs" style="color: var(--color-text-muted);">=</span>
                    <span class="text-sm font-bold" style="color: var(--color-text);">
                      {{ entry.projectedSeasonTotal }}
                    </span>
                  </div>
                </div>
                <!-- Rank Movement -->
                <div class="shrink-0 flex items-center gap-1">
                  @if (entry.currentSeasonRank > entry.projectedRank) {
                    <mat-icon class="text-green-400" style="font-size: 18px; width: 18px; height: 18px;">arrow_upward</mat-icon>
                    <span class="text-xs text-green-400">{{ entry.currentSeasonRank - entry.projectedRank }}</span>
                  } @else if (entry.currentSeasonRank < entry.projectedRank) {
                    <mat-icon class="text-red-400" style="font-size: 18px; width: 18px; height: 18px;">arrow_downward</mat-icon>
                    <span class="text-xs text-red-400">{{ entry.projectedRank - entry.currentSeasonRank }}</span>
                  } @else {
                    <span class="text-xs" style="color: var(--color-text-muted);">&mdash;</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <p class="text-xs text-center" style="color: var(--color-text-muted);">
          Updated {{ forecast()!.generatedAt | date:'shortTime' }} &bull; Refreshes every 30s during live matches
        </p>
      }

      @if (error()) {
        <div class="rounded-xl p-4 text-center" style="background: var(--color-danger-muted, #3a1a1a); color: var(--color-danger);">
          {{ error() }}
        </div>
      }
    </div>
  `,
})
export class PredictionsComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private pollSub?: Subscription;

  selectedMatchId = '';
  readonly matches = signal<Match[]>([]);
  readonly forecast = signal<ForecastResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly currentUserId = computed(() => this.auth.currentUser()?.id || '');

  readonly relevantMatches = computed(() =>
    this.matches().filter((m) => ['live', 'completed', 'upcoming', 'toss_done'].includes(m.status))
      .sort((a, b) => {
        // Live first, then upcoming, then completed
        const order: Record<string, number> = { live: 0, toss_done: 1, upcoming: 2, completed: 3 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      })
  );

  readonly matchRanked = computed(() => {
    const f = this.forecast();
    if (!f) return [];
    return [...f.forecast].sort((a, b) => a.projectedMatchRank - b.projectedMatchRank);
  });

  readonly seasonRanked = computed(() => {
    const f = this.forecast();
    if (!f) return [];
    return [...f.forecast].sort((a, b) => a.projectedRank - b.projectedRank);
  });

  async ngOnInit() {
    const allMatches = await firstValueFrom(this.api.getMatches());
    this.matches.set(allMatches);

    // Auto-select first live match, or first upcoming, or first completed
    const live = allMatches.find((m) => m.status === 'live');
    const upcoming = allMatches.find((m) => m.status === 'upcoming' || m.status === 'toss_done');
    const completed = allMatches.find((m) => m.status === 'completed');
    const autoSelect = live || upcoming || completed;

    if (autoSelect) {
      this.selectedMatchId = autoSelect._id;
      this.startPolling(autoSelect._id, autoSelect.status);
    }
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  onMatchChange(matchId: string) {
    const match = this.matches().find((m) => m._id === matchId);
    this.startPolling(matchId, match?.status || 'upcoming');
  }

  private startPolling(matchId: string, status: string) {
    this.pollSub?.unsubscribe();
    this.forecast.set(null);
    this.error.set('');
    this.loading.set(true);

    if (status === 'live') {
      // Poll every 30s
      this.pollSub = interval(30_000).pipe(
        startWith(0),
        switchMap(() => this.api.getLeaderboardForecast(matchId)),
      ).subscribe({
        next: (data) => { this.forecast.set(data); this.loading.set(false); },
        error: (err) => { this.error.set(err.error?.message ?? 'Failed to load forecast'); this.loading.set(false); },
      });
    } else {
      // Single fetch
      this.api.getLeaderboardForecast(matchId).subscribe({
        next: (data) => { this.forecast.set(data); this.loading.set(false); },
        error: (err) => { this.error.set(err.error?.message ?? 'Failed to load forecast'); this.loading.set(false); },
      });
    }
  }

  rankColor(rank: number): string {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'var(--color-surface-alt, #444)';
  }

  confidenceColor(c: number): string {
    if (c < 33) return '#EF4444';
    if (c < 66) return '#F59E0B';
    return '#22C55E';
  }
}
