type CacheEntry = {
  timestamp: number;
  data: any;
};

const cache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

/**
 * キャッシュからデータを取得
 * @param key キャッシュキー
 * @returns キャッシュデータまたは null
 */
export const getCachedData = (key: string) => {
  const cached = cache[key];
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * キャッシュにデータを保存
 * @param key キャッシュキー
 * @param data 保存するデータ
 */
export const setCachedData = (key: string, data: any) => {
  cache[key] = { timestamp: Date.now(), data };
};
