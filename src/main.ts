// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// La configuración (router, traducciones, etc.) vive en app.config.ts
// y se comparte con el servidor (app.config.server.ts).
bootstrapApplication(AppComponent, appConfig).catch(console.error);
