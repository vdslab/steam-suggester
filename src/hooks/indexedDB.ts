// データベースを開く
let db: IDBDatabase;
let dbInitialized: Promise<IDBDatabase>;

const request: IDBOpenDBRequest = indexedDB.open('steamNetwork', 1);

request.onupgradeneeded = function(event: IDBVersionChangeEvent) {
  db = (event.target as IDBOpenDBRequest).result;

  if (!db.objectStoreNames.contains('networkFilter')) {
    const networkFilterStore: IDBObjectStore = db.createObjectStore('networkFilter', { keyPath: 'id' });
    networkFilterStore.createIndex('Categories', 'Categories', { unique: false });
    networkFilterStore.createIndex('Price', 'Price', { unique: false });
    networkFilterStore.createIndex('Platforms', 'Platforms', { unique: false });
    networkFilterStore.createIndex('device', 'device', { unique: false });
    networkFilterStore.createIndex('Playtime', 'Playtime', { unique: false });
  }
};

request.onsuccess = function(event: Event) {
  db = (event.target as IDBOpenDBRequest).result;
  console.log('Database opened successfully');
};

request.onerror = function(event: Event) {
  console.error('Database error:', (event.target as IDBOpenDBRequest).error);
};

// データベースが初期化されるのを待つPromise
dbInitialized = new Promise((resolve, reject) => {
  request.onsuccess = function(event: Event) {
    db = (event.target as IDBOpenDBRequest).result;
    console.log('Database opened successfully');
    resolve(db);
  };

  request.onerror = function(event: Event) {
    console.error('Database error:', (event.target as IDBOpenDBRequest).error);
    reject((event.target as IDBOpenDBRequest).error);
  };
});

// データを追加する
export async function addFilterData(data: { id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; }) {
  const db = await dbInitialized;
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
export async function getFilterData(key: string): Promise<{ id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; } | null> {
  const db = await dbInitialized;
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
export async function updateFilterData(data: { id: string; Categories: { [key: string]: boolean }; Price: { [key: string]: boolean }; Platforms: { [key: string]: boolean }; device: { [key: string]: boolean }; Playtime: { [key: string]: boolean }; }) {
  const db = await dbInitialized;
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
