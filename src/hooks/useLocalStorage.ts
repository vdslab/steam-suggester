import { useState, useEffect } from 'react';

const useLocalStorage = (key: string, initialValue: any) => {
  // ローカルストレージからデータを読み込む
  const readValue = () => {
    // ブラウザがローカルストレージをサポートしているか確認する
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // useStateでvalueとsetValueを設定する
  const [value, setValue] = useState(() => {
    return readValue();
  });

  // ローカルストレージにデータを保存する
  const writeValue = (newValue: any) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  };

  // useEffectを使って、valueが変更されたらローカルストレージに書き込む
  useEffect(() => {
    writeValue(value);
  }, [value]);

  return [value, setValue];
};

export default useLocalStorage;
