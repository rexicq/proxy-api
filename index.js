const express = require('express');
const fetchProxies = require('./fetchProxies'); // функция из fetchProxies.js
const app = express();
const PORT = process.env.PORT || 3000;

let cachedProxies = [];

// 🔁 Обновление кэша SOCKS5-прокси
async function updateProxyCache() {
  console.log("🌐 Обновление списка прокси...");
  try {
    const proxies = await fetchProxies(100); // запрашиваем до 100 работающих
    if (proxies.length > 0) {
      cachedProxies = proxies;
      console.log(`✅ Кэш обновлён: ${proxies.length} прокси`);
    } else {
      console.warn("⚠️ Получен пустой список — кэш не обновлён");
    }
  } catch (err) {
    console.error("❌ Ошибка обновления прокси:", err.message);
  }
}

// 🚀 Обновляем кэш при запуске
updateProxyCache();

// ⏰ Обновляем каждые 5 минут
setInterval(updateProxyCache, 5 * 60 * 1000);

// 📦 Endpoint: GET /proxies — отдаёт до 100 SOCKS5-прокси
app.get('/proxies', (req, res) => {
  if (cachedProxies.length === 0) {
    return res.status(503).json({ error: "Прокси ещё не загружены, попробуйте позже." });
  }
  res.json(cachedProxies.slice(0, 100));
});

// ▶️ Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Proxy API сервер запущен: http://localhost:${PORT}`);
});
