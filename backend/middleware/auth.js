const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'laguna-cafe-secret-key-2026';

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'Administrator') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

module.exports = { generateToken, authenticate, adminOnly };
