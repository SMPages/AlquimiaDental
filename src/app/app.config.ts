import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // ngx-translate v17
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    // opcional: registrar idiomas al bootstrap
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (t: TranslateService) => () => {
        t.addLangs(['es', 'en']);
        t.setDefaultLang('es'); // el lang activo lo decide la URL/guards
      },
      deps: [TranslateService]
    }
  ]
};
