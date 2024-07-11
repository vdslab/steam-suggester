// データベースを開く
let db: IDBDatabase;

const request: IDBOpenDBRequest = indexedDB.open('steamNetwork', 2);  // バージョンを2に更新

request.onupgradeneeded = function(event: IDBVersionChangeEvent) {
  db = (event.target as IDBOpenDBRequest).result;

  // 'networkFilter'という名前のオブジェクトストアを作成
  if (!db.objectStoreNames.contains('networkFilter')) {
    const networkFilterStore: IDBObjectStore = db.createObjectStore('networkFilter', { keyPath: 'id' });
    networkFilterStore.createIndex('Categories', 'Categories', { unique: false });
    networkFilterStore.createIndex('Price', 'Price', { unique: false });
    networkFilterStore.createIndex('Platforms', 'Platforms', { unique: false });
    networkFilterStore.createIndex('device', 'device', { unique: false });
    networkFilterStore.createIndex('Playtime', 'Playtime', { unique: false });
  }

  // 'games'という名前のオブジェクトストアを作成
  if (!db.objectStoreNames.contains('games')) {
    const gamesStore: IDBObjectStore = db.createObjectStore('games', { keyPath: 'steamGameId' });
    gamesStore.createIndex('title', 'title', { unique: false });
    gamesStore.createIndex('imgURL', 'imgURL', { unique: false });
    gamesStore.createIndex('gameData', 'gameData', { unique: false });
    gamesStore.createIndex('twitchGameId', 'twitchGameId', { unique: false });
  }
};

request.onsuccess = function(event: Event) {
  db = (event.target as IDBOpenDBRequest).result;
  console.log('Database opened successfully');
};

request.onerror = function(event: Event) {
  console.error('Database error:', (event.target as IDBOpenDBRequest).error);
};

// データを追加する
export function addFilterData(data: { id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; }) {
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.add(data);

  request.onsuccess = function(event: Event) {
    console.log('Data added successfully');
  };

  request.onerror = function(event: Event) {
    console.error('Error adding data:', (event.target as IDBRequest).error);
  };
}

// データを取得する
export function getFilterData(key: string): Promise<{ id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; } | null> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['networkFilter']);
    const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
    const request: IDBRequest = objectStore.get(key);

    request.onsuccess = function(event: Event) {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('Data retrieved successfully:', result);
        resolve(result);
      } else {
        console.log('No data found for key:', key);
        resolve(null);
      }
    };

    request.onerror = function(event: Event) {
      console.error('Error retrieving data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// データの更新
export function updateFilterData(data: { id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; }) {
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.put(data);

  request.onsuccess = function(event: Event) {
    console.log('Data updated successfully');
  };

  request.onerror = function(event: Event) {
    console.error('Error updating data:', (event.target as IDBRequest).error);
  };
}

/* // データの削除
export function deleteData(key: string) {
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.delete(key);

  request.onsuccess = function(event: Event) {
    console.log('Data deleted successfully');
  };

  request.onerror = function(event: Event) {
    console.error('Error deleting data:', (event.target as IDBRequest).error);
  };
}
 */

// データを追加する
export function addGameData(data: { steamGameId: string; x: number; y: number; index: number; title: string; imgURL: string; gameData: { genres: { id: string, description: string }[]; price: number; isSinglePlayer: boolean; isMultiPlayer: boolean; platforms: { [key: string]: boolean } }; twitchGameId: string }) {
  return new Promise<void>((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['games'], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore('games');
    const request: IDBRequest = objectStore.add(data);

    request.onsuccess = function(event: Event) {
      console.log('Game data added successfully');
      resolve();
    };

    request.onerror = function(event: Event) {
      console.error('Error adding game data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// データを取得する
export function getGameData(key: string): Promise<{ steamGameId: string; x: number; y: number; index: number; title: string; imgURL: string; gameData: { genres: { id: string, description: string }[]; price: number; isSinglePlayer: boolean; isMultiPlayer: boolean; platforms: { [key: string]: boolean } }; twitchGameId: string } | null> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['games']);
    const objectStore: IDBObjectStore = transaction.objectStore('games');
    const request: IDBRequest = objectStore.get(key);

    request.onsuccess = function(event: Event) {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('Game data retrieved successfully:', result);
        resolve(result);
      } else {
        console.log('No data found for key:', key);
        resolve(null);
      }
    };

    request.onerror = function(event: Event) {
      console.error('Error retrieving game data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// データの更新
export function updateGameData(data: { steamGameId: string; x: number; y: number; index: number; title: string; imgURL: string; gameData: { genres: { id: string, description: string }[]; price: number; isSinglePlayer: boolean; isMultiPlayer: boolean; platforms: { [key: string]: boolean } }; twitchGameId: string }) {
  return new Promise<void>((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['games'], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore('games');
    const request: IDBRequest = objectStore.put(data);

    request.onsuccess = function(event: Event) {
      console.log('Game data updated successfully');
      resolve();
    };

    request.onerror = function(event: Event) {
      console.error('Error updating game data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}