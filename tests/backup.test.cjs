const test = require('node:test');
const assert = require('node:assert/strict');
const { COLLECTIONS, fields, encode, create, validate, due } = require('../src/js/backup-core.js');
const { restore, normalize, rewrite } = require('../tools/restore-backup.cjs');
function payload() {
  const collections = Object.fromEntries(COLLECTIONS.map(c => [c, []]));
  collections.invoices = [{ id: 'INV-1', fields: fields({ id: 'INV-1', items: [{ name: 'بيتزا', qty: 2, price: 125, variantKey: 'medium' }], total: 250, paid: 250, metadata: {}, nullable: null }) }];
  collections.shifts = [{ id: 's1', fields: fields({ id: 's1', openDate: '2026-09-20', closedAt: '2026-09-29T12:00:00', invoiceVersion: 3 }) }];
  return { projectId: 'lagunadubaicafe', startedAt: '2026-09-30T12:00:00Z', completedAt: '2026-09-30T12:01:00Z', collections };
}
test('JSON serialization preserves invoice and shift values with validated checksum', async () => {
  const backup = JSON.parse(JSON.stringify(await create(payload())));
  assert.equal((await validate(backup)).total, 2);
  assert.equal(backup.payload.collections.invoices[0].fields.total.integerValue, '250');
  assert.equal(backup.payload.collections.shifts[0].fields.invoiceVersion.integerValue, '3');
});
test('timestamps retain nanoseconds; geopoints, bytes and references keep their types', () => {
  assert.equal(encode({ seconds: 0, nanoseconds: 123456789, toDate() {} }).timestampValue, '1970-01-01T00:00:00.123456789Z');
  assert.equal(encode({ toBase64: () => 'YWJj' }).bytesValue, 'YWJj');
  assert.deepEqual(encode({ latitude: 30, longitude: 31, isEqual() {} }), { geoPointValue: { latitude: 30, longitude: 31 } });
  assert('mapValue' in encode({ latitude: 30, longitude: 31 }));
  const ref = encode({ path: 'invoices/INV-1', firestore: { app: { options: { projectId: 'lagunadubaicafe' } } } });
  assert.equal(rewrite(ref, 'lagunadubaicafe', 'demo-test').referenceValue, 'projects/demo-test/databases/(default)/documents/invoices/INV-1');
  assert.deepEqual(normalize({ at: { timestampValue: '2026-09-30T12:00:00Z' } }).at, { timestampValue: '2026-09-30T12:00:00.000000000Z' });
});
test('tampered, incomplete, duplicate and traversal documents are rejected', async () => {
  const changed = await create(payload()); changed.payload.collections.invoices[0].fields.total.integerValue = '1000';
  await assert.rejects(validate(changed), /SHA/);
  const partial = payload(); delete partial.collections.shifts;
  await assert.rejects(create(partial), /المجموعات/);
  const duplicate = payload(); duplicate.collections.invoices.push(duplicate.collections.invoices[0]);
  await assert.rejects(create(duplicate), /مكرر/);
  const traversal = payload(); traversal.collections.invoices[0].id = '../users';
  await assert.rejects(create(traversal), /معرف/);
  const malformed = payload(); malformed.collections.invoices[0].fields.total = { unexpected: 12 };
  await assert.rejects(create(malformed), /غير معروف/);
});
test('restore rejects production and nonlocal targets before any writes', async () => {
  const backup = await create(payload());
  await assert.rejects(restore(backup, 'https://firestore.googleapis.com', 'demo-test'), /local/);
  await assert.rejects(restore(backup, 'http://127.0.0.1:8080', 'lagunadubaicafe'), /demo-/);
  await assert.rejects(restore(backup, 'http://127.0.0.1:8080/path', 'demo-test'), /local/);
});
test('weekly reminder is due on first use and after seven days', () => {
  const now = Date.parse('2026-09-30T12:00:00Z');
  assert.equal(due(null, now), true); assert.equal(due('invalid', now), true);
  assert.equal(due('2026-09-24T12:00:00Z', now), false);
  assert.equal(due('2026-09-23T12:00:00Z', now), true);
});
