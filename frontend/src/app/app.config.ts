import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless change detection — Angular 18+ feature, works great with Signals
    provideZonelessChangeDetection(),

    // Router with route-to-input binding (pass route params as @Input signals)
    // and View Transitions API for smooth page animations
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // HttpClient with our JWT interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // Async animations (loads animation engine lazily)
    provideAnimationsAsync(),
  ],
};
