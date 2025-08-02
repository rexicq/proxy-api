const fetch = require('node-fetch');

const WEB_SHARE_API = 'https://proxy.webshare.io/api/v2/proxy/list/';
const API_KEY = 'your_api_key_here'; // Замените на ваш API-ключ

async function fetchProxies() {
  try {
    const response = await fetch(WEB_SHARE_API, {
      headers: {
        'Authorization': `Token ${lq0gd3lcdlarbj47gc1d37fa1p3156cxlm5itn4t}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка API Webshare: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map(proxy => ({
      ip: proxy.proxy_address,
      port: proxy.proxy_port,
      username: proxy.username,
      password: proxy.password,
    }));
  } catch (error) {
    console.error('Ошибка при получении прокси:', error);
    return [];
  }
}
