const axios = require('axios');

module.exports = async function fetchProxies() {
  const url = 'https://proxylist.geonode.com/api/proxy-list?protocols=socks5&limit=100&page=1';

  try {
    const { data } = await axios.get(url);

    const proxies = (data.data || [])
      .map(proxy => {
        if (proxy.ip && proxy.port) {
          return `socks5://${proxy.ip}:${proxy.port}`;
        }
        return null;
      })
      .filter(Boolean);

    console.log('Fetched from GeoNode:', proxies);
    return proxies;
  } catch (err) {
    console.error('Error fetching from GeoNode:', err.message);
    return [];
  }
};
