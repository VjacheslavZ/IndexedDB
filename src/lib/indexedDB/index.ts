type TTransactionMode = 'readonly' | 'readwrite';
type TStore = Record<string, { keyPath: string; autoIncrement: boolean }>;

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
        for (const [storeName, { keyPath, autoIncrement }] of stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath, autoIncrement });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createTransaction(
    storesNames: string[],
    mode: TTransactionMode
  ): Promise<IDBTransaction> {
    return new Promise(resolve => {
      const tx = this.#db.transaction(storesNames, mode);
      resolve(tx);
    });
  }

  exec(
    storeName: string,
    mode: TTransactionMode,
    operation: (arg: IDBObjectStore) => void
  ) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.#db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = operation(store);
        tx.oncomplete = () => {
          console.log('exec oncomplete');
          resolve(result);
        };
        tx.onerror = () => reject(tx.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async useTransaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    callback: (
      tx: IDBTransaction,
      stores: { [name: string]: IDBObjectStore }
    ) => Promise<T>
  ) {
    return new Promise<T>((resolve, reject) => {
      const tx = this.#db.transaction(storeNames, mode);

      const stores: { [name: string]: IDBObjectStore } = {};
      for (const storeName of storeNames) {
        stores[storeName] = tx.objectStore(storeName);
      }

      tx.onerror = () => {
        console.log('useTransaction tx.onerror');
        reject(tx.error);
      };
      tx.onabort = () => {
        console.log('useTransaction tx.onabort');
        reject(tx.error || new Error('Transaction was aborted'));
      };

      callback(tx, stores)
        .then(result => {
          tx.oncomplete = () => {
            console.log('useTransaction then tx.oncomplete');
            resolve(result);
          };
        })
        .catch(error => {
          console.log('useTransaction catch');
          tx.abort();
          reject(error);
        });
    });
  }

  async add(storeName: string, data: unknown) {
    return this.exec(storeName, 'readwrite', store => {
      store.add(data);
    });
  }

  async get(storeName: string, key: IDBValidKey) {
    return this.exec(storeName, 'readonly', store => {
      const request = store.get(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getAll(storeName: string) {
    return this.exec(storeName, 'readonly', store => {
      const req = store.getAll();
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async update(storeName: string, data: unknown) {
    return this.exec(storeName, 'readwrite', store => store.put(data));
  }

  async delete(storeName: string, key: IDBValidKey) {
    return this.exec(storeName, 'readwrite', store => {
      return store.delete(key);
    });
  }

  async openCursor(storeName: string, callback: (value: unknown) => unknown) {
    // todo async iterator
    return this.exec(storeName, 'readonly', store => {
      const cursorRequest = store.openCursor();
      const results: unknown[] = [];
      return new Promise((resolve, reject) => {
        cursorRequest.onsuccess = (event: Event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (!cursor) return resolve(results);
          const result = callback(cursor.value);
          if (result) results.push(result);
          cursor.continue();
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    });
  }

  async updateById(storeName: string, id: number, data: unknown) {}
}
