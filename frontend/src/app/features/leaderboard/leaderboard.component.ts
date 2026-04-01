import { Component, inject, signal, resource } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardEntry } from '../../core/models/api.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [MatTabsModule, MatProgressSpinnerModule, MatIconModule, MatSelectModule, FormsModule],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-800">Leaderboard</h1>

      <mat-tab-group animationDuration="200ms">
        <!-- Season Leaderboard -->
        <mat-tab label="🏆 Season Overall">
          @defer (on immediate) {
            @if (seasonLeaderboard.isLoading()) {
              <div class="flex justify-center p-12"><mat-spinner diameter="48" /></div>
            }
            <div class="mt-4 space-y-2">
              @for (entry of seasonLeaderboard.value() ?? []; track entry.userId; let i = $index) {
                <div class="flex items-center gap-3 p-4 rounded-xl border-2 transition-shadow hover:shadow-sm"
                     [class.border-yellow-400]="i === 0"
                     [class.border-gray-300]="i === 1"
                     [class.border-orange-400]="i === 2"
                     [class.border-gray-100]="i > 2"
                     [class.bg-violet-50]="entry.userId === auth.currentUser()?.id">
                  <div class="w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg"
                       [class.bg-yellow-100]="i === 0" [class.text-yellow-600]="i === 0"
                       [class.bg-gray-100]="i === 1" [class.text-gray-500]="i === 1"
                       [class.bg-orange-100]="i === 2" [class.text-orange-600]="i === 2"
                       [class.bg-white]="i > 2" [class.text-gray-400]="i > 2">
                    @switch (i) {
                      @case (0) { 🥇 }
                      @case (1) { 🥈 }
                      @case (2) { 🥉 }
                      @default { {{ i + 1 }} }
                    }
                  </div>
                  <mat-icon class="text-gray-400">person</mat-icon>
                  <div class="flex-1">
                    <div class="font-semibold">
                      {{ entry.userName }}
                      @if (entry.userId === auth.currentUser()?.id) {
                        <span class="text-xs text-violet-500 ml-1">(You)</span>
                      }
                    </div>
                    <div class="text-xs text-gray-400">{{ entry.matchesPlayed }} matches played</div>
                  </div>
                  <div class="text-xl font-bold text-violet-700">{{ entry.totalPoints }}</div>
                </div>
              }
              @if ((seasonLeaderboard.value()?.length ?? 0) === 0 && !seasonLeaderboard.isLoading()) {
                <div class="text-center py-12 text-gray-400">
                  <mat-icon class="text-5xl">emoji_events</mat-icon>
                  <p class="mt-2">No completed matches yet. Be ready!</p>
                </div>
              }
            </div>
          } @placeholder {
            <div class="flex justify-center p-8"><mat-spinner /></div>
          }
        </mat-tab>

        <!-- Match Leaderboard -->
        <mat-tab label="Match">
          <div class="mt-4 space-y-4">
            <mat-select [(ngModel)]="selectedMatchId" placeholder="Select a completed match">
              @for (match of completedMatches.value() ?? []; track match._id) {
                <mat-option [value]="match._id">
                  {{ match.team1 }} vs {{ match.team2 }} — {{ formatDate(match.scheduledAt) }}
                </mat-option>
              }
            </mat-select>

            @if (matchLeaderboard.isLoading()) {
              <div class="flex justify-center p-8"><mat-spinner diameter="40" /></div>
            }
            @for (entry of matchLeaderboard.value() ?? []; track entry.userId; let i = $index) {
              <div class="flex items-center gap-3 p-3 rounded-xl border"
                   [class.bg-violet-50]="entry.userId === auth.currentUser()?.id">
                <span class="w-8 text-center font-bold">{{ i + 1 }}</span>
                <mat-icon class="text-gray-400">person</mat-icon>
                <span class="flex-1 font-medium">{{ entry.userName }}</span>
                <span class="font-bold text-violet-700">{{ entry.totalPoints }}</span>
              </div>
            }
            @if (!selectedMatchId()) {
              <p class="text-center text-gray-400 py-8">Select a match above to see results.</p>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class LeaderboardComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly selectedMatchId = signal<string>('');

  readonly seasonLeaderboard = resource({
    loader: () => firstValueFrom(this.api.getSeasonLeaderboard()),
  });

  readonly completedMatches = resource({
    loader: async () => {
      const matches = await firstValueFrom(this.api.getMatches());
      return matches.filter((m) => m.status === 'completed');
    },
  });

  readonly matchLeaderboard = resource({
    loader: (): Promise<LeaderboardEntry[]> => {
      const id = this.selectedMatchId();
      return id ? firstValueFrom(this.api.getMatchLeaderboard(id)) : Promise.resolve([]);
    },
  });

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
