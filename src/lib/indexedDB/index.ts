import PromisifyTransaction from './promisifyTransaction';

type TTransactionMode = 'readonly' | 'readwrite';
type TStore = Record<
  string,
  { keyPath: string; autoIncrement: boolean; index?: string }
>;

export class IndexedDB {
  #db!: IDBDatabase;
  #dbName: string;
  #version: number;
  #stores: TStore;

  constructor(options: { name: string; version: number; stores: TStore }) {
    this.#dbName = options.name;
    this.#version = options.version;
    this.#stores = options.stores;

    this.init();
  }

  async init() {
    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName, this.#version);
      request.onupgradeneeded = () => {
        const db = request.result;
        const stores = Object.entries(this.#stores);
        for (const [storeName, { keyPath, autoIncrement, index }] of stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            const result = db.createObjectStore(storeName, {
              keyPath,
              autoIncrement,
            });
            console.log('index', index);
            if (index) {
              result.createIndex(index, index, { unique: false });
            }
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  #exec(
    storeName: string,
    mode: TTransactionMode,
    operation: (arg: IDBObjectStore) => void
  ) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.#db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = operation(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async useTransaction<T>(
    storeNames: string[] | string,
    mode: IDBTransactionMode,
    callback: ({
      tx,
      stores,
    }: {
      tx: IDBTransaction;
      stores: { [name: string]: PromisifyTransaction };
    }) => Promise<T>
  ) {
    const isArrayStores = Array.isArray(storeNames);
    const storeNamesArray = isArrayStores ? storeNames : [storeNames];
    // @ts-ignore
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    const tx = this.#db.transaction(storeNames, mode);

    const stores: { [name: string]: PromisifyTransaction } = {};
    for (const storeName of storeNamesArray) {
      stores[storeName] = new PromisifyTransaction(tx.objectStore(storeName));
    }

    tx.onerror = () => reject(tx.error);
    tx.onabort = () => console.log('useTransaction tx.onabort');

    try {
      const result = await callback({ tx, stores });
      tx.oncomplete = () => resolve(result);
    } catch (error) {
      tx.abort();
      reject(error);
    }

    return promise;
  }

  async add(storeName: string, data: unknown) {
    return this.#exec(storeName, 'readwrite', store => {
      store.add(data);
    });
  }

  async get(storeName: string, key: IDBValidKey) {
    return this.#exec(storeName, 'readonly', store => {
      const request = store.get(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getAll(storeName: string) {
    return this.#exec(storeName, 'readonly', store => {
      const req = store.getAll();
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async update(storeName: string, data: unknown) {
    return this.#exec(storeName, 'readwrite', store => store.put(data));
  }

  async delete(storeName: string, key: IDBValidKey) {
    return this.#exec(storeName, 'readwrite', store => {
      return store.delete(key);
    });
  }

  async openCursor(
    storeName: string,
    query: IDBKeyRange | null = null,
    direction: IDBCursorDirection = 'next',
    indexName?: string
  ) {
    return this.#exec(storeName, 'readonly', store => {
      const source = indexName ? store.index(indexName) : store;
      const cursorRequest = source.openCursor(query, direction);
      const results: unknown[] = [];

      return new Promise((resolve, reject) => {
        cursorRequest.onsuccess = (e: Event) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (!cursor) return resolve(results);
          results.push(cursor.value);
          cursor.continue();
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    });
  }

  async openAsyncCursor(
    storeName: string,
    query: IDBKeyRange | null,
    direction: IDBCursorDirection = 'next',
    indexName?: string
  ) {
    const tx = this.#db.transaction(storeName, 'readonly');
    const source = indexName
      ? tx.objectStore(storeName).index(indexName)
      : tx.objectStore(storeName);

    return {
      [Symbol.asyncIterator]() {
        let cursorRequest: IDBRequest<IDBCursorWithValue | null>;

        return {
          next(): Promise<IteratorResult<IDBCursorWithValue>> {
            return new Promise((resolve, reject) => {
              if (!cursorRequest) {
                try {
                  cursorRequest = source.openCursor(query, direction);
                } catch (error) {
                  return reject(error);
                }
              } else {
                try {
                  if (cursorRequest.result) cursorRequest.result.continue();
                  else return resolve({ value: undefined, done: true });
                } catch (error) {
                  return reject(error);
                }
              }

              cursorRequest.onsuccess = () => {
                const cursor = cursorRequest.result;
                if (cursor) resolve({ value: cursor, done: false });
                else resolve({ value: undefined, done: true });
              };
              cursorRequest.onerror = () => reject(cursorRequest.error);
            });
          },
        };
      },
    };
  }

  async updateById(storeName: string, id: number, data: unknown) {}
}

// {
//   // TODO
//   const users_db = new IndexedDB({
//     name: 'users',
//     version: 1,
//     stores: {
//       user: { keyPath: 'id', autoIncrement: true },
//       userLogs: { keyPath: 'id', autoIncrement: true },
//       baned_user: { keyPath: 'id', autoIncrement: true },
//     },
//   });
// }
