const express = require('express');
const fetchProxies = require('./fetchProxies');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxies', async (req, res) => {
  try {
    const proxies = await fetchProxies();
    res.json(proxies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proxies' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy API listening on port ${PORT}`);
});
