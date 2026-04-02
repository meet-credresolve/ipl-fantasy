import { Injectable, signal, effect } from '@angular/core';

const THEME_KEY = 'ipl_theme';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Apply theme to DOM and persist whenever it changes
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.style.colorScheme = t;
      localStorage.setItem(THEME_KEY, t);
    });
  }

  toggle() {
    this.theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }
}
