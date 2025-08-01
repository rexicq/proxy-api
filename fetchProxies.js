onst ProxyLists = require('proxy-lists');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');

function getProxiesFromProxyLists() {
  return new Promise((resolve, reject) => {
    const proxies = [];
    const gettingProxies = ProxyLists.getProxies({
      protocols: ['socks5'],
      countries: ['us', 'de', 'fr', 'nl', 'ru', 'ca', 'gb'],
      timeout: 10000
    });

    gettingProxies.on('data', (proxiesBatch) => {
      proxiesBatch.forEach(proxy => {
        proxies.push(`${proxy.ip}:${proxy.port}`);
      });
    });

    gettingProxies.on('error', reject);

    gettingProxies.on('end', () => {
      resolve(proxies);
    });
  });
}

async function checkProxy(proxy) {
  const agent = new SocksProxyAgent(`socks5://${proxy}`);
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      agent,
      timeout: 5000
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function fetchAndCheckProxies(limit = 100) {
  const rawProxies = await getProxiesFromProxyLists();
  const checked = [];

  for (const proxy of rawProxies) {
    const isWorking = await checkProxy(proxy);
    if (isWorking) {
      checked.push(`socks5://${proxy}`);
      console.log(`✅ Working: ${proxy}`);
    } else {
      console.log(`❌ Failed: ${proxy}`);
    }

    if (checked.length >= limit) break;
  }

  return checked;
}

module.exports = fetchAndCheckProxies;
