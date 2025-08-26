// tools/postbuild-ghp.cjs
// Post-proceso para publicar Angular 19 (SSR/Prerender) en GitHub Pages
// - Renombra index.csr.html -> index.html en /es y /en
// - Soporta el caso index.es.html / index.en.html (los mueve a /es|/en/index.html)
// - Crea index.html y 404.html raíz que redirigen a /<repo>/es/
// - Crea .nojekyll para evitar el procesamiento de Jekyll

const fs = require('fs');
const path = require('path');

const log = (...a) => console.log('➜', ...a);
const err = (...a) => console.error('✖', ...a);

function ensureLeadingSlash(s) {
  if (!s) return '/';
  return s.startsWith('/') ? s : `/${s}`;
}
function ensureNoTrailingSlash(s) {
  if (!s || s === '/') return '/';
  return s.endsWith('/') ? s.slice(0, -1) : s;
}
function writeFile(fp, content) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, 'utf8');
}
function exists(fp) {
  try { fs.accessSync(fp); return true; } catch { return false; }
}

// 1) Descubrir la carpeta de salida desde angular.json (fallback a dist/alquimia-dental)
let project, outputPath;
try {
  const angular = JSON.parse(fs.readFileSync(path.resolve('angular.json'), 'utf8'));
  project = angular.defaultProject || Object.keys(angular.projects)[0];
  outputPath =
    angular.projects?.[project]?.architect?.build?.options?.outputPath ||
    'dist/alquimia-dental';
} catch {
  outputPath = 'dist/alquimia-dental';
}
const browserDir = path.join(outputPath, 'browser');

if (!exists(browserDir)) {
  err(`No se encontró la carpeta de build: ${browserDir}. Ejecuta primero "ng build".`);
  process.exit(1);
}

log(`Usando carpeta de publicación: ${browserDir}`);

// 2) Renombrar index.csr.html -> index.html en /es y /en
['es', 'en'].forEach((lang) => {
  const csr = path.join(browserDir, lang, 'index.csr.html');
  const idx = path.join(browserDir, lang, 'index.html');
  if (exists(csr)) {
    fs.renameSync(csr, idx);
    log(`Renombrado: ${path.relative(process.cwd(), csr)} -> ${path.relative(process.cwd(), idx)}`);
  }
});

// 2b) Caso alterno: index.es.html / index.en.html en el root del browser
[
  { from: 'index.es.html', toDir: 'es' },
  { from: 'index.en.html', toDir: 'en' },
].forEach(({ from, toDir }) => {
  const src = path.join(browserDir, from);
  const destDir = path.join(browserDir, toDir);
  const dest = path.join(destDir, 'index.html');
  if (exists(src)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(src, dest);
    log(`Movido: ${from} -> ${path.join(toDir, 'index.html')}`);
  }
});

// 3) Crear index.html y 404.html raíz con redirect absoluto a /<repo>/es/
const PUBLIC_BASE = ensureNoTrailingSlash(ensureLeadingSlash(process.env.PUBLIC_BASE || '/AlquimiaDental'));
const landing = `${PUBLIC_BASE}/es/`;

const rootIndex = `<!doctype html>
<html lang="es"><head>
  <meta charset="utf-8">
  <title>Alquimia Dental</title>
  <meta http-equiv="refresh" content="0; url=${landing}">
  <script>location.replace(${JSON.stringify(landing)});</script>
</head><body>
  Redirigiendo a <a href="${landing}">${landing}</a>…
</body></html>
`;

const root404 = `<!doctype html>
<meta charset="utf-8">
<title>Alquimia Dental</title>
<script>
(function () {
  var base = ${JSON.stringify(PUBLIC_BASE)};
  var p = location.pathname || "";
  if (!p.startsWith(base)) { location.replace(base + "/es/"); return; }

  var segs = p.slice(base.length).split("/").filter(Boolean);
  var i = 0, last = null;
  while (i < segs.length && (segs[i] === "es" || segs[i] === "en")) { last = segs[i]; i++; }
  var lang = last || "es";
  location.replace(base + "/" + lang + "/");
})();
</script>`;

writeFile(path.join(browserDir, 'index.html'), rootIndex);
writeFile(path.join(browserDir, '404.html'), root404);

// 4) .nojekyll para que GitHub Pages no procese Jekyll
writeFile(path.join(browserDir, '.nojekyll'), '');

log('Postbuild listo. Ahora puedes ejecutar: npx ngh --dir=' + JSON.stringify(browserDir));
