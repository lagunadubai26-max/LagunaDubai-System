#!/usr/bin/env node
// Deliberately targets only a loopback Firestore emulator, never production.
const fs = require('node:fs/promises');
const { validate, digest, COLLECTIONS } = require('../src/js/backup-core.js');
function rewrite(value, source, target) {
  if (Array.isArray(value)) return value.map(v => rewrite(v, source, target));
  if (!value || typeof value !== 'object') return value;
  const output = Object.create(null);
  for (const [key, data] of Object.entries(value)) {
    output[key] = key === 'referenceValue' && typeof data === 'string'
      ? data.replace('projects/' + source + '/databases/', 'projects/' + target + '/databases/')
      : rewrite(data, source, target);
  }
  return output;
}
function normalize(fields) {
  const output = Object.create(null);
  for (const [key, value] of Object.entries(fields || {})) {
    if ('mapValue' in value) output[key] = { mapValue: { fields: normalize(value.mapValue.fields || {}) } };
    else if ('arrayValue' in value) output[key] = { arrayValue: { values: (value.arrayValue.values || []).map(v => normalize({ v }).v) } };
    else if ('timestampValue' in value) {
      const match = value.timestampValue.match(/^(.*?)(?:\.(\d+))?Z$/);
      output[key] = { timestampValue: match ? match[1] + '.' + (match[2] || '').padEnd(9, '0') + 'Z' : value.timestampValue };
    } else output[key] = value;
  }
  return output;
}
async function restore(backup, origin = 'http://127.0.0.1:8080', project = 'demo-laguna-restore') {
  const info = await validate(backup), url = new URL(origin);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Restore target must be a local HTTP emulator');
  if (!/^demo-[a-z0-9-]+$/.test(project)) throw new Error('Restore project must start with demo-');
  const base = url.origin + '/v1/projects/' + project + '/databases/(default)/documents';
  async function request(endpoint, options = {}) {
    const response = await fetch(endpoint, { ...options, redirect: 'error', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Emulator error ' + response.status + ': ' + await response.text());
    return response.json();
  }
  // No overwrites, even of prior test data. Use a fresh demo project per run.
  for (const name of Object.keys(backup.payload.collections)) {
    const existing = await request(base + '/' + name + '?pageSize=1');
    if ((existing.documents || []).length) throw new Error('Test database is not empty: ' + name);
  }
  let restored = 0;
  for (const name of Object.keys(backup.payload.collections)) {
    for (const doc of backup.payload.collections[name]) {
      const fields = rewrite(doc.fields, backup.payload.projectId, project);
      const endpoint = base + '/' + name + '/' + encodeURIComponent(doc.id);
      await request(endpoint, { method: 'PATCH', body: JSON.stringify({ fields }) });
      const readback = await request(endpoint);
      if (await digest(normalize(readback.fields)) !== await digest(normalize(fields))) {
        const different = [];
        for (const key of new Set([...Object.keys(fields), ...Object.keys(readback.fields || {})])) {
          if (!(key in fields) || !(key in (readback.fields || {}))) { different.push(key); continue; }
          if (await digest(normalize({ [key]: readback.fields[key] })) !== await digest(normalize({ [key]: fields[key] }))) different.push(key);
        }
        throw new Error('Read-back mismatch: ' + name + '/' + doc.id + ' (' + different.join(', ') + ')');
      }
      restored++;
    }
  }
  return { ...info, restored, project };
}
async function main() {
  const args = process.argv.slice(2), file = args[0];
  if (!file) throw new Error('Usage: node tools/restore-backup.cjs backup.json [--restore --emulator http://127.0.0.1:8080 --project demo-laguna-test]');
  const backup = JSON.parse(await fs.readFile(file, 'utf8'));
  console.log('Validated backup:', await validate(backup));
  if (!args.includes('--restore')) { console.log('Validation only. No database writes.'); return; }
  const option = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
  console.log('Restore/read-back verification:', await restore(backup, option('--emulator', 'http://127.0.0.1:8080'), option('--project', 'demo-laguna-restore')));
}
module.exports = { restore, normalize, rewrite };
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
