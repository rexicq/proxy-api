const express = require('express');
const fetchProxies = require('./fetchProxies');
const app = express();
const PORT = process.env.PORT || 3000;

let cachedProxies = [];

// Функция для обновления кэша
async function updateProxyCache() {
  try {
    const newProxies = await fetchProxies();
    if (newProxies.length > 0) {
      cachedProxies = newProxies;
      console.log(`✅ Обновлено ${newProxies.length} прокси`);
    } else {
      console.warn("⚠️ Получен пустой список — кэш не обновлён");
    }
  } catch (err) {
    console.error("❌ Ошибка при обновлении прокси:", err.message);
  }
}

// Обновляем кэш при запуске
updateProxyCache();

// Затем — обновляем каждые 5 минут
setInterval(updateProxyCache, 5 * 60 * 1000);

// Endpoint
app.get('/proxies', (req, res) => {
  res.json(cachedProxies.slice(0, 100)); // отдаем до 100 прокси
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
