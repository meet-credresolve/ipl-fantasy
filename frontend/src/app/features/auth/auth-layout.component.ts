import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 to-orange-600 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="text-5xl mb-2">🏏</div>
          <h1 class="text-3xl font-bold text-white">IPL Fantasy 2026</h1>
          <p class="text-violet-200 mt-1">Private League</p>
        </div>
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
