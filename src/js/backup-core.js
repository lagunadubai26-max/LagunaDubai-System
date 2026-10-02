/* Portable Firestore JSON format; shared with the isolated restore utility. */
(function (root) {
  'use strict';
  const LEGACY_COLLECTIONS = ['users', 'user_mappings', 'settings', 'employees', 'customers', 'products', 'categories', 'expenses', 'incomes', 'equipment', 'advances', 'salary_payments', 'invoices', 'attendance', 'tables_', 'inventory', 'inventory_counts', 'returns', 'shifts', 'shift_state', 'daycloses', 'audit_logs', 'meta'];
  const COLLECTIONS = LEGACY_COLLECTIONS.concat(['customer_orders', 'guest_limits', 'invoice_payments', 'clock_probes']);
  function encode(value) {
    if (value === null) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') return Number.isSafeInteger(value) ? { integerValue: String(value) } : { doubleValue: Number.isFinite(value) ? value : String(value) };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    if (value && typeof value.toDate === 'function' && typeof value.nanoseconds === 'number') {
      const date = new Date(value.seconds * 1000).toISOString().slice(0, 19);
      return { timestampValue: date + '.' + String(value.nanoseconds).padStart(9, '0') + 'Z' };
    }
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (value && typeof value.toBase64 === 'function') return { bytesValue: value.toBase64() };
    if (value && typeof value.latitude === 'number' && typeof value.longitude === 'number' && typeof value.isEqual === 'function') return { geoPointValue: { latitude: value.latitude, longitude: value.longitude } };
    if (value && typeof value.path === 'string' && value.firestore) {
      return { referenceValue: 'projects/' + value.firestore.app.options.projectId + '/databases/(default)/documents/' + value.path };
    }
    if (value && Object.getPrototypeOf(value) === Object.prototype) return { mapValue: { fields: fields(value) } };
    throw new Error('نوع بيانات غير مدعوم في النسخة الاحتياطية');
  }
  function fields(data) {
    const result = Object.create(null);
    Object.keys(data).forEach(key => { result[key] = encode(data[key]); });
    return result;
  }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value);
  }
  async function digest(payload) {
    const bytes = new TextEncoder().encode(canonical(payload));
    return Array.from(new Uint8Array(await root.crypto.subtle.digest('SHA-256', bytes))).map(n => n.toString(16).padStart(2, '0')).join('');
  }
  function validValue(value, depth = 0) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 64 || Object.keys(value).length !== 1) throw new Error('قيمة Firestore غير صالحة');
    const type = Object.keys(value)[0], data = value[type];
    switch (type) {
      case 'nullValue': if (data !== null) throw new Error('null غير صالح'); break;
      case 'stringValue': case 'bytesValue': if (typeof data !== 'string') throw new Error('نص غير صالح'); break;
      case 'booleanValue': if (typeof data !== 'boolean') throw new Error('قيمة منطقية غير صالحة'); break;
      case 'integerValue': if (typeof data !== 'string' || !/^-?\d+$/.test(data)) throw new Error('عدد غير صالح'); break;
      case 'doubleValue': if (!(typeof data === 'number' && Number.isFinite(data)) && !['NaN', 'Infinity', '-Infinity'].includes(data)) throw new Error('عدد غير صالح'); break;
      case 'timestampValue': if (typeof data !== 'string' || !Number.isFinite(Date.parse(data))) throw new Error('توقيت غير صالح'); break;
      case 'referenceValue': if (typeof data !== 'string' || !/^projects\/[^/]+\/databases\/[^/]+\/documents\/.+/.test(data)) throw new Error('مرجع غير صالح'); break;
      case 'geoPointValue': if (!data || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude) || Math.abs(data.latitude) > 90 || Math.abs(data.longitude) > 180) throw new Error('إحداثيات غير صالحة'); break;
      case 'arrayValue': if (!data || (data.values !== undefined && !Array.isArray(data.values))) throw new Error('قائمة غير صالحة'); (data.values || []).forEach(v => validValue(v, depth + 1)); break;
      case 'mapValue': if (!data || typeof data !== 'object') throw new Error('حقول غير صالحة'); checkFields(data.fields || {}, depth + 1); break;
      default: throw new Error('نوع Firestore غير معروف');
    }
  }
  function checkFields(data, depth = 0) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('حقول غير صالحة');
    Object.values(data).forEach(v => validValue(v, depth));
  }
  async function validate(backup) {
    if (!backup || backup.format !== 'laguna-firestore-backup' || ![1, 2].includes(backup.version)) throw new Error('الملف ليس نسخة Laguna مدعومة');
    const p = backup.payload;
    if (!p || !/^[a-z][a-z0-9-]{3,62}$/.test(p.projectId || '') || !Number.isFinite(Date.parse(p.completedAt)) || !p.collections || typeof p.collections !== 'object' || Array.isArray(p.collections)) throw new Error('بيانات النسخة غير مكتملة');
    const names = Object.keys(p.collections);
    const required = backup.version === 1 ? LEGACY_COLLECTIONS : COLLECTIONS;
    if (!required.every(name => names.includes(name)) || names.some(name => !/^[a-zA-Z0-9_-]+$/.test(name))) throw new Error('النسخة لا تحتوي كل المجموعات المطلوبة');
    let total = 0;
    for (const name of names) {
      const docs = p.collections[name], ids = new Set();
      if (!Array.isArray(docs)) throw new Error('مجموعة غير صالحة: ' + name);
      for (const doc of docs) {
        if (!doc || typeof doc.id !== 'string' || !doc.id || doc.id.includes('/') || ['.', '..'].includes(doc.id) || /^__.*__$/.test(doc.id) || ids.has(doc.id)) throw new Error('معرف مستند غير صالح أو مكرر: ' + name);
        ids.add(doc.id); checkFields(doc.fields); total++;
      }
    }
    if (backup.sha256 !== await digest(p)) throw new Error('الملف تغير أو تالف: بصمة SHA-256 غير مطابقة');
    return { total, collections: names.length, projectId: p.projectId, completedAt: p.completedAt };
  }
  async function create(payload) {
    const backup = { format: 'laguna-firestore-backup', version: 2, payload, sha256: await digest(payload) };
    await validate(backup); return backup;
  }
  function due(lastDownload, now = Date.now(), days = 7) {
    const time = Date.parse(lastDownload || '');
    return !Number.isFinite(time) || now - time >= days * 86400000;
  }
  const api = { COLLECTIONS, encode, fields, digest, create, validate, due };
  root.BackupCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
