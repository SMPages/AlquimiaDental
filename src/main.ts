// src/main.ts
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),

    // ⬇️ Config v17: servicio + loader por providers
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/', // carpeta de JSONs
        suffix: '.json',          // extensión
      }),
    }),

    // (opcional) inicializador para registrar idiomas disponibles
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () => {
        translate.addLangs(['es', 'en']);
        // el .use(lang) lo manejas con tu servicio/guard via URL :lang
      },
      deps: [TranslateService],
      multi: true,
    },
  ],
}).catch(console.error);