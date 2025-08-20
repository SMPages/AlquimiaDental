import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

// 🌍 Configuración de idiomas soportados
const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';

/**
 * Middleware para redirigir a URL con idioma
 */
app.use((req, res, next) => {
  const url = req.url;

  // ✅ 1. Verificamos si la URL ya tiene prefijo de idioma
  const hasLangPrefix = SUPPORTED_LANGS.some(
    (lang) => url.startsWith(`/${lang}/`) || url === `/${lang}`
  );

  if (hasLangPrefix) {
    return next();
  }

  // ✅ 2. Detectamos idioma del navegador (Accept-Language)
  const acceptLang = req.headers['accept-language'] || '';
  const preferred = acceptLang.split(',')[0].split('-')[0]; // ej: "es-CO" → "es"

  const lang = SUPPORTED_LANGS.includes(preferred) ? preferred : DEFAULT_LANG;

  // ✅ 3. Redirigimos con prefijo de idioma
  return res.redirect(301, `/${lang}${url}`);
});

/**
 * Servir archivos estáticos desde /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  })
);

/**
 * Render con Angular Universal
 */
app.get('**', (req, res, next) => {
  const { originalUrl, baseUrl, headers } = req;

  // ⚡ Extraer idioma desde la URL (/es/... o /en/...)
  const langPrefix = SUPPORTED_LANGS.find((l) =>
    originalUrl.startsWith(`/${l}/`) || originalUrl === `/${l}`
  );

  const baseHref = langPrefix ? `/${langPrefix}` : `/${DEFAULT_LANG}`;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `http://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseHref }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Iniciar servidor
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`✅ Server corriendo en http://localhost:${port}`);
  });
}

export default app;
