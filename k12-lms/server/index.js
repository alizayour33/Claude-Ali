'use strict';
const { createApp } = require('./app');

const port = Number(process.env.PORT || 4000);
const app = createApp({ dataDir: process.env.DATA_DIR });

app.listen(port, () => {
  console.log(`K-12 LMS running at http://localhost:${port}`);
  if (!process.env.ADMIN_KEY) console.log('Tip: set ADMIN_KEY=... to require a teacher key for uploads.');
});
