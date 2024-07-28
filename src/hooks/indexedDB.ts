import { Filter } from "@/types/api/FilterType";

let db: IDBDatabase;
let dbInitialized: Promise<IDBDatabase>;

if (typeof window !== 'undefined') {
  const request: IDBOpenDBRequest = indexedDB.open('steamNetwork', 1);

  request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    db = (event.target as IDBOpenDBRequest).result;

    if (!db.objectStoreNames.contains('networkFilter')) {
      const networkFilterStore: IDBObjectStore = db.createObjectStore('networkFilter', { keyPath: 'id' });
      networkFilterStore.createIndex('Categories', 'Categories', { unique: false });
      networkFilterStore.createIndex('Price', 'Price', { unique: false });
      networkFilterStore.createIndex('Mode', 'Mode', { unique: false });
      networkFilterStore.createIndex('Device', 'Device', { unique: false });
      networkFilterStore.createIndex('Playtime', 'Playtime', { unique: false });
    }
  };

  request.onsuccess = function (event: Event) {
    db = (event.target as IDBOpenDBRequest).result;
    console.log('Database opened successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Database error:', (event.target as IDBOpenDBRequest).error);
  };

  // データベースが初期化されるのを待つPromise
  dbInitialized = new Promise((resolve, reject) => {
    request.onsuccess = function (event: Event) {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onerror = function (event: Event) {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function addFilterData(data: Filter) {
  if (typeof window === 'undefined') return;

  const db = await dbInitialized;
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.add({id: "unique_id", ...data});

  request.onsuccess = function (event: Event) {
    console.log('Data added successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Error adding data:', (event.target as IDBRequest).error);
  };
}

export async function getFilterData(): Promise<Filter | null> {
  if (typeof window === 'undefined') return null;

  const db = await dbInitialized;
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['networkFilter']);
    const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
    const request: IDBRequest = objectStore.get('unique_id');

    request.onsuccess = function (event: Event) {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('Data retrieved successfully:', result);
        const filterResult: Filter = {
          Categories: result.Categories,
          Price: result.Price,
          Mode: result.Mode,
          Device: result.Device,
          Playtime: result.Playtime
        }
        resolve(filterResult);
      } else {
        console.log('No data found for key: unique_id');
        resolve(null);
      }
    };

    request.onerror = function (event: Event) {
      console.error('Error retrieving data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function updateFilterData(data: Filter) {
  if (typeof window === 'undefined') return;

  const db = await dbInitialized;
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.put({id: "unique_id", ...data});

  request.onsuccess = function (event: Event) {
    console.log('Data updated successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Error updating data:', (event.target as IDBRequest).error);
  };
}