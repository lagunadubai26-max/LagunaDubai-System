const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'src');
const LEGACY = path.join(__dirname, 'legacy');
const ROOT = __dirname;

// Clean + create output dirs
fs.rmSync(LEGACY, { recursive: true, force: true });
fs.mkdirSync(LEGACY, { recursive: true });
fs.mkdirSync(path.join(LEGACY, 'css'), { recursive: true });
fs.mkdirSync(path.join(LEGACY, 'js'), { recursive: true });

// ── 1. Extract CSS variables from :root ──
const styleSrc = fs.readFileSync(path.join(SRC, 'css/style.css'), 'utf8');
const rootMatch = styleSrc.match(/:root\s*\{([^}]+)\}/);
const vars = {};
if (rootMatch) {
  rootMatch[1].split(';').forEach(line => {
    const m = line.match(/--([\w-]+)\s*:\s*(.+)/);
    if (m) vars[m[1]] = m[2].trim();
  });
}
console.log('CSS variables:', Object.keys(vars).length);

function resolveVars(css) {
  return css.replace(/var\(--([\w-]+)\)/g, (_, name) => vars[name] || 'inherit');
}

// ── 2. Copy + resolve CSS ──
const cssFiles = ['style.css', 'menu.css', 'responsive.css'];
for (const file of cssFiles) {
  const src_path = path.join(SRC, 'css', file);
  if (!fs.existsSync(src_path)) continue;
  let css = fs.readFileSync(src_path, 'utf8');
  css = resolveVars(css);
  fs.writeFileSync(path.join(LEGACY, 'css', file), css);
  console.log('  css/' + file);
}

// ── 3. Transpile JS with Babel ──
const jsFiles = [
  'firebase-config.js', 'firebase-client.js', 'sanitize.js',
  'password-utils.js', 'data.js', 'notifications.js', 'printer.js',
  'template-engine.js', 'menu.js', 'daily-inventory-check.js',
  'role.js', 'role-head.js'
];

for (const file of jsFiles) {
  const src_path = path.join(SRC, 'js', file);
  if (!fs.existsSync(src_path)) { console.log('  SKIP ' + file); continue; }
  try {
    const out = execSync(`npx babel "${src_path}" --config-file "${path.join(ROOT, 'babel.config.json')}"`, {
      encoding: 'utf8', maxBuffer: 1024 * 1024
    });
    fs.writeFileSync(path.join(LEGACY, 'js', file), out);
    console.log('  js/' + file);
  } catch (e) {
    console.error('  FAIL ' + file + ': ' + e.message.split('\n')[0]);
    // Fallback: copy as-is
    fs.copyFileSync(src_path, path.join(LEGACY, 'js', file));
  }
}

// Copy polyfills
fs.copyFileSync(path.join(SRC, 'js/polyfills.js'), path.join(LEGACY, 'js/polyfills.js'));
console.log('  js/polyfills.js');

// ── 4. Copy images ──
try {
  const copyDir = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      const sp = path.join(s, e.name), dp = path.join(d, e.name);
      if (e.isDirectory()) copyDir(sp, dp); else fs.copyFileSync(sp, dp);
    }
  };
  copyDir(path.join(SRC, 'images'), path.join(LEGACY, 'images'));
  console.log('  images/');
} catch (e) { console.log('  no images/'); }

// ── 5. Generate root menu.html (customer-facing, Safari 9) ──
const menuSrc = fs.readFileSync(path.join(SRC, 'menu.html'), 'utf8');

// Resolve CSS variables in inline styles
let html = resolveVars(menuSrc);

// Change paths: css/ → legacy/css/, js/ → legacy/js/, images/ → legacy/images/
html = html.replace(/href="css\//g, 'href="legacy/css/');
html = html.replace(/src="js\//g, 'src="legacy/js/');
html = html.replace(/src="images\//g, 'src="legacy/images/');

// Remove role-head.js (admin only — handles session/role hiding)
html = html.replace(/<script src="[^"]*role-head\.js[^"]*"><\/script>/, '');

// Inject polyfills + sidebar-hiding CSS right after <head>
const INJECT =
  '<script src="legacy/js/polyfills.js"></script>\n' +
  '<style>\n' +
  '  .sidebar, .sidebar-toggle, .sidebar-overlay { display: none !important; }\n' +
  '  .container { margin: 0 !important; padding: 0 !important; }\n' +
  '  .main { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 16px !important; }\n' +
  '  .menu-layout { flex-direction: column !important; }\n' +
  '  .order-box { position: static !important; width: 100% !important; max-width: 100% !important; margin-top: 16px !important; border-radius: 16px !important; }\n' +
  '  .products { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; gap: 12px !important; }\n' +
  '</style>';

html = html.replace(/<head([^>]*)>/i, '<head$1>\n' + INJECT);

// Remove admin-only elements: auto print toggle, table input
html = html.replace(/<div class="table-input"[\s\S]*?<\/div>\s*/m, '');
html = html.replace(/<button id="autoPrintToggle"[\s\S]*?<\/button>\s*/m, '');

// Write root menu.html
fs.writeFileSync(path.join(ROOT, 'menu.html'), html);
console.log('\n  menu.html (root) — customer-facing');

console.log('\nDone!');
