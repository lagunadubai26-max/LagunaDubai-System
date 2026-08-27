const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

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

// ── Safari 9 CSS fixes ──
function fixSafari9Css(css) {
  // Replace CSS Grid with Flexbox
  css = css.replace(/display\s*:\s*grid/g, 'display: -webkit-flex; display: flex');
  css = css.replace(/grid-template-columns\s*:\s*([^;]+);/g, function(_, val) {
    // Convert grid columns to flex wrap
    return '-webkit-flex-wrap: wrap; flex-wrap: wrap;';
  });
  css = css.replace(/grid-template-rows\s*:\s*([^;]+);/g, '');
  css = css.replace(/grid-gap\s*:\s*([^;]+);/g, 'gap: $1;');
  css = css.replace(/gap\s*:\s*([^;]+);/g, 'gap: $1;');

  // Add -webkit- prefix to flex properties
  css = css.replace(/display\s*:\s*flex/g, 'display: -webkit-flex; display: flex');
  css = css.replace(/flex-direction\s*:\s*([^;]+);/g, 'display: -webkit-flex; display: flex; -webkit-flex-direction: $1; flex-direction: $1;');
  css = css.replace(/flex-wrap\s*:\s*([^;]+);/g, '-webkit-flex-wrap: $1; flex-wrap: $1;');
  css = css.replace(/justify-content\s*:\s*([^;]+);/g, '-webkit-justify-content: $1; justify-content: $1;');
  css = css.replace(/align-items\s*:\s*([^;]+);/g, '-webkit-align-items: $1; align-items: $1;');
  css = css.replace(/flex\s*:\s*(\d+)(\s+\d+\s+\d+px)?;/g, '-webkit-flex: $1$2; flex: $1$2;');

  return css;
}

// ── 2. Copy + resolve CSS ──
const cssFiles = ['style.css', 'menu.css', 'responsive.css'];
for (const file of cssFiles) {
  const src_path = path.join(SRC, 'css', file);
  if (!fs.existsSync(src_path)) continue;
  let css = fs.readFileSync(src_path, 'utf8');
  css = resolveVars(css);
  css = fixSafari9Css(css);
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
    fs.copyFileSync(src_path, path.join(LEGACY, 'js', file));
  }
}

// Copy polyfills
fs.copyFileSync(path.join(SRC, 'js/polyfills.js'), path.join(LEGACY, 'js/polyfills.js'));
console.log('  js/polyfills.js');

// ── 4. Copy images (WebP → JPG for Safari 9) ──
let convertedCount = 0;
async function copyImages(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const sp = path.join(srcDir, entry.name);
    const dp = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyImages(sp, dp);
      continue;
    }
    // Convert WebP to JPG
    if (entry.name.toLowerCase().endsWith('.webp')) {
      const jpgName = entry.name.replace(/\.webp$/i, '.jpg');
      const jpgPath = path.join(destDir, jpgName);
      try {
        await sharp(sp).jpeg({ quality: 85 }).toFile(jpgPath);
        convertedCount++;
      } catch (e) {
        console.error('  CONVERT FAIL: ' + entry.name);
        fs.copyFileSync(sp, dp);
      }
    } else {
      fs.copyFileSync(sp, dp);
    }
  }
}

// ── 5. Generate root menu.html (customer-facing, Safari 9) ──
function buildMenuHtml() {
  const menuSrc = fs.readFileSync(path.join(SRC, 'menu.html'), 'utf8');

  // Resolve CSS variables in inline styles
  let html = resolveVars(menuSrc);

  // Fix inline styles: replace grid with flex
  html = html.replace(/display\s*:\s*grid/g, 'display: -webkit-flex; display: flex');
  html = html.replace(/grid-template-columns\s*:\s*([^;"]+)/g, '-webkit-flex-wrap: wrap; flex-wrap: wrap');
  html = html.replace(/display\s*:\s*flex/g, 'display: -webkit-flex; display: flex');
  html = html.replace(/flex-direction\s*:\s*([^;"]+)/g, '-webkit-flex-direction: $1; flex-direction: $1');
  html = html.replace(/justify-content\s*:\s*([^;"]+)/g, '-webkit-justify-content: $1; justify-content: $1');
  html = html.replace(/align-items\s*:\s*([^;"]+)/g, '-webkit-align-items: $1; align-items: $1');
  html = html.replace(/gap\s*:\s*(\d+px)/g, 'gap: $1');

  // Change paths
  html = html.replace(/href="css\//g, 'href="legacy/css/');
  html = html.replace(/src="js\//g, 'src="legacy/js/');
  html = html.replace(/src="images\//g, 'src="legacy/images/');

  // Fix .webp references in HTML → .jpg
  html = html.replace(/\.webp"/g, '.jpg"');

  // Remove role-head.js AND role.js
  html = html.replace(/<script src="[^"]*role-head\.js[^"]*"><\/script>/, '');
  html = html.replace(/<script src="[^"]*role\.js[^"]*"><\/script>/, '');

  // Inject polyfills + Safari 9 CSS fixes
  const INJECT =
    '<script src="legacy/js/polyfills.js"></script>\n' +
    '<style>\n' +
    '  .sidebar, .sidebar-toggle, .sidebar-overlay { display: none !important; }\n' +
    '  .container { margin: 0 !important; padding: 0 !important; }\n' +
    '  .main { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 16px !important; }\n' +
    '  .menu-layout { display: -webkit-flex !important; display: flex !important; -webkit-flex-direction: column !important; flex-direction: column !important; }\n' +
    '  .order-box { position: static !important; width: 100% !important; max-width: 100% !important; margin-top: 16px !important; border-radius: 16px !important; }\n' +
    '  .products { display: -webkit-flex !important; display: flex !important; -webkit-flex-wrap: wrap !important; flex-wrap: wrap !important; gap: 12px !important; }\n' +
    '  .product-card { -webkit-flex: 0 0 calc(25% - 9px) !important; flex: 0 0 calc(25% - 9px) !important; min-width: 140px !important; }\n' +
    '</style>';

  html = html.replace(/<head([^>]*)>/i, '<head$1>\n' + INJECT);

  // Remove admin-only elements
  html = html.replace(/<div class="table-input"[\s\S]*?<\/div>\s*/m, '');
  html = html.replace(/<button id="autoPrintToggle"[\s\S]*?<\/button>\s*/m, '');

  return html;
}

// ── Run ──
(async () => {
  await copyImages(path.join(SRC, 'images'), path.join(LEGACY, 'images'));
  console.log('  images/ (converted ' + convertedCount + ' WebP → JPG)');

  const html = buildMenuHtml();
  fs.writeFileSync(path.join(ROOT, 'menu.html'), html);
  console.log('\n  menu.html (root) — customer-facing');

  console.log('\nDone!');
})();
