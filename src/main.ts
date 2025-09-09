// src/main.ts
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// ⬇️ Interceptor de auth
import { authInterceptor } from './app/core/auth/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // HttpClient + interceptor de autorización
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideRouter(routes),

    // i18n
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    // Inicializador opcional: registra idiomas disponibles
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () => {
        translate.addLangs(['es', 'en']);
        // El idioma activo lo ajustas con tu guard/servicio vía la URL :lang
      },
      deps: [TranslateService],
      multi: true,
    },
  ],
}).catch(console.error);
