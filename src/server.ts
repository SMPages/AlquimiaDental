import { APP_BASE_HREF, isPlatformBrowser } from '@angular/common';
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

// 🌍 Idiomas
const SUPPORTED_LANGS = ['es', 'en'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];
const DEFAULT_LANG: Lang = 'es';

// Prefijos/archivos estáticos que NO se deben redirigir
const STATIC_PREFIXES = [
  '/assets/', '/icons/', '/favicon.ico', '/robots.txt', '/sitemap.xml',
  '/manifest.webmanifest', '/ngsw-worker.js', '/safety-worker.js',
  '/worker-basic.min.js'
];

/** Middleware: redireccionar a /<lang> SOLO si no es estático y no trae lang */
app.use((req, res, next) => {
  const { method } = req;
  // Deja pasar no-GET (POST a APIs, etc.)
  if (method !== 'GET') return next();

  // Normaliza y separa querystring
  const rawUrl = req.url || '/';
  const [pathOnly, qs = ''] = rawUrl.split('?');
  const url = pathOnly;

  // 1) Recursos estáticos: no tocar
  if (STATIC_PREFIXES.some(p => url === p || url.startsWith(p))) {
    return next();
  }

  // 2) Ya tiene prefijo de idioma
  const hasLang = SUPPORTED_LANGS.some(l => url === `/${l}` || url.startsWith(`/${l}/`));
  if (hasLang) return next();

  // 3) Detecta idioma por Accept-Language
  const accept = (req.headers['accept-language'] || '').toString().toLowerCase();
  const preferred = accept.split(',')[0]?.split('-')[0] || '';
  const lang: Lang = (SUPPORTED_LANGS as readonly string[]).includes(preferred) ? (preferred as Lang) : DEFAULT_LANG;

  // 4) Redirige preservando querystring
  const to = `/${lang}${url === '/' ? '' : url}${qs ? `?${qs}` : ''}`;
  return res.redirect(301, to);
});

/** Servir estáticos desde /browser */
app.use(express.static(browserDistFolder, {
  index: 'index.html',
  // Cache: fuerte para assets, suave para JSON/HTML
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    }
    if (/\.(html|json)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600');
    }
  }
}));

/** SSR con Angular Universal */
app.get('**', (req, res, next) => {
  const { originalUrl, headers } = req;

  // Detecta lang del path (/es, /en)
  const langPrefix = SUPPORTED_LANGS.find(l =>
    originalUrl === `/${l}` || originalUrl.startsWith(`/${l}/`)
  ) as Lang | undefined;

  const baseHref = `/${langPrefix ?? DEFAULT_LANG}`;

  commonEngine.render({
    bootstrap,
    documentFilePath: indexHtml,
    url: `http://${headers.host}${originalUrl}`,
    publicPath: browserDistFolder,
    providers: [{ provide: APP_BASE_HREF, useValue: baseHref }],
  })
  .then(html => res.send(html))
  .catch(err => next(err));
});

/** Arranque */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`✅ Server corriendo en http://localhost:${port}`);
  });
}

export default app;
