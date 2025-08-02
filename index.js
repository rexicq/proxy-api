const express = require('express');
const fetchProxies = require('./fetchProxies'); // Функция получения прокси
const checkProxy = require('./checkProxy'); // Функция проверки прокси

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxies', async (req, res) => {
  try {
    const proxies = await fetchProxies();
    const workingProxies = [];

    for (const proxy of proxies) {
      if (await checkProxy(proxy)) {
        workingProxies.push(proxy);
      }
    }

    res.json(workingProxies);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении прокси' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
