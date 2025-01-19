export const INTERVAL_24H = 1000 * 60 * 60 * 24;

export const CACHE_UPDATE_EVERY_24H =
  {
      refreshInterval: 1000 * 60 * 60 * 24, // 24時間（ミリ秒）
      revalidateOnFocus: false, // フォーカス時に再検証しない
      revalidateIfStale: false, // データが期限切れでも自動で再検証しない
      revalidateOnReconnect: false, // 再接続時に再検証しない
  }