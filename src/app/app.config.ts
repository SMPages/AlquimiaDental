// src/app/app.config.ts
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// 👇 nuestro interceptor
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // HttpClient + Auth Interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // ngx-translate v17
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    // registrar idiomas en el bootstrap
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (t: TranslateService) => () => {
        t.addLangs(['es', 'en']);
        t.setDefaultLang('es');
      },
      deps: [TranslateService],
    },
  ],
};
