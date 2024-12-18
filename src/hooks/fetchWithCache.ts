const cache: { [key: string]: { data: any; timestamp: number } } = {};

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 1日（ミリ秒）

const fetchWithCache = async (url: string): Promise<any> => {
  const now = Date.now();
  const cached = cache[url];

  if (cached && now - cached.timestamp < CACHE_EXPIRATION) {
    return cached.data;
  }

  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    cache[url] = { data, timestamp: now };
    return data;
  } else {
    throw new Error(`Failed to fetch ${url}`);
  }
};

export default fetchWithCache;