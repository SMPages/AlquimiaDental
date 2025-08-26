// tools/postbuild-ghp.cjs
// Post-proceso para publicar Angular 19 (i18n + CSR/SSR) en GitHub Pages
// - Renombra index.csr.html -> index.html dentro de /es y /en
// - Soporta index.es.html / index.en.html en /browser (los mueve a /es|/en/index.html)
// - Crea index.html raíz que redirige a /<repo>/es/
// - Crea 404.html raíz que normaliza /<repo>/<lang>/<lang>/... -> /<repo>/<lang>/... (conserva el resto de la ruta)
// - Crea .nojekyll para evitar Jekyll

const fs = require('fs');
const path = require('path');

const log = (...a) => console.log('➜', ...a);
const err = (...a) => console.error('✖', ...a);

const ensureLeadingSlash = (s) => (!s ? '/' : s.startsWith('/') ? s : `/${s}`);
const ensureNoTrailingSlash = (s) => (!s || s === '/' ? '/' : s.endsWith('/') ? s.slice(0, -1) : s);
const writeFile = (fp, content) => { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, content, 'utf8'); };
const exists = (fp) => { try { fs.accessSync(fp); return true; } catch { return false; } };

// 1) Descubrir carpeta de salida (fallback a dist/alquimia-dental)
let project, outputPath;
try {
  const angular = JSON.parse(fs.readFileSync(path.resolve('angular.json'), 'utf8'));
  project = angular.defaultProject || Object.keys(angular.projects)[0];
  outputPath = angular.projects?.[project]?.architect?.build?.options?.outputPath || 'dist/alquimia-dental';
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

// 2b) Caso alterno: index.es.html / index.en.html en el root de /browser
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

// 3) Archivos raíz (index.html + 404.html)
const PUBLIC_BASE = ensureNoTrailingSlash(ensureLeadingSlash(process.env.PUBLIC_BASE || '/AlquimiaDental'));
const landing = `${PUBLIC_BASE}/es/`;

const rootIndex = `<!doctype html>
<meta charset="utf-8">
<title>Alquimia Dental</title>
<meta http-equiv="refresh" content="0; url=${landing}">
<script>location.replace(${JSON.stringify(landing)});</script>
Redirigiendo a <a href="${landing}">${landing}</a>…
`;

// 404 que normaliza y CONSERVA el resto de la ruta
const root404 = `<!doctype html>
<meta charset="utf-8">
<title>Alquimia Dental</title>
<script>
(function () {
  var base = ${JSON.stringify(PUBLIC_BASE)};
  var p = location.pathname || "/";
  if (!p.startsWith(base)) { location.replace(base + "/es/"); return; }

  // /AlquimiaDental/es/en/opinions -> ["es","en","opinions"]
  var segs = p.slice(base.length).split("/").filter(Boolean);

  // Toma TODOS los prefijos 'es'|'en' consecutivos al inicio y usa el ÚLTIMO
  var i = 0, last = null;
  while (i < segs.length && (segs[i] === "es" || segs[i] === "en")) { last = segs[i]; i++; }
  var lang = last || "es";

  // Resto de la ruta sin prefijos repetidos
  var rest = segs.slice(i);

  // Construye destino normalizado y conserva path/query/hash
  var destPath = base + "/" + lang + (rest.length ? "/" + rest.join("/") : "") + "/";
  var search = location.search || "";
  var hash = location.hash || "";
  location.replace(destPath + search + hash);
})();
</script>`;

// Escribe index y 404
writeFile(path.join(browserDir, 'index.html'), rootIndex);
writeFile(path.join(browserDir, '404.html'), root404);

// 4) .nojekyll
writeFile(path.join(browserDir, '.nojekyll'), '');

log('Postbuild listo. Ahora publica con: npx ngh --dir=' + JSON.stringify(browserDir));
