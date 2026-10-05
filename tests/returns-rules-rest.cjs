// Built-in Node APIs only; run through Firestore emulators:exec.
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { fields } = require('../src/js/backup-core.js');
(async () => {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) throw new Error('Local emulator required');
  const project = 'demo-laguna-returns', origin = 'http://' + host;
  const base = origin + '/v1/projects/' + project + '/databases/(default)/documents';
  async function call(url, method, body, token = 'owner') {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body == null ? undefined : JSON.stringify(body) });
    return { status: response.status, text: await response.text() };
  }
  const rules = await fs.readFile(path.join(__dirname, '../firestore.rules'), 'utf8');
  assert.equal((await call(origin + '/emulator/v1/projects/' + project + ':securityRules', 'PUT', { rules: { files: [{ name: 'firestore.rules', content: rules }] } })).status, 200);
  function token(uid) {
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    return encode({ alg: 'none', typ: 'JWT' }) + '.' + encode({ iss: 'https://securetoken.google.com/' + project, aud: project, sub: uid, user_id: uid, iat: now, exp: now + 3600, auth_time: now, firebase: { sign_in_provider: 'password' } }) + '.';
  }
  for (const [uid, role] of [['cashier', 'Cashier'], ['manager', 'Administrator'], ['owner-staff', 'Owner']]) {
    assert.equal((await call(base + '/user_mappings/' + uid, 'PATCH', { fields: fields({ name: uid, enabled: true, role, shiftType: 'morning' }) })).status, 200);
  }
  const invoice = { id: 'test', items: [{ name: 'قهوة', qty: 1, price: 30 }], total: 30, paid: 30, remaining: 0, status: 'paid', createdByUid: 'cashier', shiftId: 'test-shift' };
  assert.equal((await call(base + '/invoices/test', 'PATCH', { fields: fields(invoice) })).status, 200);
  const patchInvoice = (uid, status) => call(base + '/invoices/test?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedByUid', 'PATCH', { fields: fields({ status, updatedByUid: uid }) }, token(uid));
  assert.equal((await patchInvoice('cashier', 'returned')).status, 403);
  assert.equal((await patchInvoice('manager', 'returned')).status, 200);
  assert.equal((await call(base + '/invoices/test?updateMask.fieldPaths=printed&updateMask.fieldPaths=updatedByUid', 'PATCH', { fields: fields({ printed: true, updatedByUid: 'cashier' }) }, token('cashier'))).status, 200);
  assert.equal((await patchInvoice('owner-staff', 'paid')).status, 200);
  const refund = { invoice: 'test', amount: 30, status: 'pending' };
  assert.equal((await call(base + '/returns/cashier', 'PATCH', { fields: fields(refund) }, token('cashier'))).status, 403);
  assert.equal((await call(base + '/returns/manager', 'PATCH', { fields: fields(refund) }, token('manager'))).status, 200);
  assert.equal((await call(base + '/returns/manager?updateMask.fieldPaths=status', 'PATCH', { fields: fields({ status: 'success' }) }, token('cashier'))).status, 403);
  assert.equal((await call(base + '/returns/manager', 'DELETE', null, token('cashier'))).status, 403);
  assert.equal((await call(base + '/returns/manager', 'DELETE', null, token('owner-staff'))).status, 200);
  console.log('PASS actual rules: cashier cannot return invoice or create/change/delete refund; printing preserved; manager/Owner returns allowed');
  const documentName = suffix => 'projects/' + project + '/databases/(default)/documents/' + suffix;
  const write = (suffix, data, mask) => ({ update: { name: documentName(suffix), fields: fields(data) }, ...(mask ? { updateMask: { fieldPaths: Object.keys(data) } } : {}) });
  const commit = (writes, uid) => call(base + ':commit', 'POST', { writes }, token(uid));
  await call(base + '/user_mappings/evening', 'PATCH', { fields: fields({ name: 'evening', enabled: true, role: 'Cashier', shiftType: 'evening' }) });
  const shift = { id: 'evening-first', openedBy: 'evening', openedByUid: 'evening', shiftType: 'evening', closedAt: null, invoiceVersion: 0, expenseTotal: 0, incomeTotal: 0 };
  const firstEvening = await commit([write('shifts/evening-first', shift), write('shift_state/current', { openShiftId: 'evening-first' })], 'evening');
  assert.equal(firstEvening.status, 200, firstEvening.text);
  console.log('PASS evening cashier opens evening first without a morning shift');
  await call(base + '/shifts/test-shift', 'PATCH', { fields: fields({ ...shift, id: 'test-shift', shiftType: 'morning', openedBy: 'cashier', openedByUid: 'cashier' }) });
  const ids = ['source1', 'source2', 'source3', 'source4', 'source5'];
  for (const id of ids) await call(base + '/invoices/' + id, 'PATCH', { fields: fields({ ...invoice, id, shiftType: 'morning' }) });
  const merged = { ...invoice, id: 'merged', total: 150, paid: 150, items: [{ name: 'قهوة', qty: 5, price: 30 }], mergedIds: ids, shiftType: 'morning', createdBy: 'cashier' };
  function mergeWrites(corrupt) {
    return [write('invoices/merged', merged), ...ids.map((id, index) => write('invoices/' + id, { status: 'merged', mergedInto: 'merged', updatedByUid: 'cashier', ...(corrupt && index === 0 ? { total: 31 } : {}) }, true)), write('shifts/test-shift', { invoiceVersion: 1 }, true)];
  }
  assert.equal((await commit(mergeWrites(true), 'cashier')).status, 403);
  const result = await commit(mergeWrites(false), 'cashier');
  assert.equal(result.status, 200, result.text);
  console.log('PASS five-invoice cashier merge succeeds; changing source totals during merge is denied');
})().catch(e => { console.error(e); process.exitCode = 1; });
