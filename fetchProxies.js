const fetch = require('node-fetch');

const WEB_SHARE_API = 'https://proxy.webshare.io/api/v2/proxy/list/';
const API_KEY = 'lq0gd3lcdlarbj47gc1d37fa1p3156cxlm5itn4t'; // Замените на ваш API-ключ

async function fetchProxies(page = 1, pageSize = 100) {
  try {
    const url = new URL(WEB_SHARE_API);
    url.searchParams.append('mode', 'direct');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());

    const response = await fetch(url.href, {
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
if (!response.ok) {
  const text = await response.text(); // тело ошибки
  console.error(`Ошибка API Webshare: ${response.status} ${response.statusText}, тело: ${text}`);
  throw new Error(`Ошибка API Webshare: ${response.status}`);
}

    const data = await response.json();

    // Массив прокси с логином и паролем
    const proxies = data.results.map(proxy => ({
      ip: proxy.proxy_address,
      port: proxy.proxy_port,
      username: proxy.username,
      password: proxy.password,
    }));

    return proxies;

  } catch (error) {
    console.error('Ошибка при получении прокси:', error);
    return [];
  }
}

module.exports = fetchProxies;
