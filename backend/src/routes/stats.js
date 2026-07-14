const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { mean } = require('../utils/stats');
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Recomputed lazily on the next request whenever this is null
let cache = null;

// Invalidate the cache whenever the underlying data file changes on disk,
// so a POST /api/items doesn't leave stale stats cached indefinitely
fs.watch(DATA_PATH, () => {
  cache = null;
});

// GET /api/stats
router.get('/', (req, res, next) => {
  if (cache) {
    return res.json(cache);
  }

  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return next(err);

    try {
      const items = JSON.parse(raw);
      cache = {
        total: items.length,
        averagePrice: mean(items.map(item => item.price)),
      };
      res.json(cache);
    } catch (parseErr) {
      next(parseErr);
    }
  });
});

module.exports = router;