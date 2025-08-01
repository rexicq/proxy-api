const axios = require('axios');

module.exports = async function fetchProxies() {
  const url = 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=2000&country=all&ssl=all&anonymity=all';

  const { data } = await axios.get(url);
  const proxies = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.includes(':'))
    .slice(0, 100) // максимум 100
    .map(addr => `socks5://${addr}`);

  return proxies;
};
