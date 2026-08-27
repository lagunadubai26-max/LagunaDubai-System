function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(str).replace(/[&<>"']/g, function (ch) {
    return map[ch];
  });
}
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  var allowedProto = ['http:', 'https:', 'data:'];
  try {
    var u = new URL(url, window.location.origin);
    if (allowedProto.includes(u.protocol)) return url;
  } catch (_) {}
  return '';
}
function validateNumber(val, fallback) {
  var n = Number(val);
  return !isNaN(n) && isFinite(n) ? n : fallback !== undefined ? fallback : 0;
}
function validateInt(val, fallback) {
  var n = parseInt(val, 10);
  return !isNaN(n) && isFinite(n) ? n : fallback !== undefined ? fallback : 0;
}
function validateStr(val, maxLen) {
  if (!val || typeof val !== 'string') return '';
  var s = val.trim();
  return maxLen ? s.slice(0, maxLen) : s;
}
function escapeEscPos(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}
function stripNonAscii(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[^\x20-\x7E]/g, '');
}

