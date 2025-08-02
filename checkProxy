const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');

async function checkProxy(proxy) {
  const agent = new SocksProxyAgent(`socks5://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`);
  try {
    const response = await fetch('https://api.ipify.org?format=json', { agent });
    return response.ok;
  } catch (error) {
    console.error(`Ошибка при проверке прокси ${proxy.ip}:${proxy.port}`, error);
    return false;
  }
}
