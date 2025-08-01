const ProxyLists = require('proxy-lists');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

function getProxiesFromProxyLists() {
  return new Promise((resolve, reject) => {
    const proxies = [];
    const gettingProxies = ProxyLists.getProxies({
  protocols: ['socks5'],
  timeout: 10000,
  // Явно указываем источники (без checkerproxy)
  sources: ['freeproxylists', 'proxydb',  'sslproxies']
});

    gettingProxies.on('data', (proxiesBatch) => {
      proxiesBatch.forEach(proxy => {
        proxies.push(`${proxy.ip}:${proxy.port}`);
      });
    });

    gettingProxies.on('error', err => {
      console.error('ProxyLists error:', err);
      // reject(err); // Можно не прерывать сразу, просто логировать
    });

    gettingProxies.on('end', () => {
      console.log(`ProxyLists ended, total proxies found: ${proxies.length}`);
      resolve(proxies);
    });
  });
}

async function checkProxy(proxy) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const agent = new SocksProxyAgent(`socks5://${proxy}`);

  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      agent,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    clearTimeout(timeoutId);
    return false;
  }
}

async function fetchAndCheckProxies(limit = 100) {
  console.log('Starting fetchAndCheckProxies...');
  const rawProxies = await getProxiesFromProxyLists();
  const checked = [];

  // Параллельная проверка с concurrency limit
  const concurrency = 5;
  let index = 0;

  async function worker() {
    while (index < rawProxies.length && checked.length < limit) {
      const proxy = rawProxies[index++];
      const isWorking = await checkProxy(proxy);
      if (isWorking) {
        checked.push(`socks5://${proxy}`);
        console.log(`✅ Working: ${proxy}`);
      } else {
        console.log(`❌ Failed: ${proxy}`);
      }
    }
  }

  // Запускаем несколько "воркеров"
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  console.log(`Checked proxies, working count: ${checked.length}`);
  return checked;
}

module.exports = fetchAndCheckProxies;
