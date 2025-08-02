const express = require('express');
const fetchProxies = require('./fetchProxies'); // возвращает [{ip, port, username, password}, ...]
const checkProxy = require('./checkProxy'); // проверка SOCKS5 с авторизацией
const app = express();
const PORT = process.env.PORT || 3000;

let cachedProxies = [];

async function updateProxyCache() {
  try {
    console.log(`[${new Date().toISOString()}] Начинаем обновлять кэш прокси`);
    const newProxies = await fetchProxies();
    console.log(`[${new Date().toISOString()}] Получено прокси: ${newProxies.length}`);

    const workingProxies = [];

    // Проверяем прокси последовательно, чтобы не нагружать сеть сильно
    for (const proxy of newProxies) {
      try {
        const ok = await checkProxy(proxy);
        if (ok) {
          workingProxies.push(proxy);
          console.log(`✅ Рабочий прокси: ${proxy.ip}:${proxy.port}`);
        } else {
          console.log(`❌ Не работает: ${proxy.ip}:${proxy.port}`);
        }
      } catch (e) {
        console.error(`Ошибка проверки прокси ${proxy.ip}:${proxy.port}`, e);
      }
      // Можно добавить небольшую задержку здесь, если нужно
    }

    if (workingProxies.length > 0) {
      cachedProxies = workingProxies;
      console.log(`[${new Date().toISOString()}] Кэш обновлен. Рабочих прокси: ${cachedProxies.length}`);
    } else {
      console.warn(`[${new Date().toISOString()}] Нет рабочих прокси для обновления кэша`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Ошибка при обновлении прокси: ${err.message}`, err);
  }
}

// Запускаем обновление кэша при старте и потом каждые 5 минут
updateProxyCache();
setInterval(updateProxyCache, 5 * 60 * 1000);

app.get('/proxies', (req, res) => {
  console.log(`[${new Date().toISOString()}] Запрос /proxies, прокси в кеше: ${cachedProxies.length}`);
  res.json(cachedProxies.slice(0, 100));
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy API сервер запущен на порту ${PORT}`);
});
