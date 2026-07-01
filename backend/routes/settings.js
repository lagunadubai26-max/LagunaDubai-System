const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});

router.put('/', (req, res) => {
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const txn = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      update.run(key, String(value));
    }
  });
  txn(req.body);
  res.json({ success: true });
});

module.exports = router;
