const express = require('express');
const fetchProxies = require('./fetchProxies');
const app = express();
const PORT = process.env.PORT || 3000;

let cachedProxies = [];

async function updateProxyCache() {
  try {
    const newProxies = await fetchProxies();
    if (newProxies.length > 0) {
      cachedProxies = newProxies;
    }
  } catch (err) {
    // Можно сохранить ошибку для отдачи в API
    cachedProxies = null;
    cachedProxiesError = err.message || 'Unknown error';
  }
}

updateProxyCache();
setInterval(updateProxyCache, 5 * 60 * 1000);

app.get('/proxies', (req, res) => {
  if (cachedProxies === null) {
    res.status(500).json({ error: cachedProxiesError || 'Failed to fetch proxies' });
  } else {
    res.json(cachedProxies.slice(0, 100));
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
