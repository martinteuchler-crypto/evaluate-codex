// Minimal optional server storing backups on disk.
const express = require('express');
const fs = require('fs/promises');

const app = express();
app.use(express.json());

app.get('/backup/export', async (_req, res) => {
  try {
    const data = await fs.readFile('backup.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json({});
  }
});

app.post('/backup/import', async (req, res) => {
  await fs.writeFile('backup.json', JSON.stringify(req.body));
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
if (process.env.FEATURE_SERVER === 'true') {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}
