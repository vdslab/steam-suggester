'use client';
import { SWRConfig } from 'swr'

type ErrorRetryOption = {
  onErrorRetry: (
    error: any,
    key: string,
    config: any,
    revalidate: (options: { retryCount: number }) => void,
    context: { retryCount: number }
  ) => void;
}

const cashOption ={
  refreshInterval: 1000 * 60 * 60 * 24, // 24時間（ミリ秒）
  revalidateOnFocus: false, // フォーカス時に再検証しない
  revalidateIfStale: false, // データが期限切れでも自動で再検証しない
  revalidateOnReconnect: false, // 再接続時に再検証しない
}

const errorRetryOption:ErrorRetryOption = {
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (error.status === 404) return // 404エラーの場合はリトライしない
    if (retryCount >= 5) return; // 5回以上リトライした場合はリトライしない
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig value={{ ...cashOption, ...errorRetryOption }}>
      {children}
    </SWRConfig>
  )
};