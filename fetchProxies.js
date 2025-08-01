const axios = require("axios");
const net = require("net");
const pLimit = require('p-limit').default;

const PROXY_SOURCE_URL = "https://proxylist.geonode.com/api/proxy-list?protocols=socks5&limit=100&page=1&sort_by=lastChecked&sort_type=desc";

let cachedProxies = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 минут

// Проверка подключения к example.com:80 через SOCKS5
async function fetchProxies(proxy, timeout = 5000) {
  return new Promise((resolve) => {
    const [host, port] = proxy.split(":");
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.connect(parseInt(port), host, () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

// Ограничиваем параллельные проверки (пул 10)
const limit = pLimit(10);

async function fetchAndCheckProxies() {
  try {
    const res = await axios.get(PROXY_SOURCE_URL);
    const rawProxies = res.data.data.map(
      (p) => `${p.ip}:${p.port}`
    );

    const checkPromises = rawProxies.map((proxy) =>
      limit(() =>
        checkSocks5(proxy).then((ok) => (ok ? `socks5://${proxy}` : null))
      )
    );

    const results = await Promise.all(checkPromises);
    return results.filter(Boolean);
  } catch (err) {
    console.error("Ошибка при загрузке прокси:", err);
    return [];
  }
}

async function getCachedProxies() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION_MS && cachedProxies.length > 0) {
    return cachedProxies;
  }

  const proxies = await fetchAndCheckProxies();
  cachedProxies = proxies;
  lastFetchTime = now;
  return proxies;
}

module.exports = { getCachedProxies };
