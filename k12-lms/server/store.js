'use strict';
// Tiny JSON-file store. Good enough for a showcase; swap for a real database later.
const fs = require('fs');
const path = require('path');

function createStore(file) {
  let data = { courses: [], attempts: {} };
  if (fs.existsSync(file)) {
    try { data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { /* start fresh */ }
  }
  let timer = null;
  function flush() {
    clearTimeout(timer); timer = null;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  }
  function save() { if (!timer) timer = setTimeout(flush, 50); }
  return { data, save, flush };
}

module.exports = { createStore };
