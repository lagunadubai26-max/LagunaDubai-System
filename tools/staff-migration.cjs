/* Privileged, explicit migration. Credentials/backups only under ignored .private/. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const Core = require('../src/js/backup-core.js');
const PROJECT = 'lagunadubaicafe', API_KEY = 'AIzaSyAzRAXG-aUK-RqXcan2aQu5mPlc7REkvr0';
const base = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
const privateDir = path.join(__dirname, '../.private');
let oauth;
async function request(url, method = 'GET', body, privileged = true) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(privileged ? { Authorization: 'Bearer ' + oauth } : {}) }, body: body == null ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(method + ' ' + new URL(url).pathname + ': ' + res.status + ' ' + await res.text());
  const text = await res.text(); return text ? JSON.parse(text) : {};
}
async function init() {
  const auth = require(process.env.FIREBASE_CLI_AUTH_MODULE);
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI login required');
  oauth = (await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'])).access_token;
  await fs.mkdir(privateDir, { recursive: true, mode: 0o700 });
}
async function save(name, data) { await fs.writeFile(path.join(privateDir, name), JSON.stringify(data, null, 2), { mode: 0o600 }); }
async function list(collection) {
  const docs = []; let pageToken;
  do {
    const query = new URLSearchParams({ pageSize: '500', ...(pageToken ? { pageToken } : {}) });
    const result = await request(base + '/' + collection + '?' + query);
    docs.push(...(result.documents || [])); pageToken = result.nextPageToken;
  } while (pageToken);
  return docs;
}
async function authUsers() {
  const users = []; let nextPageToken;
  do {
    const query = new URLSearchParams({ maxResults: '1000', ...(nextPageToken ? { nextPageToken } : {}) });
    const result = await request('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT + '/accounts:batchGet?' + query);
    users.push(...(result.users || [])); nextPageToken = result.nextPageToken;
  } while (nextPageToken);
  return users;
}
async function snapshot(tag) {
  const startedAt = new Date().toISOString(), names = new Set(Core.COLLECTIONS);
  let pageToken;
  do {
    const result = await request(base + ':listCollectionIds', 'POST', { pageSize: 1000, ...(pageToken ? { pageToken } : {}) });
    (result.collectionIds || []).forEach(n => names.add(n)); pageToken = result.nextPageToken;
  } while (pageToken);
  const collections = {};
  for (const name of names) collections[name] = (await list(name)).map(d => ({ id: d.name.split('/').pop(), fields: d.fields || {} }));
  const backup = await Core.create({ projectId: PROJECT, startedAt, completedAt: new Date().toISOString(), collections });
  const file = 'backup-' + tag + '.json'; await save(file, backup);
  await save('auth-backup-' + tag + '.json', await authUsers());
  console.log('Verified backup saved:', path.join(privateDir, file), await Core.validate(backup));
  console.log('Collection counts:', Object.fromEntries(Object.entries(collections).map(([k, v]) => [k, v.length])));
  return backup;
}
function numeric(length) { return String(crypto.randomInt(1, 10)) + Array.from({ length: length - 1 }, () => crypto.randomInt(10)).join(''); }
async function provision() {
  const config = 'https://identitytoolkit.googleapis.com/admin/v2/projects/' + PROJECT + '/config';
  await request(config + '?updateMask=signIn.email.enabled,signIn.email.passwordRequired', 'PATCH', { signIn: { email: { enabled: true, passwordRequired: true } } });
  let accounts;
  try { accounts = JSON.parse(await fs.readFile(path.join(privateDir, 'staff-accounts.json'), 'utf8')); }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const definitions = [['الكاشير الصباحي', 'Cashier', 'morning'], ['الكاشير المسائي', 'Cashier', 'evening'], ['المدير العام', 'Administrator', ''], ['صاحب الكافيه', 'Owner', '']];
    const used = new Set();
    accounts = definitions.map(([name, role, shiftType]) => { let username; do { username = numeric(8); } while (used.has(username)); used.add(username); return { name, role, shiftType, username, password: numeric(16) }; });
    await save('staff-accounts.json', accounts);
  }
  for (const a of accounts) {
    const email = a.username + '@staff.lagunadubaicafe.invalid';
    if (!a.uid) {
      const result = await request('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + API_KEY, 'POST', { email, password: a.password, returnSecureToken: true }, false);
      a.uid = result.localId; await save('staff-accounts.json', accounts);
    }
    const profile = { id: a.uid, uid: a.uid, userId: a.uid, username: a.username, name: a.name, role: a.role, shiftType: a.shiftType, enabled: true };
    for (const col of ['users', 'user_mappings']) await request(base + '/' + col + '/' + a.uid, 'PATCH', { fields: Core.fields(profile) });
    const login = await request('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API_KEY, 'POST', { email, password: a.password, returnSecureToken: true }, false);
    if (login.localId !== a.uid) throw new Error('Account verification mismatch');
    console.log('Created and login-verified:', a.name);
  }
}
async function commits(writes) {
  for (let i = 0; i < writes.length; i += 300) await request(base + ':commit', 'POST', { writes: writes.slice(i, i + 300) });
}
async function reset() {
  const accounts = JSON.parse(await fs.readFile(path.join(privateDir, 'staff-accounts.json'), 'utf8'));
  if (accounts.length !== 4 || accounts.some(a => !a.uid)) throw new Error('Four verified accounts required');
  await request(base + '/meta/security', 'PATCH', { fields: Core.fields({ maintenance: true }) });
  const backup = await snapshot('before-reset-' + Date.now());
  const cleared = ['invoices', 'returns', 'shifts', 'shift_state', 'daycloses', 'expenses', 'incomes', 'employees', 'attendance', 'advances', 'salary_payments', 'inventory', 'inventory_counts', 'equipment', 'audit_logs', 'customer_orders', 'guest_limits', 'invoice_payments', 'clock_probes'];
  for (const col of cleared) {
    await commits((await list(col)).map(d => ({ delete: d.name })));
    if ((await list(col)).length) throw new Error('Collection not empty: ' + col);
    console.log('Cleared:', col);
  }
  const ids = new Set(accounts.map(a => a.uid));
  for (const col of ['users', 'user_mappings']) await commits((await list(col)).filter(d => !ids.has(d.name.split('/').pop())).map(d => ({ delete: d.name })));
  const oldAuth = (await authUsers()).filter(a => !ids.has(a.localId));
  for (let i = 0; i < oldAuth.length; i += 500) await request('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT + '/accounts:batchDelete', 'POST', { localIds: oldAuth.slice(i, i + 500).map(a => a.localId), force: true });
  for (const d of await list('customers')) await request(base + '/customers/' + d.name.split('/').pop() + '?updateMask.fieldPaths=visits&updateMask.fieldPaths=totalSpent&updateMask.fieldPaths=lastVisit', 'PATCH', { fields: Core.fields({ visits: 0, totalSpent: 0, lastVisit: null }) });
  for (const d of await list('tables_')) await request(base + '/tables_/' + d.name.split('/').pop() + '?updateMask.fieldPaths=status&updateMask.fieldPaths=currentOrder', 'PATCH', { fields: Core.fields({ status: 'available', currentOrder: null }) });
  await request(base + '/shift_state/current', 'PATCH', { fields: Core.fields({ openShiftId: null, updatedAt: new Date().toISOString() }) });
  const versions = Object.fromEntries(['products', 'categories', 'customers', 'settings', 'users', 'employees'].map(k => [k, Date.now()]));
  await request(base + '/meta/versions', 'PATCH', { fields: Core.fields({ versions }) });
  for (const col of ['products', 'categories', 'settings', 'customers', 'tables_']) {
    const count = (await list(col)).length;
    if (count !== backup.payload.collections[col].length) throw new Error('Preserved collection count changed: ' + col);
    if (['products', 'categories', 'settings'].includes(col)) {
      const current = (await list(col)).map(d => ({ id: d.name.split('/').pop(), fields: d.fields || {} }));
      if (await Core.digest(current) !== await Core.digest(backup.payload.collections[col])) throw new Error('Preserved collection content changed: ' + col);
    }
    console.log('Preserved:', col, count);
  }
  if ((await authUsers()).filter(a => a.email).length !== 4) throw new Error('Unexpected registered accounts');
  await request(base + '/meta/security', 'PATCH', { fields: Core.fields({ maintenance: false }) });
  console.log('Reset complete. Four accounts only; historical operational data empty.');
}
(async () => {
  await init();
  const action = process.argv[2];
  if (action === '--backup') await snapshot('before-accounts-' + Date.now());
  else if (action === '--provision') await provision();
  else if (action === '--reset') await reset();
  else throw new Error('Use --backup, --provision or --reset');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
