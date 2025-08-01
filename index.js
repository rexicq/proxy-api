const express = require('express');
const fetchProxies = require('./fetchProxies'); // функция из fetchProxies.js
const app = express();
const PORT = process.env.PORT || 3000;

let cachedProxies = [];

// 🔁 Обновление кэша SOCKS5-прокси
async function updateProxyCache() {
  try {
    console.log(`[${new Date().toISOString()}] Начинаем обновлять кэш прокси`);
    const newProxies = await fetchProxies();
    console.log(`[${new Date().toISOString()}] Получено прокси: ${newProxies.length}`);
    if (newProxies.length > 0) {
      cachedProxies = newProxies;
      console.log(`[${new Date().toISOString()}] Кэш обновлен`);
    } else {
      console.warn(`[${new Date().toISOString()}] Получен пустой список — кэш не обновлён`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Ошибка при обновлении прокси: ${err.message}`, err);
  }
}

// 🚀 Обновляем кэш при запуске
updateProxyCache();

// ⏰ Обновляем каждые 5 минут
setInterval(updateProxyCache, 5 * 60 * 1000);

// 📦 Endpoint: GET /proxies — отдаёт до 100 SOCKS5-прокси
app.get('/proxies', (req, res) => {
  console.log(`[${new Date().toISOString()}] Запрос /proxies, прокси в кеше: ${cachedProxies.length}`);
  res.json(cachedProxies.slice(0, 100));
});

// ▶️ Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Proxy API сервер запущен: http://localhost:${PORT}`);
});
