const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../src');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [username, role, shiftType] of [['12345678', 'Cashier', 'morning'], ['22345678', 'Cashier', 'evening'], ['32345678', 'Administrator', ''], ['42345678', 'Owner', '']]) {
      const context = await browser.newContext();
      await context.addInitScript(({ username, role, shiftType }) => {
        const profile = { id: 'uid-' + username, uid: 'uid-' + username, name: role, username, role, shiftType, enabled: true };
        window.firebase = { auth: Object.assign(() => ({
          setPersistence: async () => {}, signOut: async () => sessionStorage.removeItem('test-backend-login'),
          signInWithEmailAndPassword: async (email, password) => {
            if (email !== username + '@staff.lagunadubaicafe.invalid' || password !== '1234567890123456') throw new Error('invalid');
            sessionStorage.setItem('test-backend-login', profile.uid); return { user: { uid: profile.uid } };
          }
        }), { Auth: { Persistence: { SESSION: 'session' } } }) };
        window.FB = { initializeAuth: async () => {}, clearCache: () => {}, requireStaff: async () => {
          if (sessionStorage.getItem('test-backend-login') !== profile.uid) throw new Error('login required');
          return profile;
        } };
        window.DB = { audit: { log: async () => {} } };
      }, { username, role, shiftType });
      await context.route('**/*', route => {
        const url = new URL(route.request().url()), rel = url.pathname.slice(1);
        if (url.hostname !== 'staff.test' || (rel.startsWith('js/') && !['role-head.js', 'role.js', 'auth.js'].includes(path.basename(rel)))) return route.fulfill({ body: '', contentType: 'text/javascript' });
        const file = path.join(root, rel);
        if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        return route.fulfill({ body: fs.readFileSync(file), contentType: rel.endsWith('.js') ? 'text/javascript' : rel.endsWith('.css') ? 'text/css' : 'text/html' });
      });
      const p = await context.newPage();
      await p.goto('https://staff.test/auth.html');
      const arabicDigits = value => value.replace(/\d/g, n => String.fromCharCode(1632 + Number(n)));
      await p.locator('#username').fill(shiftType === 'morning' ? arabicDigits(username) : username);
      await p.locator('#password').fill(shiftType === 'morning' ? arabicDigits('1234567890123456') : '1234567890123456'); await p.locator('#loginBtn').click();
      await p.waitForURL(role === 'Cashier' ? '**/menu.html' : '**/index.html');
      assert.equal(await p.evaluate(() => JSON.parse(sessionStorage.getItem('laguna_user')).role), role);
      if (role === 'Cashier') {
        const links = await p.locator('.sidebar nav a').evaluateAll(els => els.filter(el => getComputedStyle(el).display !== 'none').map(el => el.getAttribute('href')));
        assert(links.every(link => ['menu.html', 'invoices.html'].includes(link)));
        await p.goto('https://staff.test/reports.html'); await p.waitForURL('**/menu.html');
        // A forged UI role is replaced by the verified backend identity.
        await p.evaluate(() => { const user = JSON.parse(sessionStorage.getItem('laguna_user')); user.role = 'Owner'; sessionStorage.setItem('laguna_user', JSON.stringify(user)); });
        await p.goto('https://staff.test/settings.html'); await p.waitForURL('**/menu.html');
      } else { await p.goto('https://staff.test/settings.html'); assert(p.url().endsWith('/settings.html')); }
      console.log('PASS numeric login and verified page permissions:', role, shiftType);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
