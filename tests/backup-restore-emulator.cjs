// Invoke through firebase emulators:exec with tools/backup-emulator.json.
const assert = require('node:assert/strict');
const { COLLECTIONS, fields, create } = require('../src/js/backup-core.js');
const { restore } = require('../tools/restore-backup.cjs');
(async () => {
  const collections = Object.fromEntries(COLLECTIONS.map(name => [name, [{ id: 'fixture', fields: fields({ id: 'fixture', name: 'بيانات اختبار', amount: 125.5, empty: {}, list: [], enabled: true, nullable: null }) }]]));
  collections.invoices[0].fields = fields({ id: 'fixture', total: 250, items: [{ name: 'بيتزا — Medium', price: 125, qty: 2, menuType: 'restaurant' }], date: '2026-09-30T12:00:00', status: 'paid' });
  collections.shifts[0].fields = fields({ id: 'fixture', openedAt: '2026-09-20T12:00:00', closedAt: null, invoiceVersion: 1 });
  // Persisted Firestore timestamps have microsecond precision, not nanosecond.
  collections.settings[0].fields.timestamp = { timestampValue: '2026-09-30T12:00:00.123456000Z' };
  collections.settings[0].fields.bytes = { bytesValue: 'YWJj' };
  collections.settings[0].fields.point = { geoPointValue: { latitude: 30, longitude: 31 } };
  collections.settings[0].fields.reference = { referenceValue: 'projects/lagunadubaicafe/databases/(default)/documents/invoices/fixture' };
  const backup = await create({ projectId: 'lagunadubaicafe', startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), collections });
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) throw new Error('FIRESTORE_EMULATOR_HOST is required');
  const project = 'demo-laguna-restore-' + Date.now();
  const result = await restore(JSON.parse(JSON.stringify(backup)), 'http://' + host, project);
  assert.equal(result.restored, 23);
  await assert.rejects(restore(backup, 'http://' + host, project), /not empty/);
  console.log('PASS real Firestore emulator: 23 collections restored and read-back verified; typed values preserved; overwrite blocked');
})().catch(e => { console.error(e); process.exitCode = 1; });
